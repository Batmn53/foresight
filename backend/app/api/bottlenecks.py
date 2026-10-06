"""Bottleneck detection API routes."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import BottleneckSummaryResponse, BottleneckReviewQueueItem

router = APIRouter()


@router.get("/review-queue", response_model=List[BottleneckReviewQueueItem], summary="Get PR review queue bottlenecks")
async def get_review_queue(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve PRs experiencing long review turnaround delays."""
    # TODO: Invoke BottleneckService.get_review_queue
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Review queue analysis is not yet implemented.",
    )


@router.get("/summary", response_model=BottleneckSummaryResponse, summary="Get bottleneck summary")
async def get_bottleneck_summary(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve team-level bottleneck insights."""
    # TODO: Invoke BottleneckService.get_bottleneck_summary
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Bottleneck summary is not yet implemented.",
    )
