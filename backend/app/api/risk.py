"""Change risk analysis API routes."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import RiskRadarResponse

router = APIRouter()


@router.get("/radar", response_model=RiskRadarResponse, summary="Get repository change risk radar")
async def get_risk_radar(
    repository_id: uuid.UUID = Query(..., description="Target repository ID"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve risk breakdown for recent changes."""
    # TODO: Invoke RiskService.get_risk_radar
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Risk radar analysis is not yet implemented.",
    )
