import React, { useState, useEffect } from 'react';
import { riskApi } from '../services/api';
import {
  RiskSummary,
  RiskPRItem,
  RiskHeuristicItem,
  RepositoryHotspotItem,
} from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const RiskRadar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [heuristics, setHeuristics] = useState<RiskHeuristicItem[]>([]);
  const [prs, setPrs] = useState<RiskPRItem[]>([]);
  const [hotspots, setHotspots] = useState<RepositoryHotspotItem[]>([]);
  const [selectedPrId, setSelectedPrId] = useState('risk-1847');
  const [searchFilter, setSearchFilter] = useState('');
  const [timeWindow, setTimeWindow] = useState('14D');
  const [filterDropdown, _setFilterDropdown] = useState('High Risk (>70) [8 PRs]');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summaryData = await riskApi.getSummary();
      const prData = await riskApi.getPRs();
      const hotspotData = await riskApi.getHotspots();
      setSummary(summaryData.summary);
      setHeuristics(summaryData.heuristics);
      setPrs(prData);
      setHotspots(hotspotData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load change risk telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPr = prs.find((p) => p.id === selectedPrId) || prs[0];

  const filteredPrs = prs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.branch.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(p.pr_number).includes(searchFilter)
  );

  const handleCopyChecklist = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  if (loading && !summary) {
    return (
      <div className="py-space-xl">
        <LoadingState message="Evaluating PR blast radius & change risk heuristics..." />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="py-space-xl">
        <ErrorState
          title="Risk Radar Analysis Failed"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* HEADER & MAIN ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-lg mb-space-sm">
        <div>
          <div className="flex items-center gap-space-sm mb-1 flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Change Risk Radar
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/15 text-primary font-mono-label text-mono-label font-bold border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              STATIC &amp; RUNTIME HEURISTICS ACTIVE
            </span>
            <span className="font-mono-label text-mono-label px-2 py-0.5 rounded bg-surface-container text-outline">
              SYS-EVAL : DUAL-PIPELINE v2.4
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Identify changes that warrant additional engineering scrutiny prior to merge and production rollout.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">file_download</span>
            <span>Export Audit Log</span>
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">radar</span>
            <span>Run Blast Radius Scan</span>
          </button>
        </div>
      </div>

      {/* METHODOLOGY NOTICE BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-surface-container-high/40 rounded border border-surface-variant/30 text-xs font-mono-label text-outline mb-space-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary shrink-0">shield</span>
          <span>
            <strong className="text-on-surface">Methodology Notice:</strong> Risk score is an engineering heuristic based on observed repository signals. It is <span className="underline decoration-tertiary">not</span> a probability of failure and should not be interpreted as a prediction of individual performance.
          </span>
        </div>
        <a href="#methodology" className="text-primary hover:underline shrink-0">
          View Signal Weighting Spec ↗
        </a>
      </div>

      {/* SCOPE & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-2 rounded border border-surface-variant/30 mb-space-lg font-mono-label text-mono-label">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded text-on-surface">
            <span className="material-symbols-outlined text-xs text-primary">source_environment</span>
            <span className="font-mono-body font-medium">org/core-telemetry-service</span>
            <span className="text-secondary bg-surface-container-high px-1 py-0.2 rounded text-[10px]">Tier-0</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded text-outline">
            <span className="material-symbols-outlined text-xs text-secondary">fork_right</span>
            <span>target: <strong className="text-on-surface">main</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded text-on-surface">
            <span className="text-outline">FILTER:</span>
            <span className="text-error font-bold">{filterDropdown}</span>
            <span className="material-symbols-outlined text-xs text-outline">expand_more</span>
          </div>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-1 text-outline">
          <span>WINDOW:</span>
          <div className="flex items-center bg-surface-container-lowest p-0.5 rounded">
            {['7D', '14D', '30D', 'Custom'].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setTimeWindow(w)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeWindow === w
                    ? 'bg-surface-container text-primary font-bold shadow-xs'
                    : 'hover:text-on-surface'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 1: 4 SUMMARY METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-md">
        {/* High Risk Changes */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              High-Risk Changes
            </span>
            <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono-label text-[10px] font-bold">
              Elevated Watch
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-error">
              {summary?.high_risk_prs || 8} PRs
            </span>
            <span className="font-mono-body text-xs text-outline font-normal">
              {summary?.high_risk_share || 12}% active queue
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span>Threshold: Score &gt; 70</span>
            <span className="text-error font-bold">+2 vs last week</span>
          </div>
        </div>

        {/* Medium Risk Changes */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Medium-Risk Changes
            </span>
            <span className="px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono-label text-[10px] font-bold">
              Standard Scrutiny
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-tertiary">
              {summary?.medium_risk_prs || 24} PRs
            </span>
            <span className="font-mono-body text-xs text-outline font-normal">
              {summary?.medium_risk_share || 35}% active queue
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span>Threshold: Score 40–70</span>
            <span className="text-outline">Flat trend</span>
          </div>
        </div>

        {/* Low Risk Changes */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Low-Risk Changes
            </span>
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-label text-[10px] font-bold">
              Nominal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-secondary">
              {summary?.low_risk_prs || 36} PRs
            </span>
            <span className="font-mono-body text-xs text-outline font-normal">
              {summary?.low_risk_share || 53}% active queue
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span>Threshold: Score &lt; 40</span>
            <span className="text-secondary font-bold">+4 vs last week</span>
          </div>
        </div>

        {/* Average Change Risk */}
        <div className="bg-surface-container-low p-space-md rounded flex flex-col justify-between shadow-sm border border-transparent">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
              Average Change Risk
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono-label text-[10px] font-bold">
              Heuristic Baseline
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="font-mono-metric text-mono-metric text-primary">
              {summary?.average_risk_score || 42.6}<span className="text-sm font-normal text-outline">/100</span>
            </span>
            <span className="font-mono-label text-xs text-secondary font-bold">
              {summary?.average_risk_delta || '-1.4 vs 14d'}
            </span>
          </div>
          <div className="mt-2 pt-1 border-t border-surface-variant/40 flex items-center justify-between font-mono-label text-mono-label text-outline">
            <span>Repository Baseline: {summary?.repository_baseline || 38.2}</span>
            <span>Sample: {summary?.sample_prs || 68} PRs</span>
          </div>
        </div>
      </div>

      {/* CHANGE RISK DISTRIBUTION BAR */}
      <div className="bg-surface-container-low p-3 rounded mb-space-lg border border-surface-variant/30">
        <div className="flex items-center justify-between font-mono-label text-[11px] text-outline mb-1.5">
          <span className="uppercase tracking-wider">
            Change Risk Distribution — Current Evaluation Cohort (68 PRs)
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-error">
              <span className="w-2 h-2 rounded-full bg-error" /> High: 8 (12%)
            </span>
            <span className="flex items-center gap-1 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> Medium: 24 (35%)
            </span>
            <span className="flex items-center gap-1 text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Low: 36 (53%)
            </span>
          </div>
        </div>

        <div className="w-full h-2 rounded bg-surface-container-highest overflow-hidden flex">
          <div className="h-full bg-error" style={{ width: '12%' }} />
          <div className="h-full bg-tertiary" style={{ width: '35%' }} />
          <div className="h-full bg-secondary" style={{ width: '53%' }} />
        </div>

        <div className="flex items-center justify-between font-mono-label text-[10px] text-outline pt-1">
          <span>0 — Low Friction Risk</span>
          <span>50 — Median Scrutiny Threshold</span>
          <span>100 — Severe Historical Blast Radius</span>
        </div>
      </div>

      {/* ROW 2: SPLIT VIEW (TABLE ON LEFT, INSPECTION CARD ON RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
        {/* Left Column: Pull Requests Under Risk Evaluation (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low p-space-md rounded shadow-sm border border-transparent flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                  Pull Requests Under Risk Evaluation
                </h2>
                <span className="font-mono-label text-[11px] text-outline">
                  68 Pull Requests active in blast radius evaluation window
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search PR #, title, or branch..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-surface-container-highest text-on-surface font-mono-body text-xs rounded px-3 py-1.5 pl-8 w-56 border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
                <span className="material-symbols-outlined text-sm text-outline absolute left-2.5 top-2">
                  search
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-label text-[11px]">
                <thead>
                  <tr className="border-b border-surface-variant/40 text-outline uppercase tracking-wider">
                    <th className="py-2 px-2">PR Details &amp; Branch</th>
                    <th className="py-2 px-2">Change Size</th>
                    <th className="py-2 px-2">Files</th>
                    <th className="py-2 px-2">Failure Signal</th>
                    <th className="py-2 px-2">CI Signal</th>
                    <th className="py-2 px-2">Config Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/20 font-mono-body text-xs">
                  {filteredPrs.map((pr) => {
                    const isSelected = selectedPr?.id === pr.id;
                    return (
                      <tr
                        key={pr.id}
                        onClick={() => setSelectedPrId(pr.id)}
                        className={`hover:bg-surface-container/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-surface-container/80' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2">
                          <div className="flex items-start gap-2">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${isSelected ? 'text-primary' : 'text-outline'}`}>
                              {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-on-surface truncate">
                                #{pr.pr_number}
                              </span>
                              <span className="font-medium text-on-surface truncate max-w-[200px]">
                                {pr.title}
                              </span>
                              <span className="font-mono-label text-[10px] text-outline truncate">
                                branch: {pr.branch} • {pr.touched_time}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">{pr.change_size_lines.toLocaleString()} lines</span>
                            <span className="font-mono-label text-[10px] text-secondary">
                              +{pr.added_lines} <span className="text-error">-{pr.deleted_lines}</span>
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-on-surface-variant">
                          {pr.files_count} files
                        </td>

                        <td className="py-2.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pr.failure_signal_color === 'error'
                                ? 'bg-error/20 text-error'
                                : pr.failure_signal_color === 'tertiary'
                                ? 'bg-tertiary/20 text-tertiary'
                                : pr.failure_signal_color === 'secondary'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {pr.failure_signal}
                          </span>
                        </td>

                        <td className="py-2.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pr.ci_signal_color === 'error'
                                ? 'bg-error/20 text-error'
                                : pr.ci_signal_color === 'tertiary'
                                ? 'bg-tertiary/20 text-tertiary'
                                : pr.ci_signal_color === 'secondary'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {pr.ci_signal}
                          </span>
                        </td>

                        <td className="py-2.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pr.config_impact_color === 'error'
                                ? 'bg-error/20 text-error'
                                : pr.config_impact_color === 'secondary'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {pr.config_impact}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-variant/30 font-mono-label text-mono-label text-outline">
            <span>Showing 6 of 68 pull requests matching filters</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 rounded hover:bg-surface-container text-on-surface-variant">
                Previous
              </button>
              <span className="text-on-surface font-semibold">Page 1 of 12</span>
              <button className="px-2 py-0.5 rounded hover:bg-surface-container text-on-surface-variant">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: PR Scrutiny Breakdown Panel (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-md rounded shadow-sm border border-error/20 flex flex-col justify-between relative overflow-hidden">
          <div className="w-1 absolute left-0 top-0 bottom-0 bg-error" />

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
                Evaluation Inspection
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container font-mono-label text-xs text-primary">
                <span>pr: #{selectedPr?.pr_number}</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </div>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
              PR Scrutiny Breakdown
            </h2>

            {/* Large Score Card */}
            <div className="p-3 bg-surface-container rounded mb-3 border border-surface-variant/30">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2 py-0.5 rounded bg-error/20 text-error font-mono-label text-xs font-bold uppercase">
                  High Risk Heuristic
                </span>
                <span className="font-mono-label text-xs text-outline">Target: main</span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="font-mono-metric text-2xl font-bold text-error">
                  {selectedPr?.risk_score || 78}/100
                </span>
                <span className="font-mono-label text-xs text-error font-bold uppercase">
                  Elevated Scrutiny Recommended
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Change combines multi-file schema surface changes, touches high-failure directories, and involves cloud infra configuration.
              </p>
            </div>

            {/* Contributing Risk Heuristics */}
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-2">
              Contributing Risk Heuristics (4 Identified)
            </span>
            <div className="flex flex-col gap-2 mb-4 font-body-sm text-xs">
              {heuristics.map((h) => (
                <div key={h.id} className="p-2.5 rounded bg-surface-container/60 border border-surface-variant/20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-on-surface">{h.title}</span>
                    <span className="font-mono-label text-error font-bold">+{h.points} pts</span>
                  </div>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed">
                    {h.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommended Protocol Checklist */}
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-2">
              Recommended Scrutiny Protocol
            </span>
            <div className="flex flex-col gap-1.5 font-body-sm text-xs text-on-surface-variant mb-4">
              <label className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-surface-container/40">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded border-outline" />
                <span>Request dedicated domain lead sign-off in <code className="font-mono-body text-primary">#payments-architecture</code></span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-surface-container/40">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded border-outline" />
                <span>Trigger extended canary simulation on staging-2 cluster</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-surface-container/40">
                <input type="checkbox" className="mt-0.5 rounded border-outline" />
                <span>Pre-verify webhook DLQ replay procedure with on-call engineer</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyChecklist}
            className="w-full py-2 px-3 rounded bg-surface-container hover:bg-surface-container-high text-primary font-mono-label text-xs font-semibold border border-outline-variant/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            <span>
              {copiedNotification
                ? 'Checklist Copied to Clipboard!'
                : `Copy Scrutiny Checklist to PR #${selectedPr?.pr_number || 1847}`}
            </span>
          </button>
        </div>
      </div>

      {/* ROW 3: REPOSITORY HOTSPOT TELEMETRY (PAST 90 DAYS) */}
      <div className="bg-surface-container-low p-space-lg rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-xl">whatshot</span>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                Repository Hotspot Telemetry (Past 90 Days)
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Repository areas that have historically experienced elevated CI failure or rework signals. Purely statistical observation of system modules — not developer attribution.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container font-mono-label text-mono-label text-outline">
            COHORT: 90 Days Rolling
          </span>
        </div>

        {/* Hotspot Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-label text-mono-label">
            <thead>
              <tr className="border-b border-surface-variant/40 text-outline uppercase tracking-wider">
                <th className="py-2.5 px-3">Repository Path / Module</th>
                <th className="py-2.5 px-3">Changes Observed</th>
                <th className="py-2.5 px-3">Historical CI Failures</th>
                <th className="py-2.5 px-3">Failure Rate Metric</th>
                <th className="py-2.5 px-3">90-Day Trend</th>
                <th className="py-2.5 px-3">Primary Friction Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20 font-mono-body text-xs">
              {hotspots.map((hs) => {
                const trendColor =
                  hs.trend_status === 'degrading'
                    ? 'text-error'
                    : hs.trend_status === 'improving'
                    ? 'text-secondary'
                    : 'text-outline';
                return (
                  <tr key={hs.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-outline">folder</span>
                      <span>{hs.path}</span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">
                      {hs.changes_count} PRs
                    </td>
                    <td className="py-3 px-3 font-bold text-error">
                      {hs.failures_count} failures
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{hs.failure_rate_percent}%</span>
                        <div className="w-20 h-1.5 rounded bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full bg-error"
                            style={{ width: `${Math.min(hs.failure_rate_percent * 4, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-3 font-bold ${trendColor}`}>
                      {hs.trend_label}
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant font-mono-label">
                      {hs.friction_category}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 4: SCIENTIFIC METHODOLOGY & SYSTEMIC RISK HEURISTIC INFO BOX */}
      <div id="methodology" className="bg-surface-container-low p-space-md rounded border border-surface-variant/30 flex items-start gap-space-md">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">shield</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-md text-sm font-semibold text-on-surface">
              Scientific Methodology &amp; Systemic Risk Heuristic
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-label text-[10px] font-bold">
              Statistically Calibrated
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            Risk score is an engineering heuristic based on observed repository signals. It is not a probability of failure and should not be interpreted as a prediction of individual performance. Scores are generated using Bayesian weighting of file blast radius, historical hotfix density in touched directories, CI flakiness history, and architectural boundary crossings.
          </p>
          <span className="font-mono-label text-[11px] text-outline mt-1">
            Signal Weights: Code Volume (25%) • Directory Churn &amp; Incident Density (35%) • CI Gate Flake Index (20%) • Config &amp; Infra Mutation (20%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskRadar;
