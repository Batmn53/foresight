"""Metrics calculation service.

Enforces team-level metric governance rules:
- Time-to-merge: pr_created_at to pr_merged_at
- Build failure rate: completed runs only (excludes running/cancelled)
- Strictly no individual developer evaluation or ranking
"""

import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import TimeToMergeMetric, BuildFailureRateMetric, TrendDataPoint


class MetricsService:
    """Computes aggregated repository and team level delivery metrics."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_time_to_merge(
        self, repository_id: uuid.UUID, days: int = 30
    ) -> TimeToMergeMetric:
        """Calculate average, median, and p90 time-to-merge for merged PRs."""
        # TODO: Query merged PRs within window and compute percentiles
        raise NotImplementedError("MetricsService.get_time_to_merge is not implemented yet.")

    async def get_build_failure_rate(
        self, repository_id: uuid.UUID, days: int = 30
    ) -> BuildFailureRateMetric:
        """Calculate CI workflow failure rate considering only completed runs."""
        # TODO: Query workflow_runs with valid conclusion and compute failure %
        raise NotImplementedError("MetricsService.get_build_failure_rate is not implemented yet.")

    async def get_trends(
        self, repository_id: uuid.UUID, days: int = 30
    ) -> List[TrendDataPoint]:
        """Generate time-series trend metrics over the requested window."""
        # TODO: Aggregate daily/weekly metrics
        raise NotImplementedError("MetricsService.get_trends is not implemented yet.")
