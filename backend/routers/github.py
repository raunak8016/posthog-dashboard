from fastapi import APIRouter
from services.github_client import get_pulls, get_reviews

router = APIRouter(prefix="/api")


@router.get("/prs")
async def prs(page: int = 1):
    return await get_pulls(page)


@router.get("/reviews/{pr_number}")
async def reviews(pr_number: int):
    return await get_reviews(pr_number)