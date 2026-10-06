# ForgeSight Architecture Documentation

## Overview

ForgeSight is an Engineering Productivity and Code Quality Platform designed to ingest GitHub repository activity (PRs, commits, and CI workflow runs) and generate team-level engineering analytics.

## High-Level System Architecture

```text
       +------------------------------------+
       |          GitHub REST API           |
       +-----------------+------------------+
                         | (OAuth / REST Ingestion)
                         v
       +-----------------+------------------+
       |         FastAPI Backend            |
       |  - API Routers (/api/v1)           |
       |  - Services (Ingestion / Metrics)  |
       |  - Database Models (SQLAlchemy)    |
       +-----------------+------------------+
                         |
                         v
       +-----------------+------------------+
       |       PostgreSQL Database          |
       |  - Idempotent GitHub entity storage|
       |  - Alembic migrations              |
       +-----------------+------------------+
                         ^
                         | (REST APIs / Axios)
       +-----------------+------------------+
       |      React + Vite Frontend         |
       |  - Team Dashboards                 |
       |  - Bottleneck & Risk Radars        |
       |  - Recharts Visualizations         |
       +------------------------------------+
```

## Layered Backend Design

The backend enforces strict separation of concerns:

1. **API Routers (`backend/app/api`)**:
   - Thin HTTP endpoint handlers.
   - Request parameter validation, dependency injection (DB sessions, auth).
   - Zero direct business or calculation logic.
2. **Services (`backend/app/services`)**:
   - Domain logic and business rules.
   - GitHub API consumption and idempotency resolution.
   - Aggregations and analytical metric calculations.
3. **Database & Models (`backend/app/db`)**:
   - SQLAlchemy async engine and session management.
   - Declarative models reflecting domain entities with external GitHub IDs mapped alongside internal UUIDs.
4. **Schemas (`backend/app/schemas`)**:
   - Pydantic models for request validation and standardized response payloads.
5. **Core (`backend/app/core`)**:
   - Centralized configuration via `pydantic-settings`.
   - Security primitives, token validation, and password/secret handling.

## Database Entities

- `User`: Team members authenticated via GitHub OAuth.
- `Repository`: Connected GitHub repositories tracked for metrics.
- `PullRequest`: Pull request metadata, timestamps (`created_at`, `merged_at`, `closed_at`).
- `PullRequestReview`: PR reviews indicating approval cycles and review latency.
- `Commit`: Commit history tied to PRs and branches.
- `WorkflowRun`: GitHub Actions workflow run instances and conclusion states (`success`, `failure`, `cancelled`).
- `SyncRun`: Audit log for background and manual GitHub synchronization runs ensuring idempotency.
