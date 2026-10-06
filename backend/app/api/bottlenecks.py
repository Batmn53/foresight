"""Bottleneck detection API routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.database import get_db
from app.schemas import BottleneckSummaryResponse, BottleneckReviewQueueItem
from app.services.bottleneck_service import BottleneckService

router = APIRouter()

@router.get("/review-queue", response_model=List[BottleneckReviewQueueItem], summary="Get PR review queue bottlenecks")
async def get_review_queue(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve PRs experiencing long review turnaround delays."""
    service = BottleneckService(db)
    return await service.get_review_queue(repository_id)


@router.get("/summary", response_model=BottleneckSummaryResponse, summary="Get bottleneck summary")
async def get_bottleneck_summary(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve team-level bottleneck insights."""
    service = BottleneckService(db)
    return await service.get_bottleneck_summary(repository_id)
