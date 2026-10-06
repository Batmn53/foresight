"""Authentication API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas import TokenResponse, UserRead

router = APIRouter()


@router.get("/github/login", summary="Initiate GitHub OAuth login")
async def github_login():
    """Initiate GitHub OAuth login by providing authorization URL."""
    # TODO: Build GitHub OAuth URL and redirect
    return {
        "status": "not_implemented",
        "message": "GitHub OAuth login initiation placeholder.",
    }


@router.get("/github/callback", response_model=TokenResponse, summary="GitHub OAuth callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle callback from GitHub OAuth with temporary authorization code."""
    # TODO: Exchange code for GitHub access token, upsert User, return JWT
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth callback is not yet implemented.",
    )


@router.get("/me", response_model=UserRead, summary="Current user profile")
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Retrieve current authenticated user session."""
    # TODO: Validate JWT bearer token and return user profile
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Session profile retrieval is not yet implemented.",
    )
