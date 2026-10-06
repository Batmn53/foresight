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
        from sqlalchemy import select
        from app.db.models import PullRequest, PullRequestReview
        from datetime import datetime, timezone
        
        result = await self.db.execute(
            select(PullRequest).where(
                PullRequest.repository_id == repository_id,
                PullRequest.state == "open"
            )
        )
        open_prs = result.scalars().all()
        
        queue = []
        now = datetime.now(timezone.utc)
        
        for pr in open_prs:
            wait_time = (now - pr.pr_created_at).total_seconds() / 3600.0 if pr.pr_created_at else 0.0
            
            # For simplicity, we just say if there are any reviews, it's REVIEWED, else PENDING
            # We would normally query reviews for this PR
            rev_res = await self.db.execute(
                select(PullRequestReview).where(PullRequestReview.pull_request_id == pr.id)
            )
            reviews = rev_res.scalars().all()
            status = "REVIEWED" if reviews else "PENDING"
            
            queue.append(
                BottleneckReviewQueueItem(
                    pr_id=pr.id,
                    pr_number=pr.number,
                    title=pr.title,
                    waiting_hours=round(wait_time, 1),
                    review_status=status
                )
            )
            
        queue.sort(key=lambda x: x.waiting_hours, reverse=True)
        return queue

    async def get_bottleneck_summary(
        self, repository_id: uuid.UUID
    ) -> BottleneckSummaryResponse:
        """Compute aggregated bottleneck indicators for the repository."""
        import statistics
        queue = await self.get_review_queue(repository_id)
        
        if not queue:
            return BottleneckSummaryResponse(
                repository_id=repository_id,
                median_review_wait_hours=0.0,
                unreviewed_pr_count=0,
                high_latency_pr_count=0
            )
            
        wait_times = [item.waiting_hours for item in queue]
        unreviewed = sum(1 for item in queue if item.review_status == "PENDING")
        high_latency = sum(1 for item in queue if item.waiting_hours > 48.0) # > 48 hours is high latency
        
        return BottleneckSummaryResponse(
            repository_id=repository_id,
            median_review_wait_hours=round(statistics.median(wait_times), 1),
            unreviewed_pr_count=unreviewed,
            high_latency_pr_count=high_latency
        )
