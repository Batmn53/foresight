"""Release readiness evaluation API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.database import get_db
from app.schemas import ReleaseReadinessResponse
from app.services.release_service import ReleaseService

router = APIRouter()

@router.get("/readiness", response_model=ReleaseReadinessResponse, summary="Get release readiness status")
async def get_release_readiness(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve release readiness score and blocking factors."""
    service = ReleaseService(db)
    return await service.get_release_readiness(repository_id)
