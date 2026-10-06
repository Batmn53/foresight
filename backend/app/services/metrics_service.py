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
        from sqlalchemy import select
        from app.db.models import PullRequest
        from datetime import datetime, timezone, timedelta
        import statistics

        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(PullRequest).where(
                PullRequest.repository_id == repository_id,
                PullRequest.is_merged == True,
                PullRequest.pr_merged_at >= since
            )
        )
        prs = result.scalars().all()
        
        hours = []
        for pr in prs:
            if pr.pr_merged_at and pr.pr_created_at:
                diff = pr.pr_merged_at - pr.pr_created_at
                hours.append(diff.total_seconds() / 3600.0)
                
        if not hours:
            return TimeToMergeMetric(
                repository_id=repository_id,
                time_window_days=days,
                sample_size=0,
                average_hours=0.0,
                median_hours=0.0,
                p90_hours=0.0
            )
            
        hours.sort()
        avg = sum(hours) / len(hours)
        median = statistics.median(hours)
        
        p90_idx = int(len(hours) * 0.9)
        p90 = hours[p90_idx] if p90_idx < len(hours) else hours[-1]
        
        return TimeToMergeMetric(
            repository_id=repository_id,
            time_window_days=days,
            sample_size=len(hours),
            average_hours=round(avg, 2),
            median_hours=round(median, 2),
            p90_hours=round(p90, 2)
        )

    async def get_build_failure_rate(
        self, repository_id: uuid.UUID, days: int = 30
    ) -> BuildFailureRateMetric:
        """Calculate CI workflow failure rate considering only completed runs."""
        from sqlalchemy import select
        from app.db.models import WorkflowRun
        from datetime import datetime, timezone, timedelta

        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(WorkflowRun).where(
                WorkflowRun.repository_id == repository_id,
                WorkflowRun.status == "completed",
                WorkflowRun.completed_at >= since
            )
        )
        runs = result.scalars().all()
        
        total = len(runs)
        if total == 0:
            return BuildFailureRateMetric(
                repository_id=repository_id,
                time_window_days=days,
                total_completed_runs=0,
                successful_runs=0,
                failed_runs=0,
                failure_rate_percentage=0.0
            )
            
        success = sum(1 for r in runs if r.conclusion == "success")
        failure = sum(1 for r in runs if r.conclusion == "failure")
        
        return BuildFailureRateMetric(
            repository_id=repository_id,
            time_window_days=days,
            total_completed_runs=total,
            successful_runs=success,
            failed_runs=failure,
            failure_rate_percentage=round((failure / total) * 100, 2) if total > 0 else 0.0
        )

    async def get_trends(
        self, repository_id: uuid.UUID, days: int = 30
    ) -> List[TrendDataPoint]:
        """Generate time-series trend metrics over the requested window."""
        from sqlalchemy import select
        from app.db.models import PullRequest, WorkflowRun
        from datetime import datetime, timezone, timedelta
        from collections import defaultdict
        
        since = datetime.now(timezone.utc) - timedelta(days=days)
        
        pr_result = await self.db.execute(
            select(PullRequest).where(
                PullRequest.repository_id == repository_id,
                PullRequest.is_merged == True,
                PullRequest.pr_merged_at >= since
            )
        )
        prs = pr_result.scalars().all()
        
        wf_result = await self.db.execute(
            select(WorkflowRun).where(
                WorkflowRun.repository_id == repository_id,
                WorkflowRun.status == "completed",
                WorkflowRun.completed_at >= since
            )
        )
        wfs = wf_result.scalars().all()
        
        daily_prs = defaultdict(list)
        for pr in prs:
            if pr.pr_merged_at:
                day_str = pr.pr_merged_at.strftime("%Y-%m-%d")
                daily_prs[day_str].append((pr.pr_merged_at - pr.pr_created_at).total_seconds() / 3600.0)
                
        daily_wfs = defaultdict(list)
        for wf in wfs:
            if wf.completed_at:
                day_str = wf.completed_at.strftime("%Y-%m-%d")
                daily_wfs[day_str].append(wf.conclusion == "failure")
                
        all_days = set(daily_prs.keys()).union(set(daily_wfs.keys()))
        all_days_sorted = sorted(list(all_days))
        
        trends = []
        for day in all_days_sorted:
            pr_times = daily_prs[day]
            wf_fails = daily_wfs[day]
            
            avg_pr = sum(pr_times) / len(pr_times) if pr_times else 0.0
            fail_rate = (sum(1 for f in wf_fails if f) / len(wf_fails) * 100) if wf_fails else 0.0
            
            trends.append(
                TrendDataPoint(
                    date=day,
                    time_to_merge_hours=round(avg_pr, 2),
                    build_failure_rate=round(fail_rate, 2),
                    pr_volume=len(pr_times)
                )
            )
            
        return trends

