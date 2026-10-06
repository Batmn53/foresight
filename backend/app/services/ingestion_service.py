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
        """Trigger an idempotent sync for the target repository."""
        from sqlalchemy import select
        from datetime import datetime, timezone
        from app.db.models import Repository, SyncRun, PullRequest, PullRequestReview, Commit, WorkflowRun
        
        # 1. Create a SyncRun
        sync_run = SyncRun(repository_id=repository_id, status="RUNNING", sync_type=sync_type)
        self.db.add(sync_run)
        await self.db.commit()
        await self.db.refresh(sync_run)
        
        try:
            # 2. Get Repo
            result = await self.db.execute(select(Repository).where(Repository.id == repository_id))
            repo = result.scalars().first()
            if not repo:
                raise ValueError(f"Repository {repository_id} not found")
                
            owner = repo.owner_login
            repo_name = repo.name
            items_synced = 0
            
            # 3. Sync PRs
            prs = await self.github_service.get_pull_requests(owner, repo_name)
            for pr_data in prs:
                github_id = pr_data["id"]
                pr_result = await self.db.execute(select(PullRequest).where(PullRequest.github_id == github_id))
                pr = pr_result.scalars().first()
                
                # Parse timestamps
                def parse_dt(dt_str):
                    if not dt_str: return None
                    # GitHub uses ISO format, e.g., '2023-01-01T00:00:00Z'
                    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
                    return dt

                if not pr:
                    pr = PullRequest(
                        github_id=github_id,
                        number=pr_data["number"],
                        title=pr_data["title"],
                        state=pr_data["state"],
                        is_merged=bool(pr_data.get("merged_at")),
                        repository_id=repo.id,
                        pr_created_at=parse_dt(pr_data.get("created_at")),
                        pr_updated_at=parse_dt(pr_data.get("updated_at")),
                        pr_closed_at=parse_dt(pr_data.get("closed_at")),
                        pr_merged_at=parse_dt(pr_data.get("merged_at"))
                    )
                    self.db.add(pr)
                else:
                    pr.title = pr_data["title"]
                    pr.state = pr_data["state"]
                    pr.is_merged = bool(pr_data.get("merged_at"))
                    pr.pr_updated_at = parse_dt(pr_data.get("updated_at"))
                    pr.pr_closed_at = parse_dt(pr_data.get("closed_at"))
                    pr.pr_merged_at = parse_dt(pr_data.get("merged_at"))
                
                await self.db.flush()
                items_synced += 1
                
                # Sync PR Reviews
                reviews = await self.github_service.get_pull_request_reviews(owner, repo_name, pr.number)
                for rev_data in reviews:
                    rev_id = rev_data["id"]
                    rev_result = await self.db.execute(select(PullRequestReview).where(PullRequestReview.github_id == rev_id))
                    rev = rev_result.scalars().first()
                    if not rev:
                        rev = PullRequestReview(
                            github_id=rev_id,
                            pull_request_id=pr.id,
                            state=rev_data["state"],
                            submitted_at=parse_dt(rev_data.get("submitted_at"))
                        )
                        self.db.add(rev)
                        items_synced += 1

            # 4. Sync Commits
            commits = await self.github_service.get_commits(owner, repo_name)
            for commit_data in commits:
                sha = commit_data["sha"]
                commit_result = await self.db.execute(select(Commit).where(Commit.sha == sha))
                commit = commit_result.scalars().first()
                if not commit:
                    # author date
                    commit_author = commit_data.get("commit", {}).get("author", {})
                    dt_str = commit_author.get("date")
                    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00')) if dt_str else datetime.now(timezone.utc)
                    
                    commit = Commit(
                        sha=sha,
                        message=commit_data.get("commit", {}).get("message", ""),
                        committed_at=dt
                    )
                    self.db.add(commit)
                    items_synced += 1

            # 5. Sync Workflows
            workflows = await self.github_service.get_workflow_runs(owner, repo_name)
            for wf_data in workflows:
                github_id = wf_data["id"]
                wf_result = await self.db.execute(select(WorkflowRun).where(WorkflowRun.github_id == github_id))
                wf = wf_result.scalars().first()
                
                def parse_dt(dt_str):
                    if not dt_str: return None
                    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
                    return dt
                    
                if not wf:
                    wf = WorkflowRun(
                        github_id=github_id,
                        repository_id=repo.id,
                        workflow_name=wf_data.get("name", "Unknown"),
                        status=wf_data["status"],
                        conclusion=wf_data.get("conclusion"),
                        run_started_at=parse_dt(wf_data.get("run_started_at")),
                        completed_at=parse_dt(wf_data.get("updated_at")) # Using updated_at for completed_at if it's done
                    )
                    self.db.add(wf)
                else:
                    wf.status = wf_data["status"]
                    wf.conclusion = wf_data.get("conclusion")
                    wf.completed_at = parse_dt(wf_data.get("updated_at"))
                
                items_synced += 1
                
            sync_run.status = "COMPLETED"
            sync_run.items_synced = items_synced
            sync_run.finished_at = datetime.now(timezone.utc)
            await self.db.commit()
            
        except Exception as e:
            sync_run.status = "FAILED"
            sync_run.error_message = str(e)
            sync_run.finished_at = datetime.now(timezone.utc)
            await self.db.commit()
            
        return sync_run.id
