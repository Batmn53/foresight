"""API routes package root."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.github import router as github_router
from app.api.metrics import router as metrics_router
from app.api.bottlenecks import router as bottlenecks_router
from app.api.risk import router as risk_router
from app.api.release import router as release_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(github_router, prefix="/github", tags=["github"])
api_router.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
api_router.include_router(bottlenecks_router, prefix="/bottlenecks", tags=["bottlenecks"])
api_router.include_router(risk_router, prefix="/risk", tags=["risk"])
api_router.include_router(release_router, prefix="/release", tags=["release"])

__all__ = ["api_router"]
