import React from 'react';
import { EmptyState } from '../components/EmptyState';

export const RiskRadar: React.FC = () => {
  // TODO: Fetch change risk scoring from /risk/radar
  // TODO: Render radar/scatter analysis for PRs based on size, churn, and historical test stability
  // RULE: Risk evaluation pertains strictly to change surface area, never developer competency.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Change Risk Radar</h2>
        <p className="text-sm text-slate-400 mt-1">
          Heuristic analysis of code churn, file dispersion, and potential regression exposure.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-base font-semibold text-white mb-4">Risk Surface Breakdown</h3>
        {/* TODO: Implement Risk matrix / radar visualization */}
        <EmptyState
          title="No active changes analyzed"
          description="Change risk telemetry requires ingested PR diffs and commit churn data."
        />
      </div>
    </div>
  );
};
