import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const metricsApi = {
  getTimeToMerge: async (repoId: string, days = 30) => {
    // TODO: Connect to /metrics/time-to-merge
    const res = await api.get(`/metrics/time-to-merge?repository_id=${repoId}&days=${days}`);
    return res.data;
  },
  getBuildFailures: async (repoId: string, days = 30) => {
    // TODO: Connect to /metrics/build-failures
    const res = await api.get(`/metrics/build-failures?repository_id=${repoId}&days=${days}`);
    return res.data;
  },
  getTrends: async (repoId: string, days = 30) => {
    // TODO: Connect to /metrics/trends
    const res = await api.get(`/metrics/trends?repository_id=${repoId}&days=${days}`);
    return res.data;
  },
};

export const githubApi = {
  getRepositories: async () => {
    // TODO: Connect to /github/repositories
    const res = await api.get('/github/repositories');
    return res.data;
  },
  triggerSync: async (repoId: string) => {
    // TODO: Connect to /github/sync
    const res = await api.post('/github/sync', { repository_id: repoId });
    return res.data;
  },
};

export default api;
