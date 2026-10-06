"""Pydantic schemas package."""

from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


# Base Schema
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseSchema):
    id: uuid.UUID
    github_id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


# Repository Schemas
class RepositoryRead(BaseSchema):
    id: uuid.UUID
    github_id: int
    name: str
    full_name: str
    owner_login: str
    is_private: bool
    default_branch: str
    created_at: datetime


class SyncTriggerRequest(BaseModel):
    repository_id: uuid.UUID
    sync_type: str = Field(default="FULL", pattern="^(FULL|INCREMENTAL)$")


class SyncStatusResponse(BaseSchema):
    id: uuid.UUID
    repository_id: uuid.UUID
    status: str
    sync_type: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    items_synced: int
    error_message: Optional[str] = None


# Metric Schemas (Team and Repository Level Only)
class TimeToMergeMetric(BaseModel):
    repository_id: uuid.UUID
    time_window_days: int
    sample_size: int
    average_hours: float
    median_hours: float
    p90_hours: float
    disclaimer: str = "Time-to-merge represents PR creation to merge interval, not developer working time."


class BuildFailureRateMetric(BaseModel):
    repository_id: uuid.UUID
    time_window_days: int
    total_completed_runs: int
    successful_runs: int
    failed_runs: int
    failure_rate_percentage: float
    note: str = "In-progress and cancelled workflows are excluded from failure calculations."


class TrendDataPoint(BaseModel):
    date: str
    time_to_merge_hours: float
    build_failure_rate: float
    pr_volume: int


class MetricTrendsResponse(BaseModel):
    repository_id: uuid.UUID
    time_window_days: int
    data_points: List[TrendDataPoint]


# Bottleneck Schemas
class BottleneckReviewQueueItem(BaseModel):
    pr_id: uuid.UUID
    pr_number: int
    title: str
    waiting_hours: float
    review_status: str


class BottleneckSummaryResponse(BaseModel):
    repository_id: uuid.UUID
    median_review_wait_hours: float
    unreviewed_pr_count: int
    high_latency_pr_count: int


# Risk Schemas
class RiskFactor(BaseModel):
    factor_name: str
    severity: str  # LOW, MEDIUM, HIGH
    description: str


class RiskRadarResponse(BaseModel):
    repository_id: uuid.UUID
    risk_score: float
    sample_size: int
    risk_factors: List[RiskFactor]


# Release Readiness Schemas
class ReleaseReadinessResponse(BaseModel):
    repository_id: uuid.UUID
    is_ready_for_release: bool
    blocking_factors: List[str]
    ci_health_rate: float
    open_unmerged_prs: int
