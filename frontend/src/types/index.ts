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

export interface TrendDataPoint {
  date: string;
  time_to_merge_hours: number;
  build_failure_rate: number;
  pr_volume: number;
}

export interface BottleneckItem {
  pr_id: string;
  pr_number: number;
  title: string;
  waiting_hours: number;
  review_status: string;
}

export interface RiskFactor {
  factor_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface ReleaseReadiness {
  repository_id: string;
  is_ready_for_release: boolean;
  blocking_factors: string[];
  ci_health_rate: number;
  open_unmerged_prs: number;
}
