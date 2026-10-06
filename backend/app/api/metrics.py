"""Engineering productivity metrics API routes."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import TimeToMergeMetric, BuildFailureRateMetric, MetricTrendsResponse
from app.services.metrics_service import MetricsService

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
    service = MetricsService(db)
    return await service.get_time_to_merge(repository_id, days)


@router.get("/build-failures", response_model=BuildFailureRateMetric, summary="Get CI build failure rate")
async def get_build_failures(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    days: int = Query(30, ge=1, le=365, description="Lookback window in days"),
    db: AsyncSession = Depends(get_db),
):
    """Calculate CI workflow failure rate considering only completed runs."""
    service = MetricsService(db)
    return await service.get_build_failure_rate(repository_id, days)


@router.get("/trends", response_model=MetricTrendsResponse, summary="Get metric trend time-series")
async def get_trends(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    days: int = Query(30, ge=1, le=365, description="Lookback window in days"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch aggregated trend charts data for team dashboard."""
    service = MetricsService(db)
    data = await service.get_trends(repository_id, days)
    return MetricTrendsResponse(
        repository_id=repository_id,
        time_window_days=days,
        data_points=data
    )
