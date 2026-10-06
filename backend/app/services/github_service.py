"""GitHub REST API integration client.

Handles authenticating with GitHub and communicating with GitHub endpoints.
"""

from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings


class GitHubService:
    """Service wrapping GitHub REST API v3 / v4 requests."""

    BASE_URL: str = "https://api.github.com"

    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def exchange_code_for_token(self, code: str) -> str:
        """Exchange OAuth code for an access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI,
                },
            )
            response.raise_for_status()
            data = response.json()
            if "error" in data:
                raise ValueError(data.get("error_description", "Unknown OAuth error"))
            return data["access_token"]

    async def get_user_profile(self) -> Dict[str, Any]:
        """Fetch authenticated user profile."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/user",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def get_repositories(self) -> List[Dict[str, Any]]:
        """List repositories for authenticated user or organization."""
        # Note: In a real app we'd handle pagination. For MVP, fetch first page.
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/user/repos?per_page=100&sort=updated",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def get_repository(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch a single repository."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def get_pull_requests(self, owner: str, repo: str, state: str = "all") -> List[Dict[str, Any]]:
        """Fetch pull requests for a repository."""
        all_prs = []
        page = 1
        async with httpx.AsyncClient() as client:
            while True:
                response = await client.get(
                    f"{self.BASE_URL}/repos/{owner}/{repo}/pulls?state={state}&per_page=100&page={page}",
                    headers=self._get_headers()
                )
                response.raise_for_status()
                prs = response.json()
                if not prs:
                    break
                all_prs.extend(prs)
                page += 1
                if page > 5: # Limit for MVP
                    break
        return all_prs

    async def get_pull_request_reviews(self, owner: str, repo: str, pull_number: int) -> List[Dict[str, Any]]:
        """Fetch reviews for a pull request."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()

    async def get_commits(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetch commits for a repository."""
        all_commits = []
        page = 1
        async with httpx.AsyncClient() as client:
            while True:
                response = await client.get(
                    f"{self.BASE_URL}/repos/{owner}/{repo}/commits?per_page=100&page={page}",
                    headers=self._get_headers()
                )
                response.raise_for_status()
                commits = response.json()
                if not commits:
                    break
                all_commits.extend(commits)
                page += 1
                if page > 5: # Limit for MVP
                    break
        return all_commits

    async def get_workflow_runs(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetch Actions workflow runs for a repository."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/actions/runs?per_page=100",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json().get("workflow_runs", [])
