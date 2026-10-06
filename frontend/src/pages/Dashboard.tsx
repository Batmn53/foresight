import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { ChartCard } from '../components/ChartCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { metricsApi } from '../services/api';
import {
  mockMetricsOverview,
  mockThroughputData,
  mockLifecycleData,
  mockCIReliabilityData,
  mockWorkflowHealth,
  mockEngineeringSignals,
} from '../services/mockData';
import {
  MetricsOverview,
  PRThroughputDataPoint,
  LifecycleDataPoint,
  CIReliabilityDataPoint,
  WorkflowHealthItem,
  EngineeringSignal,
  Repository,
} from '../types';

interface LayoutContextType {
  selectedRepo: Repository | null;
  timeRange: string;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export const Dashboard: React.FC = () => {
  const context = useOutletContext<LayoutContextType | undefined>();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [throughputData, setThroughputData] = useState<PRThroughputDataPoint[]>([]);
  const [lifecycleData, setLifecycleData] = useState<LifecycleDataPoint[]>([]);
  const [ciReliabilityData, setCiReliabilityData] = useState<CIReliabilityDataPoint[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowHealthItem[]>([]);
  const [signals, setSignals] = useState<EngineeringSignal[]>([]);

  // Local dashboard scope controls
  const [timeWindow, setTimeWindow] = useState<'7D' | '30D' | '90D'>('30D');
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [localSyncing, setLocalSyncing] = useState(false);

  const activeRepo = context?.selectedRepo?.full_name || 'org/core-telemetry-service';
  const isGlobalSyncing = context?.isSyncing || localSyncing;

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const days = timeWindow === '7D' ? 7 : timeWindow === '90D' ? 90 : 30;
      const data = await metricsApi.getOverview(context?.selectedRepo?.id, days);
      setOverview(data || mockMetricsOverview);

      // Set time-series data
      setThroughputData(mockThroughputData);
      setLifecycleData(mockLifecycleData);
      setCiReliabilityData(mockCIReliabilityData);
      setWorkflows(mockWorkflowHealth);
      setSignals(mockEngineeringSignals);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  }, [context?.selectedRepo?.id, timeWindow]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSyncNow = async () => {
    setLocalSyncing(true);
    if (context?.onSync) {
      await context.onSync();
    }
    await loadDashboardData();
    setTimeout(() => {
      setLocalSyncing(false);
    }, 800);
  };

  if (loading && !overview) {
    return (
      <div className="py-space-xl">
        <LoadingState message="Connecting to Live Telemetry Diagnostics..." />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="py-space-xl">
        <ErrorState
          title="Telemetry Connection Failed"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="py-space-xl">
        <EmptyState
          title="No Telemetry Data Available"
          description="We could not aggregate data for this repository. Sync your GitHub telemetry to start visualizing metrics."
          actionLabel="Trigger Sync"
          onAction={handleSyncNow}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* DASHBOARD TOP HEADER & SCOPE BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-lg mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-1 flex-wrap">
            <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Engineering Command Center
            </span>
            <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-mono-label text-mono-label">
              <span className="material-symbols-outlined text-xs">monitoring</span>
              Live Telemetry
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Aggregated team-level delivery velocity, review queue latencies, and CI/CD cluster resilience across base branches.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Repo Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
              className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded gap-space-sm hover:bg-surface-container transition-colors text-left"
            >
              <span className="material-symbols-outlined text-sm text-primary">source_environment</span>
              <span className="font-mono-body text-mono-body font-medium text-on-surface truncate max-w-[180px]">
                {activeRepo}
              </span>
              <span className="font-mono-label text-mono-label text-secondary bg-surface-container-high px-space-xs py-0.5 rounded">
                Tier-0 Service
              </span>
              <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
            </button>

            {repoDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-surface-container-highest border border-outline-variant/40 rounded shadow-xl py-1 z-50">
                <div className="px-3 py-1 font-mono-label text-mono-label text-outline uppercase tracking-wider">
                  Select Scope
                </div>
                {['org/core-telemetry-service', 'org/auth-gateway', 'org/data-pipeline-runner'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setRepoDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-mono-body hover:bg-surface-container flex items-center justify-between text-on-surface"
                  >
                    <span className="truncate">{name}</span>
                    {name === activeRepo && (
                      <span className="material-symbols-outlined text-xs text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Window Segment */}
          <div className="flex items-center bg-surface-container-lowest p-1 rounded font-mono-label text-mono-label">
            {(['7D', '30D', '90D'] as const).map((range) => {
              const isActive = timeWindow === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeWindow(range)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    isActive
                      ? 'bg-surface-container text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>

          {/* Live Webhook Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-space-sm py-1.5 bg-surface-container-lowest rounded font-mono-label text-mono-label">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="text-on-surface-variant">
              Webhook: <span className="text-secondary font-medium">Active</span>
            </span>
            <span className="text-outline">·</span>
            <span className="text-outline">Synced 28s ago</span>
          </div>

          {/* Sync Action */}
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isGlobalSyncing}
            className="flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all disabled:opacity-60"
          >
            <span
              className={`material-symbols-outlined text-sm ${isGlobalSyncing ? 'animate-spin' : ''}`}
              style={{ animationDuration: '2s' }}
            >
              autorenew
            </span>
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      {/* PRIMARY METRIC TILES: 6 High-Density Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md mb-space-xl">
        {/* Tile 1: PRs Merged */}
        <MetricCard
          label="PRs Merged"
          value={overview.merged_prs}
          unit="PRs"
          tooltipText="Total pull requests merged into base branches within the selected time window."
          change={{
            text: overview.merged_prs_change || '+12% vs 30d',
            icon: 'trending_up',
            colorClass: 'bg-secondary/15 text-secondary',
          }}
          sparklinePath="M0 13 L8 12 L18 10 L28 11 L38 6 L46 8 L56 2"
          sparklineColorClass="text-secondary"
        />

        {/* Tile 2: Open PRs */}
        <MetricCard
          label="Open PRs"
          value={overview.open_prs}
          unit="Active"
          tooltipText="Currently open pull requests awaiting review, CI checks, or merge approval."
          change={{
            text: overview.open_prs_change || '-4% vs 30d',
            icon: 'trending_down',
            colorClass: 'bg-primary/15 text-primary',
          }}
          sparklinePath="M0 4 L10 5 L20 8 L32 7 L42 12 L50 9 L56 13"
          sparklineColorClass="text-primary"
        />

        {/* Tile 3: Median Time to Merge */}
        <MetricCard
          label="Median Merge Time"
          value={overview.median_time_to_merge_hours}
          unit="hrs"
          valueColorClass="text-tertiary"
          tooltipText="PR lifecycle time: Measured strictly from PR creation to merge completion. Reflects team review and CI pipeline latency, NOT individual developer working time."
          change={{
            text: overview.median_time_change || '+4.2h vs 30d',
            icon: 'warning',
            colorClass: 'bg-tertiary/15 text-tertiary',
          }}
          sparklinePath="M0 12 L10 11 L22 13 L34 8 L44 5 L56 3"
          sparklineColorClass="text-tertiary"
        />

        {/* Tile 4: Build Failure Rate */}
        <MetricCard
          label="Build Failure Rate"
          value={`${overview.build_failure_rate}%`}
          unit="fail"
          tooltipText="Percentage of CI build runs that terminated with non-zero exit code or build failure."
          change={{
            text: overview.build_failure_rate_change || '-1.1% vs 30d',
            icon: 'arrow_downward',
            colorClass: 'bg-secondary/15 text-secondary',
          }}
          sparklinePath="M0 5 L12 6 L24 8 L36 9 L46 11 L56 13"
          sparklineColorClass="text-secondary"
        />

        {/* Tile 5: Workflow Success */}
        <MetricCard
          label="Workflow Success"
          value={`${overview.workflow_success_rate}%`}
          unit="pass"
          valueColorClass="text-secondary"
          tooltipText="Overall workflow execution success across all automated integration and deploy runs."
          change={{
            text: overview.workflow_success_rate_change || '+1.1% vs 30d',
            icon: 'arrow_upward',
            colorClass: 'bg-secondary/15 text-secondary',
          }}
          sparklinePath="M0 12 L14 10 L24 9 L34 7 L44 5 L56 3"
          sparklineColorClass="text-secondary"
        />

        {/* Tile 6: Release Readiness */}
        <MetricCard
          label="Release Readiness"
          value={`${overview.release_readiness_score}%`}
          valueColorClass="text-primary"
          statusBadge={{
            label: overview.release_readiness_status || 'READY',
            bgColor: 'bg-secondary/15',
            textColor: 'text-secondary',
          }}
          tooltipText="Composite index evaluating automated test passes, schema verification, and open blocking bugs."
          change={{
            text: overview.release_readiness_change || 'Stable (+0%)',
            icon: 'horizontal_rule',
            colorClass: 'bg-surface-container text-outline',
          }}
          sparklinePath="M0 7 L12 7 L24 6 L36 8 L46 6 L56 6"
          sparklineColorClass="text-primary"
        />
      </div>

      {/* MAIN TELEMETRY CHARTS 2x2 GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg mb-space-xl">
        {/* CHART 1: PR Throughput (Area/Line) */}
        <ChartCard
          title="Pull Request Throughput"
          subtitle={`Volume of pull requests opened vs. merged over ${timeWindow}`}
          icon="call_split"
          iconColorClass="text-primary"
          legend={
            <div className="flex items-center gap-space-md font-mono-label text-mono-label">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-primary rounded" />
                <span className="text-on-surface">PRs Opened</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-secondary rounded" />
                <span className="text-on-surface">PRs Merged</span>
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-between font-mono-label text-mono-label text-outline">
              <span className="text-on-surface-variant">
                Throughput Convergence:{' '}
                <span className="text-secondary font-medium">
                  +1.08 ratio (Net clearing backlogs)
                </span>
              </span>
              <span>Baseline Mean: 4.7 PRs/day</span>
            </div>
          }
        >
          <div className="w-full h-64 bg-surface-container-lowest/60 rounded p-space-sm flex flex-col justify-between relative overflow-hidden">
            {/* Dynamic Readout pill in chart */}
            <div className="absolute right-4 top-3 bg-surface-container-high px-2 py-1 rounded shadow-md font-mono-label text-mono-label flex items-center gap-2 pointer-events-none z-10">
              <span className="text-primary">Opened: 34</span>
              <span className="text-outline">|</span>
              <span className="text-secondary font-bold">Merged: 38 (Sprint Peak)</span>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={throughputData}
                  margin={{ top: 25, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8ed5ff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#8ed5ff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="#87929a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <YAxis
                    stroke="#87929a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#19202a',
                      borderColor: '#3e484f',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      color: '#dce3f1',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    name="PRs Opened"
                    stroke="#8ed5ff"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    fill="url(#primaryGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="merged"
                    name="PRs Merged"
                    stroke="#4edea3"
                    strokeWidth={2.5}
                    fill="url(#secondaryGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* CHART 2: PR Lifecycle Time (Line + SLA line) */}
        <ChartCard
          title="PR Lifecycle Time (Median Time to Merge)"
          subtitle="PR duration from creation to merge completion (review queues + CI pipelines)"
          icon="timer"
          iconColorClass="text-tertiary"
          legend={
            <div className="flex items-center gap-space-md font-mono-label text-mono-label">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-tertiary rounded" />
                <span className="text-on-surface">Median Time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-error rounded" />
                <span className="text-on-surface">SLA Target (16.0h)</span>
              </div>
            </div>
          }
          disclaimer="PR lifecycle time measures workflow and review cycle latency; does not represent developer working time."
        >
          <div className="w-full h-64 bg-surface-container-lowest/60 rounded p-space-sm flex flex-col justify-between relative overflow-hidden">
            {/* Callout Badge */}
            <div className="absolute right-4 top-3 bg-surface-container-high px-2 py-1 rounded shadow-md font-mono-label text-mono-label text-tertiary flex items-center gap-1 z-10 pointer-events-none">
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
              <span>Current: 18.4h (Above Target)</span>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lifecycleData}
                  margin={{ top: 25, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#87929a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <YAxis
                    stroke="#87929a"
                    fontSize={11}
                    domain={[10, 22]}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#19202a',
                      borderColor: '#3e484f',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      color: '#dce3f1',
                    }}
                    formatter={(value: any) => [`${value} hrs`, 'Lifecycle Time']}
                  />
                  <ReferenceLine
                    y={16.0}
                    stroke="#ffb4ab"
                    strokeDasharray="6 3"
                    label={{
                      value: 'Target SLA: 16.0h',
                      position: 'insideBottomLeft',
                      fill: '#ffb4ab',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#ffc174"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ffc174' }}
                    activeDot={{ r: 5, fill: '#ffc174', stroke: '#0d141e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* CHART 3: CI Reliability & Pipeline Success */}
        <ChartCard
          title="CI Reliability & Pipeline Success"
          subtitle="Success rate vs failure rate across automated test and build workflows"
          icon="verified"
          iconColorClass="text-secondary"
          legend={
            <div className="flex items-center gap-space-md font-mono-label text-mono-label">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-secondary rounded" />
                <span className="text-on-surface">Success (95.2%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-error rounded" />
                <span className="text-on-surface">Failure (4.8%)</span>
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-between font-mono-label text-mono-label text-outline">
              <span className="text-on-surface-variant">
                Cluster MTTR (Mean Recovery Time):{' '}
                <span className="text-secondary font-medium">11.4 mins</span>
              </span>
              <span>Total Evaluated Runs: 1,842</span>
            </div>
          }
        >
          <div className="w-full h-64 bg-surface-container-lowest/60 rounded p-space-sm flex flex-col justify-between relative overflow-hidden">
            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ciReliabilityData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    stroke="#87929a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <YAxis
                    stroke="#87929a"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: '#2e3540' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#19202a',
                      borderColor: '#3e484f',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      color: '#dce3f1',
                    }}
                    formatter={(value: any, name: string) => [`${value}%`, name]}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#4edea3"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#4edea3' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failureRate"
                    name="Failure Rate"
                    stroke="#ffb4ab"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#ffb4ab' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* CHART 4: Workflow Health & Failure Concentration */}
        <ChartCard
          title="Workflow Health & Failure Concentration"
          subtitle="Most failure-prone CI workflows ranked by failure rate over 30d"
          icon="density_medium"
          iconColorClass="text-primary"
          headerRight={
            <span className="font-mono-label text-mono-label text-outline">
              Top 5 Analyzed
            </span>
          }
          footer={
            <div className="flex items-center justify-between font-mono-label text-mono-label text-outline">
              <span className="text-on-surface-variant">
                Pipeline Flakiness Index:{' '}
                <span className="text-on-surface font-medium">1.4% (Healthy tier)</span>
              </span>
              <span>Runner Pool: 64 Concurrency</span>
            </div>
          }
        >
          <div className="w-full h-64 bg-surface-container-lowest/60 rounded p-space-md flex flex-col justify-around">
            {workflows.map((wf) => {
              const failWidth = `${wf.failureRate}%`;
              const passWidth = `${(100 - wf.failureRate).toFixed(1)}%`;
              const barColor =
                wf.accent === 'error'
                  ? 'bg-error'
                  : wf.accent === 'tertiary'
                  ? 'bg-tertiary'
                  : 'bg-secondary';
              const dotColor =
                wf.accent === 'error'
                  ? 'bg-error'
                  : wf.accent === 'tertiary'
                  ? 'bg-tertiary'
                  : 'bg-secondary';
              const badgeClass =
                wf.accent === 'error'
                  ? 'bg-error/20 text-error'
                  : wf.accent === 'tertiary'
                  ? 'bg-tertiary/20 text-tertiary'
                  : 'bg-secondary/15 text-secondary';

              return (
                <div key={wf.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono-label text-mono-label">
                    <span className="text-on-surface font-semibold flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                      <span className="truncate">{wf.name}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-outline">{wf.runs.toLocaleString()} runs</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${badgeClass}`}>
                        {wf.failureRate}% fail
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden flex">
                    <div className={`h-full ${barColor}`} style={{ width: failWidth }} />
                    <div className="h-full bg-secondary-container" style={{ width: passWidth }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* INSIGHT PANEL: "Engineering Signals" */}
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-xl">radar</span>
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Engineering Signals
              </h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Automated statistical observations across team delivery pipelines and CI runners (30d window)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs font-mono-label text-mono-label bg-surface-container-high px-space-sm py-1 rounded self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-on-surface font-semibold">
              {signals.length} Active Signals Synthesized
            </span>
          </div>
        </div>

        {/* 4 High-Fidelity Signal Cards with Semantic Accents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {signals.map((sig) => {
            const accentBorder =
              sig.accent === 'tertiary'
                ? 'bg-tertiary'
                : sig.accent === 'error'
                ? 'bg-error'
                : sig.accent === 'secondary'
                ? 'bg-secondary'
                : 'bg-primary';

            const iconBox =
              sig.accent === 'tertiary'
                ? 'bg-tertiary/15 text-tertiary'
                : sig.accent === 'error'
                ? 'bg-error/15 text-error'
                : sig.accent === 'secondary'
                ? 'bg-secondary/15 text-secondary'
                : 'bg-primary/15 text-primary';

            const badgeBox =
              sig.accent === 'tertiary'
                ? 'bg-tertiary/20 text-tertiary'
                : sig.accent === 'error'
                ? 'bg-error/20 text-error'
                : sig.accent === 'secondary'
                ? 'bg-secondary/20 text-secondary'
                : 'bg-primary/20 text-primary';

            return (
              <div
                key={sig.id}
                className="bg-surface-container-low p-space-md rounded flex items-start gap-space-md relative overflow-hidden group hover:bg-surface-container transition-colors shadow-sm border border-transparent hover:border-surface-variant/30"
              >
                <div className={`w-1 absolute left-0 top-0 bottom-0 ${accentBorder}`} />
                <div
                  className={`w-8 h-8 rounded ${iconBox} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <span className="material-symbols-outlined text-base">{sig.icon}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono-label text-mono-label px-1 py-0.5 rounded font-bold uppercase ${badgeBox}`}>
                      {sig.category}
                    </span>
                    <span className="font-mono-label text-mono-label text-outline">
                      {sig.statusBadge}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                    {sig.title}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {sig.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
