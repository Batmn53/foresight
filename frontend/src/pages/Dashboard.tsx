import React from 'react';
import { EmptyState } from '../components/EmptyState';

export const Dashboard: React.FC = () => {
  // TODO: Fetch team-level metrics from /metrics/time-to-merge and /metrics/build-failures
  // TODO: Render Recharts trend charts for time-to-merge and CI build failure rates
  // RULE: Strictly team-level or repository-level metrics. No individual developer rankings.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Team Engineering Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">
          High-level delivery velocity, time-to-merge distributions, and CI workflow stability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Median Time-to-Merge</span>
          <div className="mt-2 text-3xl font-bold text-white">-- hrs</div>
          <span className="text-xs text-slate-500 mt-2 block">Trailing 30 days (PR created to merged)</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">CI Build Failure Rate</span>
          <div className="mt-2 text-3xl font-bold text-white">-- %</div>
          <span className="text-xs text-slate-500 mt-2 block">Completed workflow runs only</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Weekly PR Throughput</span>
          <div className="mt-2 text-3xl font-bold text-white">-- PRs</div>
          <span className="text-xs text-slate-500 mt-2 block">Team merged volume</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-base font-semibold text-white mb-4">Delivery Trends & CI Stability</h3>
        {/* TODO: Integrate Recharts LineChart / AreaChart once metrics API endpoints return real data */}
        <EmptyState
          title="No metric trend points available"
          description="Sync your GitHub repository data to generate team-level delivery velocity trend lines."
          actionLabel="Go to GitHub Sync"
          onAction={() => window.location.href = '/github'}
        />
      </div>
    </div>
  );
};
