"""GitHub integration and ingestion API routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import uuid

from app.db.database import get_db
from app.db.models import Repository, SyncRun
from app.schemas import RepositoryRead, SyncTriggerRequest, SyncStatusResponse
from app.services.github_service import GitHubService
from app.services.ingestion_service import IngestionService

router = APIRouter()

@router.get("/repositories", response_model=List[RepositoryRead], summary="List connected repositories")
async def list_repositories(db: AsyncSession = Depends(get_db)):
    """List all tracked repositories for the current user/organization."""
    # Fetch from GitHub API and sync to DB
    github_service = GitHubService()
    repos_data = await github_service.get_repositories()
    
    saved_repos = []
    for repo_data in repos_data:
        github_id = repo_data["id"]
        result = await db.execute(select(Repository).where(Repository.github_id == github_id))
        repo = result.scalars().first()
        
        if not repo:
            repo = Repository(
                github_id=github_id,
                name=repo_data["name"],
                full_name=repo_data["full_name"],
                owner_login=repo_data["owner"]["login"],
                is_private=repo_data["private"],
                default_branch=repo_data["default_branch"]
            )
            db.add(repo)
        else:
            repo.name = repo_data["name"]
            repo.full_name = repo_data["full_name"]
            repo.owner_login = repo_data["owner"]["login"]
            repo.is_private = repo_data["private"]
            repo.default_branch = repo_data["default_branch"]
        
        saved_repos.append(repo)
        
    await db.commit()
    for repo in saved_repos:
        await db.refresh(repo)
        
    return saved_repos


@router.post("/sync", response_model=SyncStatusResponse, summary="Trigger repository ingestion sync")
async def trigger_sync(payload: SyncTriggerRequest, db: AsyncSession = Depends(get_db)):
    """Trigger background or immediate ingestion sync for a repository."""
    ingestion_service = IngestionService(db)
    sync_id = await ingestion_service.sync_repository(payload.repository_id, payload.sync_type)
    
    result = await db.execute(select(SyncRun).where(SyncRun.id == sync_id))
    sync_run = result.scalars().first()
    
    return sync_run


@router.get("/sync/status/{sync_id}", response_model=SyncStatusResponse, summary="Get sync job status")
async def get_sync_status(sync_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get the current progress/status of an ingestion sync job."""
    result = await db.execute(select(SyncRun).where(SyncRun.id == sync_id))
    sync_run = result.scalars().first()
    if not sync_run:
        raise HTTPException(status_code=404, detail="Sync run not found")
    return sync_run

from pydantic import BaseModel

class PublicRepoRequest(BaseModel):
    url: str

@router.post("/public-repo", response_model=RepositoryRead, summary="Add public repository")
async def add_public_repository(payload: PublicRepoRequest, db: AsyncSession = Depends(get_db)):
    """Add a public repository by URL."""
    # Parse URL: https://github.com/owner/repo
    url = payload.url.strip()
    if not url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
    parts = url.replace("https://github.com/", "").split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        
    owner, repo_name = parts[0], parts[1]
    
    # We can use GitHubService with default token to fetch public repo
    github_service = GitHubService()
    try:
        repo_data = await github_service.get_repository(owner, repo_name)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch repository: {str(e)}")
        
    github_id = repo_data["id"]
    result = await db.execute(select(Repository).where(Repository.github_id == github_id))
    repo = result.scalars().first()
    
    if not repo:
        repo = Repository(
            github_id=github_id,
            name=repo_data["name"],
            full_name=repo_data["full_name"],
            owner_login=repo_data["owner"]["login"],
            is_private=repo_data["private"],
            default_branch=repo_data["default_branch"]
        )
        db.add(repo)
    else:
        repo.name = repo_data["name"]
        repo.full_name = repo_data["full_name"]
        repo.owner_login = repo_data["owner"]["login"]
        repo.is_private = repo_data["private"]
        repo.default_branch = repo_data["default_branch"]
    
    await db.commit()
    await db.refresh(repo)
    return repo

