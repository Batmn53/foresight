import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """Verify health check endpoint returns 200 OK and healthy status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "healthy"
        assert payload["service"] == "ForgeSight"


@pytest.mark.asyncio
async def test_api_routes_registered():
    """Verify primary route groups are registered under /api/v1."""
    paths = list(app.openapi()["paths"].keys())
    assert "/api/v1/auth/github/login" in paths
    assert "/api/v1/metrics/time-to-merge" in paths
    assert "/api/v1/bottlenecks/summary" in paths
    assert "/api/v1/risk/radar" in paths
    assert "/api/v1/release/readiness" in paths
    assert "/api/v1/github/repositories" in paths
