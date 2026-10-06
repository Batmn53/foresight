from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import User
from app.schemas import TokenResponse, UserRead
from app.core.config import settings
from app.core.security import create_access_token
from app.services.github_service import GitHubService

router = APIRouter()

@router.get("/github/login", summary="Initiate GitHub OAuth login")
async def github_login():
    """Initiate GitHub OAuth login by providing authorization URL."""
    github_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=repo,user"
    )
    return {"url": github_url}


@router.get("/github/callback", response_model=TokenResponse, summary="GitHub OAuth callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle callback from GitHub OAuth with temporary authorization code."""
    try:
        github_service = GitHubService(token="") # initially no token
        access_token = await github_service.exchange_code_for_token(code)
        
        # Now use the token to get the user
        github_service.token = access_token
        user_profile = await github_service.get_user_profile()
        github_id = user_profile["id"]
        username = user_profile.get("login")
        
        # Upsert user
        result = await db.execute(select(User).where(User.github_id == github_id))
        user = result.scalars().first()
        
        if not user:
            user = User(
                github_id=github_id,
                username=username,
                email=user_profile.get("email"),
                avatar_url=user_profile.get("avatar_url")
            )
            db.add(user)
        else:
            user.username = username
            user.email = user_profile.get("email")
            user.avatar_url = user_profile.get("avatar_url")
            
        await db.commit()
        await db.refresh(user)
        
        # Create JWT token
        jwt_token = create_access_token(subject=str(user.id), extra_claims={"github_token": access_token})
        
        return {"access_token": jwt_token, "token_type": "bearer"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub OAuth failed: {str(e)}"
        )


@router.get("/me", response_model=UserRead, summary="Current user profile")
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Retrieve current authenticated user session."""
    # For now, this is a placeholder. In a real app we'd inject current_user using fastapi.security
    # Since we need a simple way to test, let's just return the first user if it exists.
    # A real implementation would parse the Bearer token.
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

