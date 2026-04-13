from fastapi import APIRouter
from services.github_client import get_pulls, get_reviews
from services.github_client import get_reviews_batch

router = APIRouter(prefix="/api")


@router.get("/prs")
async def prs(page: int = 1):
    return await get_pulls(page)


@router.get("/reviews/{pr_number}")
async def reviews(pr_number: int):
    return await get_reviews(pr_number)


@router.post("/reviews/batch")
async def reviews_batch(pr_numbers: list):
    """Accepts JSON array of PR numbers and returns a mapping {pr_number: [reviews]}"""
    return await get_reviews_batch(pr_numbers)