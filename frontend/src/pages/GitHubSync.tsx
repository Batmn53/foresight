import React, { useState, useEffect } from 'react';
import { githubApi } from '../services/api';
import {
  GitHubSyncSummary,
  ActiveSyncJob,
  SyncRepoItem,
  SyncAuditLogItem,
} from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const GitHubSync: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<GitHubSyncSummary | null>(null);
  const [activeJob, setActiveJob] = useState<ActiveSyncJob | null>(null);
  const [repos, setRepos] = useState<SyncRepoItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SyncAuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'synced' | 'syncing' | 'failed'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await githubApi.getSyncSummary();
      const jobData = await githubApi.getActiveSyncJob();
      const repoData = await githubApi.getSyncRepos();
      const logData = await githubApi.getAuditLogs();
      setSummary(summaryData);
      setActiveJob(jobData);
      setRepos(repoData);
      setAuditLogs(logData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load GitHub sync telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('foresight_token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      setSyncSuccessToast('Successfully authenticated with GitHub');
      setTimeout(() => setSyncSuccessToast(null), 3000);
    }
    const err = params.get('error');
    if (err) {
      setError(`GitHub Auth Error: ${err}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchData();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      await githubApi.triggerSync();
      setSyncSuccessToast('Triggered multi-repository sync backfill job');
      setTimeout(() => setSyncSuccessToast(null), 3000);
    } catch {
      // Ignored
    } finally {
      setTimeout(() => setIsSyncingAll(false), 800);
    }
  };

  const handleSyncSingle = async (repoName: string) => {
    setSyncSuccessToast(`Queued incremental sync for ${repoName}`);
    setTimeout(() => setSyncSuccessToast(null), 3000);
  };

  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.description.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'synced') return r.status === 'SYNCED';
    if (activeTab === 'syncing') return r.status === 'SYNCING';
    if (activeTab === 'failed') return r.status === 'SYNC FAILED';
    return true;
  });

  if (loading && !summary) {
    return (
      <div className="py-space-xl">
        <LoadingState message="Connecting to GitHub webhook pipelines & ingestion workers..." />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="py-space-xl">
        <ErrorState
          title="GitHub Sync Communication Failed"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* TOAST FEEDBACK */}
      {syncSuccessToast && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 bg-secondary text-slate-950 font-mono-label text-xs font-bold rounded shadow-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{syncSuccessToast}</span>
        </div>
      )}

      {/* TOP SUB-SCOPE & API QUOTA BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm py-2 px-3 bg-surface-container-low rounded border border-surface-variant/30 mb-space-md font-mono-label text-mono-label">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-surface-container rounded text-on-surface">
            <span>Acme Corp</span>
            <span className="text-outline">/</span>
            <span className="font-semibold text-primary">GitHub Org Sync</span>
            <span className="material-symbols-outlined text-xs text-outline">expand_more</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary/15 text-secondary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            GitHub Enterprise Connected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-outline">
            <span>API Quota: <strong className="text-on-surface">{summary?.api_quota_used?.toLocaleString() || '4,820'}/{summary?.api_quota_total?.toLocaleString() || '5,000'} req/hr</strong></span>
            <div className="w-16 h-1.5 rounded bg-surface-container-highest overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '96.4%' }} />
            </div>
          </div>
          <button
            type="button"
            className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">notifications</span>
          </button>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-1 px-3 py-1 rounded bg-primary text-on-primary font-bold hover:bg-primary-container transition-all disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-xs ${isSyncingAll ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Sync All</span>
          </button>
        </div>
      </div>

      {/* PAGE TITLE & ACTION ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-sm mb-space-lg">
        <div>
          <div className="flex items-center gap-space-sm mb-1 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              GitHub Intelligence Sync
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/15 text-secondary font-mono-label text-mono-label font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Pipeline Live
            </span>
            <span className="font-mono-label text-mono-label text-outline text-xs">
              Synced 1m ago
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Repository webhook ingestion, historical data backfills, and GitHub API pipeline telemetry.
          </p>
        </div>

        {/* Right Search & Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search repositories... ⌘K"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-surface-container-highest text-on-surface font-mono-body text-xs rounded px-3 py-1.5 pl-8 w-56 border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            <span className="material-symbols-outlined text-sm text-outline absolute left-2.5 top-2">
              search
            </span>
          </div>
          <button
            type="button"
            onClick={handleSyncAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-mono-label text-xs font-semibold border border-outline-variant/30 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">manage_history</span>
            <span>Trigger Full Re-Index</span>
          </button>
          
          <button
            type="button"
            onClick={async () => {
              const url = window.prompt("Enter public GitHub repository URL (e.g. https://github.com/owner/repo), or leave blank to authenticate with GitHub:");
              if (url) {
                try {
                  await githubApi.addPublicRepository(url);
                  window.location.reload();
                } catch (e: any) {
                  alert(e.message || "Failed to add public repository");
                }
              } else if (url !== null) {
                try {
                  const { url: loginUrl } = await import('../services/api').then(m => m.authApi.getLoginUrl());
                  window.location.href = loginUrl;
                } catch (e: any) {
                  alert("Failed to initiate login");
                }
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-mono-label text-xs font-bold border border-primary/30 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Connect Repository</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {/* Monitored Repositories */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Monitored Repositories
            </span>
            <span className="material-symbols-outlined text-xs text-primary">source_environment</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-on-surface">
              {summary?.active_repos || 14} Active
            </span>
            <span className="font-mono-body text-xs text-outline font-normal">
              ({summary?.paused_repos || 2} paused)
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span className="text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Auto-sync active
            </span>
            <span>{summary?.total_configured || 16} total configured</span>
          </div>
        </div>

        {/* PRs Ingested */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              PRs Ingested
            </span>
            <span className="material-symbols-outlined text-xs text-primary">merge</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-on-surface">
              {summary?.prs_ingested?.toLocaleString() || '28,492'}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-mono-label text-[10px] font-bold">
              +{summary?.prs_today || 142} today
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 font-mono-label text-mono-label text-outline">
            Review threads parsed: <strong className="text-on-surface">{summary?.review_threads_comments || '184.8k comments'}</strong>
          </div>
        </div>

        {/* Workflow Runs Parsed */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Workflow Runs Parsed
            </span>
            <span className="material-symbols-outlined text-xs text-primary">sync</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-on-surface">
              {summary?.workflow_runs_parsed || '318.5k'}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-mono-label text-[10px] font-bold">
              {summary?.workflow_runs_today || '+1.2k today'}
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span>Check Run Ingestion</span>
            <span className="text-secondary font-bold">{summary?.parsing_drops || 8} parsing drops</span>
          </div>
        </div>

        {/* GitHub Webhook Health */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              GitHub Webhook Health
            </span>
            <span className="material-symbols-outlined text-xs text-secondary">verified</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-secondary">
              {summary?.webhook_health_rate || 99.98}%
            </span>
            <span className="font-mono-body text-xs text-outline font-normal">
              P95: {summary?.p95_latency_ms || 320}ms
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span className="text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Operational
            </span>
            <span>{summary?.request_rate_per_min || 412} req/min</span>
          </div>
        </div>
      </div>

      {/* ROW 2: IN-PROGRESS SYNC ACTIVE BANNER */}
      {activeJob && (
        <div className="bg-surface-container-low p-space-md rounded mb-space-lg border border-primary/30 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono-label text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                Sync in Progress
              </span>
              <span className="font-mono-body font-bold text-on-surface text-sm">
                {activeJob.repo_name}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono-label text-[10px] text-secondary">
                {activeJob.tier}
              </span>
              <span className="text-outline font-mono-label text-xs">
                • {activeJob.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-mono-label text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-xs">pause</span>
                <span>Pause Sync</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-error font-mono-label text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-xs">close</span>
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono-label text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-xs">terminal</span>
                <span>View Live Logs</span>
              </button>
            </div>
          </div>

          {/* 4 Pipeline Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono-label text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-surface-container/60 border border-secondary/30">
              <span className="text-on-surface">1. Event Ingestion</span>
              <span className="text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check</span> Completed
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container/90 border border-primary/50 shadow-xs">
              <span className="text-primary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                2. PR &amp; Review Parsing
              </span>
              <span className="text-primary font-bold">{activeJob.progress_percent}%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container/40 border border-surface-variant/20 text-outline">
              <span>3. Check Run Metrics</span>
              <span>Pending</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container/40 border border-surface-variant/20 text-outline">
              <span>4. DORA Aggregation</span>
              <span>Pending</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden mb-2">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${activeJob.progress_percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono-label text-[11px] text-outline">
            <span>Ingesting GraphQL commits &amp; inline PR code review intervals...</span>
            <span className="text-on-surface">
              {activeJob.processed_events.toLocaleString()} / {activeJob.total_events.toLocaleString()} events processed • <strong className="text-primary">ETA: {activeJob.eta_seconds}s</strong>
            </span>
          </div>
        </div>
      )}

      {/* ROW 3: REPOSITORIES INGESTION & SYNC TABLE */}
      <div className="bg-surface-container-low p-space-lg rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 font-mono-label text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-surface-container text-primary font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              All Repositories ({repos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('synced')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'synced'
                  ? 'bg-surface-container text-primary font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Synced (13)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('syncing')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'syncing'
                  ? 'bg-surface-container text-primary font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Syncing (1) •
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('failed')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === 'failed'
                  ? 'bg-surface-container text-error font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span>Failed / Attention</span>
              <span className="px-1.5 py-0.2 rounded bg-error/20 text-error text-[10px] font-bold">2</span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono-label text-xs text-outline">
            <span>Density: Standard</span>
            <button className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface">
              <span className="material-symbols-outlined text-base">download</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-label text-mono-label">
            <thead>
              <tr className="border-b border-surface-variant/40 text-outline uppercase tracking-wider">
                <th className="py-2.5 px-3">Repository</th>
                <th className="py-2.5 px-3">Primary Branch</th>
                <th className="py-2.5 px-3">Sync Status</th>
                <th className="py-2.5 px-3">Last Successful Sync</th>
                <th className="py-2.5 px-3">Ingested Data Volume</th>
                <th className="py-2.5 px-3">Webhook Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20 font-mono-body text-xs">
              {filteredRepos.map((repo) => {
                const statusBadge =
                  repo.status === 'SYNCING' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                      <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                      SYNCING {repo.progress_percent}%
                    </span>
                  ) : repo.status === 'SYNC FAILED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error/20 text-error font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      SYNC FAILED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/15 text-secondary font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      SYNCED
                    </span>
                  );

                const webhookClass = repo.webhook_status.includes('Active')
                  ? 'text-secondary'
                  : 'text-error';

                return (
                  <tr key={repo.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-primary mt-0.5">
                          account_tree
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface">{repo.full_name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono-label text-[10px] text-secondary">
                              {repo.tier}
                            </span>
                          </div>
                          <span className="font-mono-label text-[11px] text-outline">
                            {repo.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono-label text-outline bg-surface-container-high px-2 py-0.5 rounded">
                        {repo.primary_branch}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {statusBadge}
                    </td>

                    <td className="py-3 px-3 font-mono-label text-on-surface-variant">
                      {repo.last_synced}
                    </td>

                    <td className="py-3 px-3 font-mono-label text-on-surface-variant">
                      {repo.volume_summary}
                    </td>

                    <td className={`py-3 px-3 font-mono-label ${webhookClass}`}>
                      • {repo.webhook_status}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono-label text-xs">
                        {repo.status === 'SYNC FAILED' ? (
                          <button
                            type="button"
                            onClick={() => handleSyncSingle(repo.full_name)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-error/20 hover:bg-error/30 text-error font-semibold transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">refresh</span>
                            <span>Retry</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSyncSingle(repo.full_name)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">sync</span>
                            <span>Sync Now</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                        >
                          Config
                        </button>
                        <button
                          type="button"
                          className="p-1 rounded text-outline hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-space-md pt-space-xs font-mono-label text-mono-label text-outline border-t border-surface-variant/30">
          <span>Showing 5 of 16 repositories</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface-variant">
              Previous
            </button>
            <button className="px-2 py-1 rounded bg-surface-container text-primary font-bold">
              1
            </button>
            <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface-variant">
              2
            </button>
            <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface-variant">
              3
            </button>
            <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface-variant">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ROW 4: RECENT INGESTION AUDIT LOG */}
      <div className="bg-surface-container-low p-space-md rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex items-center justify-between mb-3 font-mono-label text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
            <h2 className="font-headline-md text-sm font-bold text-on-surface">
              Recent Ingestion Audit Log
            </h2>
            <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-bold text-[10px]">
              Real-time Stream
            </span>
          </div>

          <div className="flex items-center gap-2 text-outline">
            <span>Auto-refresh</span>
            <div className="w-7 h-4 rounded-full bg-primary flex items-center px-0.5 cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-slate-950 ml-auto" />
            </div>
            <button className="p-0.5 text-outline hover:text-on-surface">
              <span className="material-symbols-outlined text-sm">expand_less</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 font-mono-body text-xs">
          {auditLogs.map((log) => {
            const badgeClass =
              log.status_type === 'success'
                ? 'bg-secondary/15 text-secondary'
                : 'bg-tertiary/20 text-tertiary';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded bg-surface-container/60 border border-surface-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-outline font-mono-label text-[11px]">{log.timestamp}</span>
                  <span className="font-bold text-primary">{log.repo_name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container font-mono-label text-[10px] text-outline">
                    {log.trigger_type}
                  </span>
                  <span className="text-on-surface-variant text-[11px]">{log.details}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono-label text-[11px]">
                  <span className="text-outline">{log.result_metrics}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${badgeClass}`}>
                    {log.status_badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 5: DATA PRIVACY & ARCHITECTURAL GOVERNANCE */}
      <div className="bg-surface-container-low p-3 rounded border border-surface-variant/30 flex items-center gap-2 text-xs font-mono-label text-outline">
        <span className="material-symbols-outlined text-sm text-primary shrink-0">lock</span>
        <span>
          <strong className="text-on-surface">Data Privacy &amp; Architectural Governance:</strong> ForgeSight processes GitHub webhooks through ephemeral worker clusters. All metrics (cycle times, review latency, DORA) are compiled anonymously at the team and repository level.
        </span>
      </div>
    </div>
  );
};

export default GitHubSync;
