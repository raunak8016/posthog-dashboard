from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.github import router

load_dotenv()

app = FastAPI(title="PostHog Impact Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your GitHub Pages URL in production
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}