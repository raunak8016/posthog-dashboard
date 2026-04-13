import httpx
import os
from fastapi import HTTPException

GITHUB_BASE = "https://api.github.com"
REPO = "PostHog/posthog"


def _headers():
    token = os.getenv("GITHUB_TOKEN")
    h = {"Accept": "application/vnd.github.v3+json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


async def get_pulls(page: int = 1) -> list:
    url = f"{GITHUB_BASE}/repos/{REPO}/pulls"
    params = {
        "state": "closed",
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
        "page": page,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, headers=_headers(), params=params)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    return r.json()


async def get_reviews(pr_number: int) -> list:
    url = f"{GITHUB_BASE}/repos/{REPO}/pulls/{pr_number}/reviews"
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, headers=_headers())
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    return r.json()


async def get_reviews_batch(pr_numbers: list, concurrency: int = 10) -> dict:
    """Fetch reviews for multiple PR numbers in parallel and return a mapping {pr_number: reviews}.

    concurrency: limit amount of concurrent requests to GitHub.
    """
    import asyncio

    results = {}

    semaphore = asyncio.Semaphore(concurrency)

    async with httpx.AsyncClient(timeout=15) as client:
        async def fetch_one(pr):
            url = f"{GITHUB_BASE}/repos/{REPO}/pulls/{pr}/reviews"
            async with semaphore:
                r = await client.get(url, headers=_headers())
            if r.status_code == 200:
                try:
                    results[pr] = r.json()
                except Exception:
                    results[pr] = []
            else:
                results[pr] = []

        tasks = [asyncio.create_task(fetch_one(p)) for p in pr_numbers]
        await asyncio.gather(*tasks)

    return results
