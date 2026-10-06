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
