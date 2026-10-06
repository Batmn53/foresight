import axios from 'axios';
import { MetricsOverview, Repository, TrendDataPoint, SyncRepoItem, GitHubSyncSummary } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const baseURL = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foresight_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  getLoginUrl: async () => {
    const res = await api.get('/auth/github/login');
    return res.data;
  },
  callback: async (code: string) => {
    const res = await api.get(`/auth/github/callback?code=${code}`);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const metricsApi = {
  getOverview: async (repoId?: string, days = 30): Promise<MetricsOverview> => {
    if (!repoId) {
      throw new Error("Repository ID required");
    }
    const [ttmRes, bfRes] = await Promise.all([
      api.get(`/metrics/time-to-merge?repository_id=${repoId}&days=${days}`).catch(() => ({ data: { sample_size: 0, median_hours: 0 }})),
      api.get(`/metrics/build-failures?repository_id=${repoId}&days=${days}`).catch(() => ({ data: { failure_rate_percentage: 0, successful_runs: 0, total_completed_runs: 0 }}))
    ]);

    const ttm = ttmRes.data;
    const bf = bfRes.data;

    let successRate = 0;
    if (bf.total_completed_runs > 0) {
      successRate = (bf.successful_runs / bf.total_completed_runs) * 100;
    }

    return {
      merged_prs: ttm.sample_size || 0,
      open_prs: 0,
      median_time_to_merge_hours: ttm.median_hours || 0,
      build_failure_rate: bf.failure_rate_percentage || 0,
      workflow_success_rate: Number(successRate.toFixed(1)),
      release_readiness_score: 0,
    };
  },

  getTrends: async (repoId?: string, days = 30): Promise<TrendDataPoint[]> => {
    if (!repoId) return [];
    const res = await api.get(`/metrics/trends?repository_id=${repoId}&days=${days}`);
    return res.data?.data_points || res.data || [];
  },
};

export const bottlenecksApi = {
  getSummary: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/bottlenecks/summary?repository_id=${repoId}`);
    return res.data;
  },
  getTraces: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/bottlenecks/traces?repository_id=${repoId}`);
    return res.data;
  },
};

export const riskApi = {
  getSummary: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/risk/summary?repository_id=${repoId}`);
    return res.data;
  },
  getRadar: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/risk/radar?repository_id=${repoId}`);
    return res.data;
  },
};

export const releaseApi = {
  getReadiness: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/release/readiness?repository_id=${repoId}`);
    return res.data;
  },
};

export const aiApi = {
  getRisk: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/ai/risk?repository_id=${repoId}`);
    return res.data;
  },
  getRelease: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/ai/release?repository_id=${repoId}`);
    return res.data;
  },
  getBottlenecks: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/ai/bottlenecks?repository_id=${repoId}`);
    return res.data;
  },
  getSummary: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.get(`/ai/summary?repository_id=${repoId}`);
    return res.data;
  }
};

export const githubApi = {
  getRepositories: async (): Promise<Repository[]> => {
    const res = await api.get('/github/repositories');
    return res.data;
  },

  addPublicRepository: async (url: string) => {
    const res = await api.post('/github/public-repo', { url });
    return res.data;
  },

  getSyncSummary: async (): Promise<GitHubSyncSummary> => {
    return {
      active_repos: 0, paused_repos: 0, total_configured: 0, prs_ingested: 0, prs_today: 0,
      review_threads_comments: '0', workflow_runs_parsed: '0', workflow_runs_today: '0',
      parsing_drops: 0, webhook_health_rate: 0, p95_latency_ms: 0, request_rate_per_min: 0,
      api_quota_used: 0, api_quota_total: 0
    };
  },

  getActiveSyncJob: async () => {
    return null;
  },

  getSyncRepos: async (): Promise<SyncRepoItem[]> => {
    const res = await api.get('/github/repositories');
    return res.data.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      tier: 'Tier-1',
      description: '',
      primary_branch: r.default_branch,
      status: 'SYNCED',
      last_synced: 'unknown',
      volume_summary: '-',
      webhook_status: 'Inactive'
    }));
  },

  getAuditLogs: async () => {
    return [];
  },

  triggerSync: async (repoId?: string) => {
    if (!repoId) throw new Error("Repository ID required");
    const res = await api.post('/github/sync', { repository_id: repoId, sync_type: 'FULL' });
    return res.data;
  },
};

export default api;


