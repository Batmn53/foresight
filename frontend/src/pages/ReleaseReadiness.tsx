import React, { useState, useEffect } from 'react';
import { releaseApi } from '../services/api';
import {
  DimensionalSignalItem,
  ReleaseBlockerItem,
  ReleaseWarningItem,
  PositiveSignalItem,
  CandidatePRTraceItem,
} from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const ReleaseReadiness: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(82);
  const [status, setStatus] = useState('READY WITH CAUTION');
  const [directive, setDirective] = useState('RECOMMENDATION: PROCEED WITH CAUTION');
  const [signals, setSignals] = useState<DimensionalSignalItem[]>([]);
  const [blockers, setBlockers] = useState<ReleaseBlockerItem[]>([]);
  const [warnings, setWarnings] = useState<ReleaseWarningItem[]>([]);
  const [positiveSignals, setPositiveSignals] = useState<PositiveSignalItem[]>([]);
  const [candidateTraces, setCandidateTraces] = useState<CandidatePRTraceItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await releaseApi.getReadiness();
      setScore(data.score);
      setStatus(data.status);
      setDirective(data.directive);
      setSignals(data.dimensionalSignals);
      setBlockers(data.blockers);
      setWarnings(data.warnings);
      setPositiveSignals(data.positiveSignals);
      setCandidateTraces(data.candidateTraces);
    } catch (err: any) {
      setError(err?.message || 'Failed to load release readiness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTraces = candidateTraces.filter(
    (t) =>
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.branch.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(t.pr_number).includes(searchFilter)
  );

  if (loading && signals.length === 0) {
    return (
      <div className="py-space-xl">
        <LoadingState message="Aggregating continuous delivery signals & gate compliance..." />
      </div>
    );
  }

  if (error && signals.length === 0) {
    return (
      <div className="py-space-xl">
        <ErrorState
          title="Release Gate Verification Failed"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* SCOPE BREADCRUMB & PROMOTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm py-2 px-3 bg-surface-container-low rounded border border-surface-variant/30 mb-space-md font-mono-label text-mono-label">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container rounded text-on-surface">
            <span className="material-symbols-outlined text-xs text-primary">source_environment</span>
            <span className="font-mono-body font-medium">org/core-telemetry-service</span>
            <span className="text-secondary bg-surface-container-high px-1 py-0.2 rounded text-[10px]">Tier-0 Service</span>
          </div>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">release/v2.4.0</span>
          <span className="text-outline">/</span>
          <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold">
            v2.4.0-rc4 CANDIDATE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xs">tune</span>
            <span>Run Gate Simulation</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xs">code</span>
            <span>Export Manifest (JSON)</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded bg-primary text-on-primary font-bold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-xs">rocket_launch</span>
            <span>Promote to Staging</span>
          </button>
        </div>
      </div>

      {/* HEADER & DEPLOYMENT WINDOW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-sm mb-space-lg">
        <div>
          <span className="font-mono-label text-[11px] text-outline uppercase tracking-wider block mb-0.5">
            Continuous Delivery Verification — Candidate Policy POLICY-ENG-V4
          </span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-1">
            Release Readiness Gate
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            A transparent, heuristic assessment of current engineering pipeline stability and blast-radius telemetry.
          </p>
        </div>

        {/* Deployment Window Card */}
        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded border border-surface-variant/30 font-mono-label text-mono-label shrink-0">
          <div className="w-8 h-8 rounded bg-tertiary/15 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-base">alarm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase tracking-wider">Deployment Window</span>
            <span className="font-bold text-tertiary text-sm">Opens in T-01h 42m 18s</span>
          </div>
        </div>
      </div>

      {/* ROW 1: SPLIT TOP SECTION (GAUGE ON LEFT, FORMAL DIRECTIVE ON RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
        {/* Left Card: Synthetic Gate Score (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-lg rounded shadow-sm border border-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary">donut_large</span>
                Synthetic Gate Score
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-mono-label text-[10px] text-outline">
                Weighted Metric
              </span>
            </div>

            {/* Circular Donut Gauge Representation */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#19202a"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Active score arc (82%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ffc174"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - score / 100)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="font-mono-metric text-4xl font-bold text-on-surface">
                      {score}
                    </span>
                    <span className="text-xs font-mono-body text-outline">/100</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary font-mono-label text-[10px] font-bold mt-1">
                    • {status}
                  </span>
                  <span className="font-mono-label text-[10px] text-outline mt-0.5">
                    Req. Pass: &gt;80.0
                  </span>
                </div>
              </div>

              {/* Threshold Scale Legend */}
              <div className="flex items-center justify-between w-full max-w-xs font-mono-label text-[10px] text-outline pt-3 border-t border-surface-variant/30 mt-3">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" /> &lt;60 Halt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> 60-80 Elev.
                </span>
                <span className="flex items-center gap-1 text-tertiary font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> 80-90 Caution
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> &gt;90 Ready
                </span>
              </div>
            </div>
          </div>

          <p className="font-mono-label text-[11px] text-outline text-center pt-2 border-t border-surface-variant/30 leading-snug">
            Synthesized from 48 continuous integration runs, 12 pull-request blast footprints, and 4 dependency audit matrices.
          </p>
        </div>

        {/* Right Card: Formal Gate Directive (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded shadow-sm border border-tertiary/30 flex flex-col justify-between relative overflow-hidden">
          <div className="w-1 absolute left-0 top-0 bottom-0 bg-tertiary" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-label text-mono-label text-tertiary uppercase tracking-wider flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-xs">warning</span>
                Formal Gate Directive
              </span>
              <span className="font-mono-label text-xs text-outline">
                Eval ID: gate_8f39b2_eva14
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
              {directive}
            </h2>

            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
              Integration test matrix in ephemeral runner clusters flagged timeout flakiness in <code className="font-mono-body text-primary">integration-tests-e2e-matrix</code>. Canary promotion to 5% traffic permissible if automated rollback hooks on error rate &gt;0.2% are active.
            </p>

            {/* 4 Status Checks in 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 font-body-sm text-xs">
              <div className="p-2.5 rounded bg-surface-container border border-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                  <span className="font-semibold text-on-surface">Security SAST Gate</span>
                </div>
                <span className="font-mono-label text-xs text-secondary">0 Critical / 0 High CVEs</span>
              </div>

              <div className="p-2.5 rounded bg-surface-container border border-error/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-base">cancel</span>
                  <span className="font-semibold text-on-surface">E2E Smoke Suite</span>
                </div>
                <span className="font-mono-label text-xs text-error font-bold">24/0 Runs Timed Out</span>
              </div>

              <div className="p-2.5 rounded bg-surface-container border border-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                  <span className="font-semibold text-on-surface">Schema Migrations</span>
                </div>
                <span className="font-mono-label text-xs text-secondary">Zero-Downtime Safe</span>
              </div>

              <div className="p-2.5 rounded bg-surface-container border border-tertiary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-base">error</span>
                  <span className="font-semibold text-on-surface">PR Blast Radius Score</span>
                </div>
                <span className="font-mono-label text-xs text-tertiary font-bold">Elevated (78/100)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono-label text-[11px] text-outline">
              Security Protocol SecOps-L2 Required for Manual Override
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-mono-label text-xs font-semibold border border-outline-variant/30 transition-colors"
              >
                Notify Release Squad
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-error/20 hover:bg-error/30 text-error font-mono-label text-xs font-bold border border-error/40 transition-colors"
              >
                Override Gate (SecOps)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: DIMENSIONAL SIGNAL BREAKDOWN (5 CARDS ACROSS) */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm font-mono-label text-mono-label">
          <span className="text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">tune</span>
            Dimensional Signal Breakdown
          </span>
          <span className="text-outline">Formula Weighting Active (v2.4)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          {signals.map((sig) => {
            const badgeClass =
              sig.statusColor === 'secondary'
                ? 'bg-secondary/15 text-secondary'
                : sig.statusColor === 'error'
                ? 'bg-error/20 text-error'
                : 'bg-tertiary/20 text-tertiary';

            const scoreColor =
              sig.statusColor === 'secondary'
                ? 'text-secondary'
                : sig.statusColor === 'error'
                ? 'text-error'
                : 'text-tertiary';

            return (
              <div
                key={sig.id}
                className="bg-surface-container-low p-space-md rounded shadow-sm border border-transparent flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1 font-mono-label text-[10px]">
                    <span className="text-outline uppercase">Weight: {sig.weight}%</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${badgeClass}`}>
                      {sig.statusBadge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline-md text-sm font-bold text-on-surface">
                      {sig.name}
                    </span>
                    <span className={`font-mono-metric text-lg font-bold ${scoreColor}`}>
                      {sig.score}<span className="text-[10px] text-outline font-normal">/100</span>
                    </span>
                  </div>

                  <p className="font-body-sm text-[11px] text-on-surface-variant leading-snug mb-3">
                    {sig.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-variant/30 flex items-center justify-between font-mono-label text-[10px]">
                  <span className="text-outline">{sig.targetText}</span>
                  <span className={`font-bold ${sig.isDeficit ? 'text-error' : 'text-secondary'}`}>
                    {sig.deltaText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 3: RELEASE GATE AUDIT MATRIX (3 COLUMNS ACROSS) */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm font-mono-label text-mono-label">
          <span className="text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">checklist</span>
            Release Gate Audit Matrix
          </span>
          <span className="text-outline">9 Evaluated Conditions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Column 1: Release Blockers (Red) */}
          <div className="bg-surface-container-low p-space-md rounded border border-error/30 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1 absolute left-0 top-0 bottom-0 bg-error" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-error text-base">cancel</span>
                  Release Blockers ({blockers.length})
                </span>
                <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono-label text-[10px] font-bold">
                  MUST RESOLVE
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {blockers.map((b) => (
                  <div key={b.id} className="p-2.5 rounded bg-surface-container/60 border border-surface-variant/20 font-body-sm text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-on-surface">{b.category}</span>
                      <span className="font-mono-label text-primary text-[11px]">{b.targetId}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      {b.description}
                    </p>
                    {b.actionText && (
                      <button className="text-primary hover:underline font-mono-label text-[10px] mt-1 block">
                        {b.actionText}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="mt-3 w-full py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-error font-mono-label text-xs font-semibold border border-error/30 transition-colors"
            >
              Rerun Failed Matrix (2)
            </button>
          </div>

          {/* Column 2: Release Warnings (Amber) */}
          <div className="bg-surface-container-low p-space-md rounded border border-tertiary/30 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1 absolute left-0 top-0 bottom-0 bg-tertiary" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary text-base">warning</span>
                  Release Warnings ({warnings.length})
                </span>
                <span className="px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono-label text-[10px] font-bold">
                  WATCH CLOSELY
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {warnings.map((w) => (
                  <div key={w.id} className="p-2.5 rounded bg-surface-container/60 border border-surface-variant/20 font-body-sm text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-on-surface">{w.category}</span>
                      <span className="font-mono-label text-tertiary text-[11px]">{w.deviationBadge}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      {w.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 py-1.5 px-2 rounded bg-surface-container text-center font-mono-label text-[10px] text-outline">
              Telemetry Tolerance: Non-Blocking Under Canary
            </div>
          </div>

          {/* Column 3: Positive Signals (Green) */}
          <div className="bg-surface-container-low p-space-md rounded border border-secondary/30 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1 absolute left-0 top-0 bottom-0 bg-secondary" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">verified</span>
                  Positive Signals ({positiveSignals.length})
                </span>
                <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-label text-[10px] font-bold">
                  VERIFIED SAFE
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {positiveSignals.map((p) => (
                  <div key={p.id} className="p-2.5 rounded bg-surface-container/60 border border-surface-variant/20 font-body-sm text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-on-surface">{p.category}</span>
                      <span className="font-mono-label text-secondary text-[11px]">{p.statusBadge}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 py-1.5 px-2 rounded bg-surface-container text-center font-mono-label text-[10px] text-secondary">
              Attestation Sign-off: Hardware Key Verified
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: CANDIDATE COMMIT & PR AUDIT TRACE TABLE */}
      <div className="bg-surface-container-low p-space-lg rounded mb-space-lg shadow-sm border border-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">rule</span>
              Candidate Commit &amp; PR Audit Trace
            </h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Component-level blast footprints and automated gate decisions for inclusion in release candidate v2.4.0-rc4
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter SHA, PR, or module..."
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
          <table className="w-full text-left font-mono-label text-mono-label">
            <thead>
              <tr className="border-b border-surface-variant/40 text-outline uppercase tracking-wider">
                <th className="py-2.5 px-3">Identifier / Branch</th>
                <th className="py-2.5 px-3">Touched Subsystems</th>
                <th className="py-2.5 px-3">Risk Heuristic</th>
                <th className="py-2.5 px-3">CI Matrix Status</th>
                <th className="py-2.5 px-3">Security &amp; SBOM</th>
                <th className="py-2.5 px-3 text-right">Gate Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20 font-mono-body text-xs">
              {filteredTraces.map((trace) => {
                const decisionClass =
                  trace.gate_decision === 'BLOCKED'
                    ? 'bg-error/20 text-error border-error/30'
                    : trace.gate_decision === 'CONDITIONAL'
                    ? 'bg-tertiary/20 text-tertiary border-tertiary/30'
                    : 'bg-secondary/15 text-secondary border-secondary/30';

                return (
                  <tr key={trace.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          PR #{trace.pr_number} <span className="font-normal text-on-surface-variant">- {trace.title}</span>
                        </span>
                        <span className="font-mono-label text-[10px] text-outline">
                          {trace.commit_sha}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant font-mono-label">
                      {trace.touched_subsystems}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface">{trace.risk_score}/100</span>
                        <span className={`px-1 py-0.2 rounded font-mono-label text-[10px] font-bold ${trace.risk_score > 60 ? 'bg-error/20 text-error' : trace.risk_score > 40 ? 'bg-tertiary/20 text-tertiary' : 'bg-secondary/15 text-secondary'}`}>
                          {trace.risk_label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={trace.ci_matrix_is_passed ? 'text-secondary' : 'text-error font-semibold'}>
                        {trace.ci_matrix_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-secondary font-mono-label">
                      {trace.security_sbom}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded font-mono-label text-[11px] font-bold border ${decisionClass}`}>
                        {trace.gate_decision}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-space-md pt-space-xs font-mono-label text-mono-label text-outline border-t border-surface-variant/30">
          <span>Showing 4 candidate delta changes in RC4</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-surface-container text-on-surface-variant">
              Previous
            </button>
            <button className="px-2 py-1 rounded bg-surface-container text-primary font-bold">
              1 of 1
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
              How This Release Readiness Score is Calculated
            </span>
          </div>
          <span className={`material-symbols-outlined text-base text-outline transition-transform ${methodologyOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {methodologyOpen && (
          <div className="p-space-md pt-0 text-xs text-on-surface-variant font-body-sm space-y-2 border-t border-surface-variant/20 bg-surface-container-lowest/40">
            <div className="p-2.5 bg-surface-container rounded border border-surface-variant/30 flex items-start gap-2 mb-2">
              <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">shield</span>
              <div>
                <span className="font-bold text-on-surface block mb-0.5">FORGESIGHT SYSTEM PHILOSOPHY</span>
                <p className="text-[11px] text-on-surface-variant">
                  This risk score is an engineering heuristic synthesized strictly from observed repository signals, CI run histories, and code churn velocity. It is not a statistical guarantee of release success or runtime stability. In strict accordance with ForgeSight core governance standards, this tool does not measure, rank, or evaluate individual developer capabilities or performance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono-label text-[11px] pt-1">
              <div className="p-2 bg-surface-container-high/40 rounded">
                <span className="text-secondary font-bold block">CI Health: 30%</span>
                <span className="text-outline text-[10px]">Pass-rates on RC commits, regression test suites, unit branch coverage.</span>
              </div>
              <div className="p-2 bg-surface-container-high/40 rounded">
                <span className="text-error font-bold block">Change Risk: 25%</span>
                <span className="text-outline text-[10px]">Lines changed, critical paths touched (auth, billing), schema modifications.</span>
              </div>
              <div className="p-2 bg-surface-container-high/40 rounded">
                <span className="text-tertiary font-bold block">Flakiness: 20%</span>
                <span className="text-outline text-[10px]">Test retry count, asynchronous timeout frequency, runner resource constraints.</span>
              </div>
              <div className="p-2 bg-surface-container-high/40 rounded">
                <span className="text-outline font-bold block">Defect Rate: 15%</span>
                <span className="text-outline text-[10px]">Rolling 48-hour pipeline failure rates, staging environment anomaly logs.</span>
              </div>
              <div className="p-2 bg-surface-container-high/40 rounded">
                <span className="text-primary font-bold block">Sync Hygiene: 10%</span>
                <span className="text-outline text-[10px]">Main-branch parity, Cosign SBOM verification, tag signature validity.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseReadiness;
