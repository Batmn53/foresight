"""Idempotent ingestion service for GitHub resources."""

import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.github_service import GitHubService


class IngestionService:
    """Orchestrates pulling GitHub data and saving to PostgreSQL idempotently."""

    def __init__(self, db: AsyncSession, github_service: Optional[GitHubService] = None):
        self.db = db
        self.github_service = github_service or GitHubService()

    async def sync_repository(self, repository_id: uuid.UUID, sync_type: str = "FULL") -> uuid.UUID:
        """Trigger an idempotent sync for the target repository.

        Must upsert entities based on github_id to avoid duplication across multiple runs.
        """
        # TODO: Implement idempotent sync of PRs, Commits, and Workflow runs
        raise NotImplementedError("IngestionService.sync_repository is not implemented yet.")
