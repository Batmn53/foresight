/**
 * Shared TypeScript type definitions for ForgeSight frontend
 */

export interface Repository {
  id: string;
  github_id: number;
  name: string;
  full_name: string;
  owner_login: string;
  is_private: boolean;
  default_branch: string;
  created_at: string;
}

export interface TimeToMergeMetric {
  repository_id: string;
  time_window_days: number;
  sample_size: number;
  average_hours: number;
  median_hours: number;
  p90_hours: number;
  disclaimer: string;
}

export interface BuildFailureRateMetric {
  repository_id: string;
  time_window_days: number;
  total_completed_runs: number;
  successful_runs: number;
  failed_runs: number;
  failure_rate_percentage: number;
  note: string;
}

export interface MetricsOverview {
  merged_prs: number;
  merged_prs_change?: string;
  open_prs: number;
  open_prs_change?: string;
  median_time_to_merge_hours: number;
  median_time_change?: string;
  build_failure_rate: number;
  build_failure_rate_change?: string;
  workflow_success_rate: number;
  workflow_success_rate_change?: string;
  release_readiness_score: number;
  release_readiness_status?: string;
  release_readiness_change?: string;
  time_window_days?: number;
}

export interface PRThroughputDataPoint {
  day: string;
  opened: number;
  merged: number;
}

export interface LifecycleDataPoint {
  day: string;
  hours: number;
  slaTarget: number;
}

export interface CIReliabilityDataPoint {
  day: string;
  successRate: number;
  failureRate: number;
}

export interface WorkflowHealthItem {
  id: string;
  name: string;
  runs: number;
  failureRate: number;
  accent: 'error' | 'tertiary' | 'secondary';
}

export interface EngineeringSignal {
  id: string;
  category: string;
  statusBadge: string;
  title: string;
  details: string;
  icon: string;
  accent: 'tertiary' | 'error' | 'secondary' | 'primary';
  codeHighlight?: string;
}

export interface TrendDataPoint {
  date: string;
  time_to_merge_hours: number;
  build_failure_rate: number;
  pr_volume: number;
}

export interface BottleneckSummary {
  mean_lifecycle: number;
  mean_lifecycle_delta: string;
  median_duration: number;
  median_duration_delta: string;
  review_wait_median: number;
  review_wait_share: number;
  ci_recovery_latency: number;
  ci_recovery_share: number;
  merge_queue_wait: number;
  merge_queue_share: number;
}

export interface StageBaseline {
  label: string;
  target: string;
  actual: string;
  color: string;
  isOverSla: boolean;
}

export interface BottleneckTraceItem {
  id: string;
  pr_number: number;
  title: string;
  branch: string;
  repository: string;
  lifecycle_hours: number;
  review_wait_hours: number;
  ci_delay_hours: number;
  ci_delay_flaky?: boolean;
  rework_hours: number;
  primary_friction_stage: string;
  friction_severity: 'error' | 'warning' | 'optimal' | 'stalled';
}

export interface GanttStage {
  label: string;
  hours: number;
  percentage: number;
  timePoint: string;
  color: string;
  isWarning?: boolean;
}

export interface RiskSummary {
  high_risk_prs: number;
  high_risk_share: number;
  medium_risk_prs: number;
  medium_risk_share: number;
  low_risk_prs: number;
  low_risk_share: number;
  average_risk_score: number;
  average_risk_delta: string;
  repository_baseline: number;
  sample_prs: number;
}

export interface RiskPRItem {
  id: string;
  pr_number: number;
  title: string;
  branch: string;
  touched_time: string;
  change_size_lines: number;
  added_lines: number;
  deleted_lines: number;
  files_count: number;
  failure_signal: string;
  failure_signal_color: 'error' | 'tertiary' | 'secondary' | 'neutral';
  ci_signal: string;
  ci_signal_color: 'error' | 'tertiary' | 'secondary' | 'neutral';
  config_impact: string;
  config_impact_color: 'error' | 'tertiary' | 'secondary' | 'neutral';
  risk_score: number;
  risk_status: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RiskHeuristicItem {
  id: string;
  title: string;
  points: number;
  description: string;
}

export interface RepositoryHotspotItem {
  id: string;
  path: string;
  changes_count: number;
  failures_count: number;
  failure_rate_percent: number;
  trend_label: string;
  trend_status: 'degrading' | 'improving' | 'stable';
  friction_category: string;
}

export interface DimensionalSignalItem {
  id: string;
  name: string;
  score: number;
  weight: number;
  statusBadge: string;
  statusColor: 'secondary' | 'error' | 'tertiary';
  description: string;
  targetText: string;
  deltaText: string;
  isDeficit?: boolean;
}

export interface ReleaseBlockerItem {
  id: string;
  category: string;
  targetId: string;
  description: string;
  highlightTag?: string;
  actionText?: string;
}

export interface ReleaseWarningItem {
  id: string;
  category: string;
  deviationBadge: string;
  description: string;
  highlightTag?: string;
}

export interface PositiveSignalItem {
  id: string;
  category: string;
  statusBadge: string;
  description: string;
  highlightTag?: string;
}

export interface CandidatePRTraceItem {
  id: string;
  pr_number: number;
  title: string;
  branch: string;
  commit_sha: string;
  touched_subsystems: string;
  risk_score: number;
  risk_label: string;
  ci_matrix_status: string;
  ci_matrix_is_passed: boolean;
  security_sbom: string;
  gate_decision: 'BLOCKED' | 'APPROVED' | 'CONDITIONAL';
}

export interface GitHubSyncSummary {
  active_repos: number;
  paused_repos: number;
  total_configured: number;
  prs_ingested: number;
  prs_today: number;
  review_threads_comments: string;
  workflow_runs_parsed: string;
  workflow_runs_today: string;
  parsing_drops: number;
  webhook_health_rate: number;
  p95_latency_ms: number;
  request_rate_per_min: number;
  api_quota_used: number;
  api_quota_total: number;
}

export interface ActiveSyncJob {
  repo_name: string;
  tier: string;
  description: string;
  current_step_name: string;
  current_step_index: number;
  progress_percent: number;
  processed_events: number;
  total_events: number;
  eta_seconds: number;
}

export interface SyncRepoItem {
  id: string;
  name: string;
  full_name: string;
  tier: string;
  description: string;
  primary_branch: string;
  status: 'SYNCING' | 'SYNCED' | 'SYNC FAILED';
  progress_percent?: number;
  last_synced: string;
  volume_summary: string;
  webhook_status: string;
}

export interface SyncAuditLogItem {
  id: string;
  timestamp: string;
  repo_name: string;
  trigger_type: string;
  details: string;
  result_metrics: string;
  status_badge: string;
  status_type: 'success' | 'warning' | 'error';
}

