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
        # TODO: Implement release readiness evaluation rules
        raise NotImplementedError("ReleaseService.get_release_readiness is not implemented yet.")
