from fastapi import APIRouter, HTTPException, Query, Body
from services.github_client import get_pulls, get_reviews, get_reviews_batch

router = APIRouter(prefix="/api")


@router.get("/prs")
async def prs(page: int = 1):
    return await get_pulls(page)


@router.get("/reviews/batch")
async def reviews_batch_get(prs: str = Query(..., description="comma-separated PR numbers, e.g. 54178,54179")):
    """GET convenience endpoint: /api/reviews/batch?prs=54178,54179"""
    try:
        nums = [int(p) for p in prs.split(",") if p.strip()]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prs query parameter; must be comma-separated integers")
    return await get_reviews_batch(nums)


@router.get("/reviews/{pr_number}")
async def reviews(pr_number: int):
    return await get_reviews(pr_number)


@router.post("/reviews/batch")
async def reviews_batch(pr_numbers: list[int] = Body(..., description="JSON array of PR numbers")):
    """Accepts JSON array of PR numbers and returns a mapping {pr_number: [reviews]}"""
    return await get_reviews_batch(pr_numbers)