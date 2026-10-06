"""Change risk analysis API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.database import get_db
from app.schemas import RiskRadarResponse
from app.services.risk_service import RiskService

router = APIRouter()

@router.get("/radar", response_model=RiskRadarResponse, summary="Get repository change risk radar")
async def get_risk_radar(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve risk breakdown for recent changes."""
    service = RiskService(db)
    return await service.get_risk_radar(repository_id)

@router.get("/summary", summary="Get risk summary")
async def get_risk_summary(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
):
    """Retrieve top-level risk summary. (Stub)"""
    return {
        "high_risk_prs": 0,
        "high_risk_share": 0,
        "average_complexity_score": 0,
        "merge_without_review": 0,
        "large_diffs": 0,
        "heuristics": []
    }
