# ForgeSight API Specification

Base URL: `/api/v1`

## API Endpoints

### 1. Authentication (`/api/v1/auth`)
- `GET /auth/github/login`: Initiates GitHub OAuth flow by redirecting to GitHub authorization page.
- `GET /auth/github/callback`: Handles GitHub OAuth callback code and issues JWT access token.
- `GET /auth/me`: Returns current authenticated user session.

### 2. GitHub Integration (`/api/v1/github`)
- `GET /github/repositories`: Lists repositories accessible or connected to ForgeSight.
- `POST /github/sync`: Triggers asynchronous ingestion for a specified repository.
- `GET /github/sync/status/{sync_id}`: Retrieves sync job progress and history.

### 3. Engineering Metrics (`/api/v1/metrics`)
- `GET /metrics/time-to-merge`: Calculates time-to-merge metrics for a repository over a given time window.
- `GET /metrics/build-failures`: Returns workflow run build failure rates over completed runs.
- `GET /metrics/trends`: Time-series data points for team dashboards and trend charts.

### 4. Bottleneck Detection (`/api/v1/bottlenecks`)
- `GET /bottlenecks/review-queue`: Identifies PR review queues and turnaround latency.
- `GET /bottlenecks/summary`: Aggregated repository delivery bottleneck factors.

### 5. Change Risk Analysis (`/api/v1/risk`)
- `GET /risk/radar`: Evaluates change risk distribution based on PR size, file churn, and historical test stability.

### 6. Release Readiness (`/api/v1/release`)
- `GET /release/readiness`: Computes deployment readiness score based on CI health and open blocking PRs.
