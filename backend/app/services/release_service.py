"""Release readiness evaluation service."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import ReleaseReadinessResponse


class ReleaseService:
    """Evaluates release readiness based on CI health, open blockers, and sync status."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_release_readiness(
        self, repository_id: uuid.UUID
    ) -> ReleaseReadinessResponse:
        """Evaluate if repository default branch is stable and ready for release."""
        from sqlalchemy import select, desc
        from app.db.models import PullRequest, WorkflowRun
        
        # 1. CI Health (last 50 workflows)
        wf_result = await self.db.execute(
            select(WorkflowRun)
            .where(WorkflowRun.repository_id == repository_id, WorkflowRun.status == "completed")
            .order_by(desc(WorkflowRun.completed_at))
            .limit(50)
        )
        recent_wfs = wf_result.scalars().all()
        
        total_wfs = len(recent_wfs)
        successful_wfs = sum(1 for wf in recent_wfs if wf.conclusion == "success")
        
        ci_health_rate = successful_wfs / total_wfs if total_wfs > 0 else 1.0
        
        # 2. Open PRs
        pr_result = await self.db.execute(
            select(PullRequest).where(
                PullRequest.repository_id == repository_id,
                PullRequest.state == "open"
            )
        )
        open_prs = pr_result.scalars().all()
        open_unmerged_prs = len(open_prs)
        
        # 3. Rules
        blocking_factors = []
        is_ready = True
        
        if ci_health_rate < 0.9:
            is_ready = False
            blocking_factors.append(f"CI success rate is {ci_health_rate*100:.1f}%, which is below the 90% threshold.")
            
        if open_unmerged_prs > 10:
            is_ready = False
            blocking_factors.append(f"Too many open PRs ({open_unmerged_prs}). Consider merging or closing them.")
            
        if total_wfs > 0 and recent_wfs[0].conclusion != "success":
            is_ready = False
            blocking_factors.append("The latest CI workflow failed.")

        return ReleaseReadinessResponse(
            repository_id=repository_id,
            is_ready_for_release=is_ready,
            blocking_factors=blocking_factors,
            ci_health_rate=round(ci_health_rate, 2),
            open_unmerged_prs=open_unmerged_prs
        )
