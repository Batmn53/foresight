# Metric Governance & Principles

ForgeSight is committed to ethical, statistically sound, and team-centric engineering productivity analytics.

## Core Principles

1. **Time-to-merge Definition**:
   Time-to-merge is strictly measured from the pull request creation timestamp to the pull request merge timestamp (`merged_at - created_at`).
2. **Never Equated to Active Working Time**:
   Time-to-merge must **never** be described as exact developer working time. It encompasses code review turnaround, queue wait time, CI run latency, timezone differences, and team scheduling.
3. **Valid Conclusions for Build Failure Rate**:
   Build failure rate must be calculated exclusively from completed workflow runs with valid terminal conclusions (e.g., `success`, `failure`, `timed_out`).
4. **Running and Cancelled Workflows**:
   Workflows that are currently in-progress (`in_progress`, `queued`) or explicitly cancelled (`cancelled`) must **not** silently be classified as build failures.
5. **Team-Level Focus**:
   All metrics, charts, insights, and summaries must be team-level, repository-level, workflow-level, or PR-level.
6. **Prohibition of Individual Rankings**:
   Individual developer rankings, leaderboards, personal productivity scores, and comparative developer stack-rankings are strictly **prohibited** across the application.
7. **Correlation vs. Causation**:
   Correlation must not be described or interpreted as causation in any automated recommendation or analytical summary.
8. **Small Sample Size Transparency**:
   Small sample sizes (e.g., `< 5` PRs or workflow runs within a reporting interval) must be clearly flagged to prevent misleading statistical interpretations.
9. **Time Window Context**:
   All metric calculations must explicitly display their active time window (e.g., trailing 7 days, trailing 30 days) and aggregation granularity.
10. **Methodological Transparency**:
    Analytics and automated insights should clearly explain their underlying methodology, sample boundaries, and formula where practical.
