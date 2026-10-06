"""GitHub integration and ingestion API routes."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import RepositoryRead, SyncTriggerRequest, SyncStatusResponse

router = APIRouter()


@router.get("/repositories", response_model=List[RepositoryRead], summary="List connected repositories")
async def list_repositories(db: AsyncSession = Depends(get_db)):
    """List all tracked repositories for the current user/organization."""
    # TODO: Query repositories from database
    return []


@router.post("/sync", response_model=SyncStatusResponse, summary="Trigger repository ingestion sync")
async def trigger_sync(payload: SyncTriggerRequest, db: AsyncSession = Depends(get_db)):
    """Trigger background or immediate ingestion sync for a repository."""
    # TODO: Invoke IngestionService.sync_repository
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Ingestion sync trigger is not yet implemented.",
    )


@router.get("/sync/status/{sync_id}", response_model=SyncStatusResponse, summary="Get sync job status")
async def get_sync_status(sync_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get the current progress/status of an ingestion sync job."""
    # TODO: Query sync_runs table by sync_id
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Sync status endpoint is not yet implemented.",
    )
