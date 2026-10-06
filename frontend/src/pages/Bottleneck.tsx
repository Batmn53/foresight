import React, { useState, useEffect } from 'react';
import { bottlenecksApi } from '../services/api';
import {
  BottleneckSummary,
  StageBaseline,
  GanttStage,
  BottleneckTraceItem,
} from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const Bottleneck: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BottleneckSummary | null>(null);
  const [baselines, setBaselines] = useState<StageBaseline[]>([]);
  const [ganttStages, setGanttStages] = useState<GanttStage[]>([]);
  const [traces, setTraces] = useState<BottleneckTraceItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [timeWindow, setTimeWindow] = useState('30D');
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [selectedPrId, setSelectedPrId] = useState('trace-1042');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bottlenecksApi.getSummary();
      const traceData = await bottlenecksApi.getTraces();
      setSummary(data.summary);
      setBaselines(data.baselines);
      setGanttStages(data.ganttStages);
      setTraces(traceData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load bottleneck analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTraces = traces.filter(
    (t) =>
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.branch.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(t.pr_number).includes(searchFilter)
  );

  if (loading && !summary) {
    return (
      <div className="py-space-xl">
        <LoadingState message="Analyzing PR lifecycle stage durations & friction vectors..." />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="py-space-xl">
        <ErrorState
          title="Bottleneck Analysis Failed"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* PAGE HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-lg mb-space-sm">
        <div>
          <div className="flex items-center gap-space-sm mb-1 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              PR Bottleneck Detective
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/15 text-primary font-mono-label text-mono-label font-bold border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIFECYCLE FORENSICS ACTIVE
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Isolate operational friction across asynchronous code reviews, automated CI test cycles, and deployment gate buffers.
          </p>
        </div>

        {/* Top Right Scope Bar */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* State Pill */}
          <div className="flex items-center gap-1.5 px- space-sm py-1.5 bg-surface-container-low rounded font-mono-label text-mono-label border border-surface-variant/30">
            <span className="text-outline">STATE:</span>
            <span className="text-on-surface font-semibold">All Merged &amp; Active</span>
            <span className="material-symbols-outlined text-xs text-outline">expand_more</span>
          </div>

          {/* Time range buttons */}
          <div className="flex items-center bg-surface-container-lowest p-0.5 rounded font-mono-label text-mono-label">
            {['7D', '14D', '30D', '90D', 'Custom'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeWindow(range)}
                className={`px-2 py-1 rounded transition-colors ${
                  timeWindow === range
                    ? 'bg-surface-container text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Run Trace Analysis Button */}
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">troubleshoot</span>
            <span>Run Trace Analysis</span>
          </button>
        </div>
      </div>

      {/* SYSTEMIC TELEMETRY RULE GOVERNANCE BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-surface-container-high/40 rounded border border-surface-variant/30 text-xs font-mono-label text-outline mb-space-lg">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary shrink-0">shield</span>
          <span>
            <strong className="text-on-surface">Systemic Telemetry Rule:</strong> PR Lifecycle metrics represent pipeline throughput, queue latency, and infrastructure runtime. They <span className="underline decoration-tertiary">never</span> reflect developer capability, individual velocity, or engineer rankings.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="text-primary hover:underline shrink-0 text-left sm:text-right"
        >
          Methodology Spec ↗
        </button>
      </div>

      {/* ROW 1: 5 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md mb-space-lg">
        {/* Mean Lifecycle */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Mean Lifecycle
            </span>
            <span className="material-symbols-outlined text-xs text-outline">timer</span>
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-mono-metric text-mono-metric text-on-surface">
              {summary?.mean_lifecycle || 21.8}
            </span>
            <span className="font-mono-body text-mono-body text-outline">h</span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center gap-1 text-tertiary font-mono-label text-mono-label">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>{summary?.mean_lifecycle_delta || '+3.2h vs 14d baseline'}</span>
          </div>
        </div>

        {/* Median (P50) Duration */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Median (P50) Duration
            </span>
            <span className="material-symbols-outlined text-xs text-primary">data_exploration</span>
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-mono-metric text-mono-metric text-primary">
              {summary?.median_duration || 18.4}
            </span>
            <span className="font-mono-body text-mono-body text-outline">h</span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center gap-1 text-tertiary font-mono-label text-mono-label">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>{summary?.median_duration_delta || '+4.2h vs 14d baseline'}</span>
          </div>
        </div>

        {/* Review Wait Median */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Review Wait Median
            </span>
            <span className="material-symbols-outlined text-xs text-tertiary">hourglass_top</span>
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-mono-metric text-mono-metric text-tertiary">
              {summary?.review_wait_median || 8.6}
            </span>
            <span className="font-mono-body text-mono-body text-outline">h</span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label">
            <span className="text-outline">Queue delay</span>
            <span className="text-tertiary font-bold">{summary?.review_wait_share || 46.7}% share</span>
          </div>
        </div>

        {/* CI Recovery Latency */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              CI Recovery Latency
            </span>
            <span className="material-symbols-outlined text-xs text-error">call_split</span>
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-mono-metric text-mono-metric text-error">
              {summary?.ci_recovery_latency || 5.4}
            </span>
            <span className="font-mono-body text-mono-body text-outline">h</span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label">
            <span className="text-outline">Flaky retry loops</span>
            <span className="text-error font-bold">{summary?.ci_recovery_share || 29.5}% share</span>
          </div>
        </div>

        {/* Merge Queue Wait */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Merge Queue Wait
            </span>
            <span className="material-symbols-outlined text-xs text-secondary">merge</span>
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-mono-metric text-mono-metric text-secondary">
              {summary?.merge_queue_wait || 2.1}
            </span>
            <span className="font-mono-body text-mono-body text-outline">h</span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label">
            <span className="text-outline">Gate validation</span>
            <span className="text-secondary font-bold">{summary?.merge_queue_share || 11.4}% (Optimal)</span>
          </div>
        </div>
      </div>

      {/* ROW 2: PRIMARY BOTTLENECK CARD + WHERE IS TIME SPENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
        {/* Left Card: Primary Delivery Bottleneck (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded flex flex-col justify-between relative overflow-hidden border border-error/20 shadow-sm">
          <div className="w-1 absolute left-0 top-0 bottom-0 bg-error" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-error/20 text-error font-mono-label text-mono-label font-bold tracking-wider uppercase">
                Primary Delivery Bottleneck Detected
              </span>
              <span className="font-mono-label text-mono-label text-outline">
                Confidence: 94.6% (Bayesian Trace)
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
              CI Failure Recovery &amp; Runner Backoff
            </h2>

            <div className="flex items-center gap-2 my-2">
              <span className="font-mono-metric text-mono-metric text-error font-bold">
                41.2%
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                of total observed delivery latency across 88 PRs
              </span>
              <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono-label text-mono-label font-bold">
                +14.8% vs 28d
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Pull requests in this observation window spent an average of <strong className="text-on-surface font-mono-body">9.8h</strong> stalled in ephemeral test stages. The telemetry signals multiple socket timeout retries within integration suites rather than code review stalemates or merge train blocking.
            </p>
          </div>

          <div>
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-2">
              Recommended Engineering Interventions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="flex items-start gap-2 p-2.5 rounded bg-surface-container border border-tertiary/30">
                <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono-label text-mono-label font-bold text-on-surface">
                    Quarantine flaky test target
                  </span>
                  <span className="font-mono-body text-[11px] text-tertiary truncate">
                    integration-tests-e2e#412 (est. 3.2h delay)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded bg-surface-container border border-primary/30">
                <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                  tune
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono-label text-mono-label font-bold text-on-surface">
                    Auto-scale runner concurrency
                  </span>
                  <span className="font-mono-body text-[11px] text-primary truncate">
                    mitigate peak 15:00 UTC dispatch queue stalls
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Where is Time Spent (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-lg rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
                Lifecycle Distribution by Stage
              </span>
              <span className="font-mono-label text-mono-label text-outline">Total: 100%</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
              Where Is Time Spent?
            </h2>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded bg-surface-container-highest overflow-hidden flex mb-3 shadow-inner">
              <div className="h-full bg-error" style={{ width: '41.2%' }} title="CI Recovery: 41.2%" />
              <div className="h-full bg-tertiary" style={{ width: '34.6%' }} title="Review Wait: 34.6%" />
              <div className="h-full bg-primary" style={{ width: '12.1%' }} title="Author Rework: 12.1%" />
              <div className="h-full bg-secondary" style={{ width: '8.4%' }} title="Merge Queue: 8.4%" />
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 font-mono-label text-mono-label mb-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-error" /> CI Recovery
                </span>
                <span className="text-on-surface font-bold">41.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Review Wait
                </span>
                <span className="text-on-surface font-bold">34.6%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Author Rework
                </span>
                <span className="text-on-surface font-bold">12.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Merge Queue
                </span>
                <span className="text-on-surface font-bold">8.4%</span>
              </div>
            </div>
          </div>

          {/* SLA & Health Baselines */}
          <div className="pt-3 border-t border-surface-variant/30">
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-2">
              SLA &amp; Health Baselines
            </span>
            <div className="flex flex-col gap-3">
              {baselines.map((bl, i) => (
                <div key={i} className="flex flex-col gap-1 font-mono-label text-mono-label">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">{bl.label}</span>
                    <span className="font-bold" style={{ color: bl.color }}>
                      {bl.actual}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        backgroundColor: bl.color,
                        width: i === 0 ? '82%' : '62%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: INTERACTIVE LIFECYCLE STAGE WATERFALL GANTT */}
      <div className="bg-surface-container-low p-space-lg rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono-body text-mono-body font-bold text-primary">
              #1042 feat(auth): migrate to Ed25519 token signatures
            </span>
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-label text-mono-label font-bold">
              Merged
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono-label text-mono-label text-outline">
              main
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono-label text-mono-label text-secondary">
              Tier-0 Telemetry
            </span>
          </div>

          <div className="flex items-center gap-space-sm font-mono-label text-mono-label">
            <span className="text-outline uppercase">Total Observed Lifecycle</span>
            <span className="font-mono-metric text-lg font-bold text-on-surface">28.6h</span>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-xs">history</span>
              <span>Commit Log</span>
            </button>
          </div>
        </div>

        {/* Waterfall Gantt Visual Bar */}
        <div className="w-full bg-surface-container-lowest/80 p-space-md rounded border border-surface-variant/30 overflow-x-auto">
          {/* Timeline Milestones Header */}
          <div className="flex justify-between font-mono-label text-[11px] text-outline pb-2 min-w-[700px]">
            <span>T+0.0h (PR Created)</span>
            <span>T+7.2h (First Review)</span>
            <span>T+10.6h (Rework Pushed)</span>
            <span>T+11.0h - T+20.8h (Flaky Test Retry Loop)</span>
            <span>T+26.8h (Approved)</span>
            <span>T+28.6h (Merged)</span>
          </div>

          {/* Segmented Gantt Bar */}
          <div className="w-full h-10 rounded flex overflow-hidden min-w-[700px] border border-surface-variant/40">
            {ganttStages.map((stage, idx) => (
              <div
                key={idx}
                className="h-full flex items-center justify-center font-mono-label text-[11px] font-bold text-slate-900 transition-all hover:brightness-110 relative group/gantt select-none"
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color,
                }}
              >
                <div className="flex items-center gap-1 px-1 truncate">
                  {stage.isWarning && (
                    <span className="material-symbols-outlined text-xs text-error animate-pulse">
                      warning
                    </span>
                  )}
                  <span className="truncate">{stage.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Axis Labels Below Bar */}
          <div className="flex justify-between font-mono-label text-[10px] text-outline pt-2 min-w-[700px]">
            <span>Queue Wait: 7.2h (25%)</span>
            <span>Author Rework: 3.4h (12%)</span>
            <span className="text-error font-bold">CI Stall (Flake): 9.8h (34%)</span>
            <span>Re-Review Wait: 6.0h (21%)</span>
            <span>Merge Gate: 1.8h (6%)</span>
          </div>
        </div>
      </div>

      {/* ROW 4: OBSERVED PR LIFECYCLE FORENSIC TRACES TABLE */}
      <div className="bg-surface-container-low p-space-lg rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-xl">folder_supervised</span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                Observed PR Lifecycle Forensic Traces
                <span className="px-2 py-0.5 rounded bg-surface-container font-mono-label text-mono-label text-outline">
                  88 PRs Recorded
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by PR # or branch..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-surface-container-highest text-on-surface font-mono-body text-xs rounded px-3 py-1.5 pl-8 w-60 border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
              <span className="material-symbols-outlined text-sm text-outline absolute left-2.5 top-2">
                search
              </span>
            </div>
            <button
              type="button"
              className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface"
              title="Download traces"
            >
              <span className="material-symbols-outlined text-base">download</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-label text-mono-label">
            <thead>
              <tr className="border-b border-surface-variant/40 text-outline uppercase tracking-wider">
                <th className="py-2.5 px-3">Pull Request &amp; Branch</th>
                <th className="py-2.5 px-3">Repository</th>
                <th className="py-2.5 px-3">Lifecycle</th>
                <th className="py-2.5 px-3">Review Wait</th>
                <th className="py-2.5 px-3">CI Delay</th>
                <th className="py-2.5 px-3">Rework</th>
                <th className="py-2.5 px-3">Primary Friction Stage</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20 font-mono-body text-xs">
              {filteredTraces.map((trace) => {
                const badgeColor =
                  trace.friction_severity === 'error'
                    ? 'bg-error/20 text-error'
                    : trace.friction_severity === 'warning'
                    ? 'bg-tertiary/20 text-tertiary'
                    : trace.friction_severity === 'stalled'
                    ? 'bg-error/15 text-error font-bold'
                    : 'bg-secondary/15 text-secondary';

                const isSelected = selectedPrId === trace.id;

                return (
                  <tr
                    key={trace.id}
                    onClick={() => setSelectedPrId(trace.id)}
                    className={`hover:bg-surface-container/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-surface-container/70' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface hover:text-primary transition-colors">
                          #{trace.pr_number} {trace.title}
                        </span>
                        <span className="font-mono-label text-[11px] text-outline">
                          branch: {trace.branch}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant font-mono-label">
                      {trace.repository}
                    </td>
                    <td className="py-3 px-3 font-bold text-on-surface">
                      {trace.lifecycle_hours}h
                    </td>
                    <td className="py-3 px-3 text-tertiary">
                      {trace.review_wait_hours}h
                    </td>
                    <td className="py-3 px-3">
                      <span className={trace.ci_delay_flaky ? 'text-error font-semibold' : 'text-on-surface'}>
                        {trace.ci_delay_hours}h {trace.ci_delay_flaky ? '[Flaky]' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-primary">
                      {trace.rework_hours}h
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono-label text-mono-label ${badgeColor}`}>
                        {trace.primary_friction_stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrId(trace.id);
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono-label text-mono-label font-semibold border border-outline-variant/30 transition-colors"
                      >
                        Inspect Trace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex items-center justify-between mt-space-md pt-space-xs font-mono-label text-mono-label text-outline border-t border-surface-variant/30">
          <span>Displaying 5 of 88 pull request traces</span>
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

      {/* ROW 5: COLLAPSIBLE METHODOLOGY ACCORDION */}
      <div className="bg-surface-container-low rounded border border-surface-variant/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="w-full flex items-center justify-between p-space-md text-left font-mono-label text-mono-label hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-outline">description</span>
            <span className="text-on-surface font-semibold">
              How PR Bottlenecks Are Calculated &amp; Scientific Methodology
            </span>
          </div>
          <span className={`material-symbols-outlined text-base text-outline transition-transform ${methodologyOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {methodologyOpen && (
          <div className="p-space-md pt-0 text-xs text-on-surface-variant font-body-sm space-y-2 border-t border-surface-variant/20 bg-surface-container-lowest/40">
            <p>
              PR stage durations are reconstructed from raw GitHub events: PR creation, review assignment, review submission, commit pushes, check run execution intervals, and merge events.
            </p>
            <p className="font-mono-label text-[11px] text-outline">
              • <strong>Queue Wait:</strong> Time elapsed from PR creation to first assigned review activity.<br />
              • <strong>Review Lag:</strong> Time elapsed between requested reviewer ping and review submission.<br />
              • <strong>CI Latency:</strong> Accumulated wall-clock time consumed across automated test suites, retries, and runner queuing.<br />
              • <strong>Merge Buffer:</strong> Time elapsed from final gate approvals to merge commit landing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bottleneck;
