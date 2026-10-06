from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.db.database import get_db
from app.services.grok_service import GrokService
from app.services.metrics_service import MetricsService
from app.services.bottleneck_service import BottleneckService
from app.services.risk_service import RiskService
from app.services.release_service import ReleaseService

router = APIRouter()

@router.get("/summary", summary="Get Grok AI summary of engineering state")
async def get_ai_summary(
    repository_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve higher-level engineering analysis from Grok."""
    m_svc = MetricsService(db)
    r_svc = ReleaseService(db)
    
    ttm = await m_svc.get_time_to_merge(repository_id, 30)
    bf = await m_svc.get_build_failure_rate(repository_id, 30)
    rr = await r_svc.get_release_readiness(repository_id)
    
    summary_data = {
        "time_to_merge_avg_hours": ttm.average_hours,
        "build_failure_rate": bf.failure_rate_percentage,
        "is_ready_for_release": rr.is_ready_for_release,
        "blocking_factors": rr.blocking_factors
    }
    
    grok = GrokService()
    system_prompt = "You are a senior engineering manager. Summarize the engineering state of the repository based on these metrics. Be concise, highlight positive and negative trends. Provide actionable recommendations."
    user_prompt = f"Engineering Data: {summary_data}"
    
    response = await grok._call_grok(system_prompt, user_prompt)
    return {"analysis": response}

@router.get("/bottlenecks", summary="Get Grok AI analysis of bottlenecks")
async def get_ai_bottlenecks(
    repository_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    b_svc = BottleneckService(db)
    summary = await b_svc.get_bottleneck_summary(repository_id)
    queue = await b_svc.get_review_queue(repository_id)
    
    grok = GrokService()
    response = await grok.analyze_bottlenecks(summary.dict(), [q.dict() for q in queue])
    return {"analysis": response}

@router.get("/risk", summary="Get Grok AI analysis of risk signals")
async def get_ai_risk(
    repository_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    r_svc = RiskService(db)
    risk = await r_svc.get_risk_radar(repository_id)
    
    grok = GrokService()
    response = await grok.analyze_risk(risk.dict())
    return {"analysis": response}

@router.get("/release", summary="Get Grok AI analysis of release readiness")
async def get_ai_release(
    repository_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    r_svc = ReleaseService(db)
    rr = await r_svc.get_release_readiness(repository_id)
    
    grok = GrokService()
    response = await grok.analyze_release_readiness(rr.dict())
    return {"analysis": response}
