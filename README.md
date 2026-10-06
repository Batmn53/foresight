# ForgeSight

ForgeSight is an Engineering Productivity and Code Quality Platform that aggregates repository activity, pull requests, commits, and CI workflow data from GitHub to deliver actionable, team-level delivery intelligence.

---

## Metric Governance & Core Philosophy

> **CRITICAL PRODUCT RULE:**
> ForgeSight **never** ranks, scores, or evaluates individual developers.
> All metrics and insights are strictly computed at the team, repository, workflow, or PR level.

Key metric principles (see [docs/metrics.md](docs/metrics.md) for full governance details):
- **Time-to-merge**: Measured from PR creation to merge timestamp (`merged_at - created_at`). Never described as active working time.
- **Build Failure Rate**: Evaluated exclusively across completed runs with terminal conclusions. In-progress or cancelled runs are never silently marked as failures.
- **Transparency**: Small sample sizes are explicitly flagged, lookback windows are visible, and correlation is never conflated with causation.

---

## Architecture Overview

ForgeSight is organized into a clean, layered architecture:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios, React Router.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy 2 (Async), PostgreSQL, Alembic, Pydantic v2, httpx.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions CI.

```text
API routes (app/api)
       ↓
Services (app/services)
       ↓
Database Models (app/db/models) / GitHub REST API (httpx)
```

See [docs/architecture.md](docs/architecture.md) and [docs/api.md](docs/api.md) for deeper specifications.

---

## Directory Structure

```text
forgesight/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow
├── backend/
│   ├── alembic/               # Database migration scripts
│   ├── app/
│   │   ├── api/               # Thin API routers
│   │   ├── core/              # Config (pydantic-settings) & security
│   │   ├── db/                # DB engine & SQLAlchemy models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic & GitHub clients
│   │   ├── utils/             # Shared helpers
│   │   └── main.py            # FastAPI entry point
│   ├── tests/                 # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI states (Empty, Loading, Error)
│   │   ├── layouts/           # App shell (Sidebar, TopNav, Outlet)
│   │   ├── pages/             # Route views (Dashboard, Bottlenecks, Risk, etc.)
│   │   ├── services/          # API clients (Axios)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # Domain TypeScript types
│   │   ├── utils/             # Client helpers
│   │   ├── App.tsx            # React router definitions
│   │   └── main.tsx           # Application mount point
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── architecture.md        # Architecture specification
│   ├── metrics.md             # Metric governance rules
│   └── api.md                 # REST API endpoints documentation
├── docker-compose.yml         # Container composition (db, backend, frontend)
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- Alternatively for local dev without Docker:
  - Python 3.10+
  - Node.js 20+ & npm
  - PostgreSQL 16+

### Environment Configuration

Copy the template environment file:

```bash
cp .env.example .env
```

Fill in your GitHub OAuth App credentials in `.env`:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`
- `GITHUB_TOKEN`
- `SECRET_KEY`

---

## Running with Docker Compose (Recommended)

To start the full stack (PostgreSQL, FastAPI Backend, and React Frontend):

```bash
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Swagger Interactive Docs**: http://localhost:8000/api/v1/docs
- **Health Check**: http://localhost:8000/health

To stop:

```bash
docker compose down
```

---

## Local Development (Without Docker)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Run tests:

```bash
pytest tests
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs at http://localhost:5173.

---

## Development Workflow & Team Ownership

The project skeleton is partitioned to enable 3 developers to work independently without merge conflicts:

| Developer / Track | Primary Focus | Key Folders |
| :--- | :--- | :--- |
| **Developer 1: GitHub & Ingestion** | GitHub OAuth, Webhooks, Data Ingestion, Idempotency | `backend/app/api/auth.py`, `backend/app/api/github.py`, `backend/app/services/github_service.py`, `backend/app/services/ingestion_service.py`, `frontend/src/pages/GitHubSync.tsx` |
| **Developer 2: Delivery Metrics & Dashboard** | Time-to-merge, Build Failure Rate, Trend charts | `backend/app/api/metrics.py`, `backend/app/services/metrics_service.py`, `frontend/src/pages/Dashboard.tsx` |
| **Developer 3: Differentiators & Advanced Insights** | PR Review Bottlenecks, Risk Radar, Release Readiness | `backend/app/api/bottlenecks.py`, `backend/app/api/risk.py`, `backend/app/api/release.py`, `backend/app/services/*`, `frontend/src/pages/Bottleneck.tsx`, `RiskRadar.tsx`, `ReleaseReadiness.tsx` |

### Branching Strategy

- `main`: Production-ready release branch.
- `develop`: Shared integration branch.
- Feature branches: `feat/<developer>-<feature-description>` (e.g. `feat/ingestion-oauth`, `feat/metrics-time-to-merge`).
- All changes must pass CI validation prior to merging via Pull Request.
