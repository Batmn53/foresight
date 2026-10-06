"""PR delivery bottleneck detection service."""

import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import BottleneckSummaryResponse, BottleneckReviewQueueItem


class BottleneckService:
    """Detects process bottlenecks in review turnaround and PR queues."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_review_queue(
        self, repository_id: uuid.UUID
    ) -> List[BottleneckReviewQueueItem]:
        """Fetch list of open PRs waiting on reviews with turnaround duration."""
        # TODO: Implement review queue bottleneck aggregation
        raise NotImplementedError("BottleneckService.get_review_queue is not implemented yet.")

    async def get_bottleneck_summary(
        self, repository_id: uuid.UUID
    ) -> BottleneckSummaryResponse:
        """Compute aggregated bottleneck indicators for the repository."""
        # TODO: Implement bottleneck summary calculations
        raise NotImplementedError("BottleneckService.get_bottleneck_summary is not implemented yet.")
