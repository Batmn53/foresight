"""Release readiness evaluation API routes."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import ReleaseReadinessResponse

router = APIRouter()


@router.get("/readiness", response_model=ReleaseReadinessResponse, summary="Get release readiness status")
async def get_release_readiness(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve release readiness score and blocking factors."""
    # TODO: Invoke ReleaseService.get_release_readiness
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Release readiness check is not yet implemented.",
    )
