"""Engineering productivity metrics API routes."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import TimeToMergeMetric, BuildFailureRateMetric, MetricTrendsResponse

router = APIRouter()


@router.get("/time-to-merge", response_model=TimeToMergeMetric, summary="Get PR time-to-merge metrics")
async def get_time_to_merge(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    days: int = Query(30, ge=1, le=365, description="Lookback window in days"),
    db: AsyncSession = Depends(get_db),
):
    """Calculate time-to-merge metrics (created_at to merged_at).

    Never reflects individual developer working time.
    """
    # TODO: Invoke MetricsService.get_time_to_merge
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Time-to-merge metric calculation is not yet implemented.",
    )


@router.get("/build-failures", response_model=BuildFailureRateMetric, summary="Get CI build failure rate")
async def get_build_failures(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    days: int = Query(30, ge=1, le=365, description="Lookback window in days"),
    db: AsyncSession = Depends(get_db),
):
    """Calculate CI workflow failure rate considering only completed runs."""
    # TODO: Invoke MetricsService.get_build_failure_rate
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Build failure metric calculation is not yet implemented.",
    )


@router.get("/trends", response_model=MetricTrendsResponse, summary="Get metric trend time-series")
async def get_trends(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    days: int = Query(30, ge=1, le=365, description="Lookback window in days"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch aggregated trend charts data for team dashboard."""
    # TODO: Invoke MetricsService.get_trends
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Trends metric calculation is not yet implemented.",
    )
