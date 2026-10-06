"""Change risk analysis service."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import RiskRadarResponse


class RiskService:
    """Evaluates risk patterns across PRs, lines changed, and test history."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_risk_radar(
        self, repository_id: uuid.UUID
    ) -> RiskRadarResponse:
        """Compute change risk factors based on code churn and test stability."""
        from sqlalchemy import select
        from app.db.models import PullRequest, WorkflowRun
        from app.schemas import RiskFactor
        from datetime import datetime, timezone, timedelta
        
        since = datetime.now(timezone.utc) - timedelta(days=7)
        
        # 1. Analyze PR Size / Churn for recent PRs
        result = await self.db.execute(
            select(PullRequest).where(
                PullRequest.repository_id == repository_id,
                PullRequest.pr_created_at >= since
            )
        )
        recent_prs = result.scalars().all()
        
        sample_size = len(recent_prs)
        
        factors = []
        
        # In GitHub PR response, we didn't fetch additions/deletions. We can just use the number of PRs for volume.
        # Alternatively, if there are many unmerged open PRs, it's a risk.
        open_unmerged = sum(1 for pr in recent_prs if pr.state == "open")
        
        if open_unmerged > 20:
            factors.append(RiskFactor(factor_name="High Unmerged PR Volume", severity="HIGH", description="Many open PRs increasing integration risk."))
        elif open_unmerged > 10:
            factors.append(RiskFactor(factor_name="Elevated Unmerged PR Volume", severity="MEDIUM", description="Noticeable number of open PRs."))
        else:
            factors.append(RiskFactor(factor_name="Manageable Unmerged PR Volume", severity="LOW", description="Normal amount of open PRs."))
            
        # 2. Analyze CI failures in the last 7 days
        wf_result = await self.db.execute(
            select(WorkflowRun).where(
                WorkflowRun.repository_id == repository_id,
                WorkflowRun.status == "completed",
                WorkflowRun.completed_at >= since
            )
        )
        recent_wfs = wf_result.scalars().all()
        
        total_wfs = len(recent_wfs)
        failed_wfs = sum(1 for wf in recent_wfs if wf.conclusion == "failure")
        
        fail_rate = (failed_wfs / total_wfs) if total_wfs > 0 else 0
        if fail_rate > 0.2:
            factors.append(RiskFactor(factor_name="High Test Instability", severity="HIGH", description=f"{fail_rate*100:.1f}% of recent workflows failed."))
            risk_score = 85.0
        elif fail_rate > 0.05:
            factors.append(RiskFactor(factor_name="Moderate Test Instability", severity="MEDIUM", description=f"{fail_rate*100:.1f}% of recent workflows failed."))
            risk_score = 50.0
        else:
            factors.append(RiskFactor(factor_name="Stable CI", severity="LOW", description="CI workflows are consistently passing."))
            risk_score = 15.0
            
        if open_unmerged > 20:
            risk_score = min(100.0, risk_score + 30.0)
        elif open_unmerged > 10:
            risk_score = min(100.0, risk_score + 15.0)

        return RiskRadarResponse(
            repository_id=repository_id,
            risk_score=round(risk_score, 1),
            sample_size=sample_size,
            risk_factors=factors
        )
