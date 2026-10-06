import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GrokService:
    """Service to interact with the xAI Grok API for engineering analysis."""

    BASE_URL = "https://api.x.ai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROK_API_KEY

    async def _call_grok(self, system_prompt: str, user_prompt: str) -> str:
        """Helper to call Grok API."""
        if not self.api_key:
            return "Grok API is unavailable: API key not configured."
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.BASE_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "grok-beta",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Grok API call failed: {e}")
            return f"Grok AI analysis is currently unavailable. ({str(e)})"

    async def analyze_bottlenecks(self, summary_data: Dict[str, Any], queue_data: list) -> str:
        """Analyze PR bottlenecks."""
        system_prompt = "You are a senior engineering manager analyzing team bottlenecks. Provide a concise, actionable summary of the bottleneck data provided. Do not invent metrics."
        user_prompt = f"Bottleneck Summary: {summary_data}\n\nTop Waiting PRs: {queue_data[:5]}"
        return await self._call_grok(system_prompt, user_prompt)

    async def analyze_risk(self, risk_data: Dict[str, Any]) -> str:
        """Analyze change risk."""
        system_prompt = "You are an engineering risk assessor. Summarize the risk factors for the repository. Keep it concise."
        user_prompt = f"Risk Data: {risk_data}"
        return await self._call_grok(system_prompt, user_prompt)

    async def analyze_release_readiness(self, release_data: Dict[str, Any]) -> str:
        """Analyze release readiness."""
        system_prompt = "You are a release manager. Based on the data, explain if the repository is ready for release and what the main blockers are."
        user_prompt = f"Release Data: {release_data}"
        return await self._call_grok(system_prompt, user_prompt)
