import React from 'react';
import { EmptyState } from '../components/EmptyState';

export const Bottleneck: React.FC = () => {
  // TODO: Fetch review queue latency and turnaround metrics from /bottlenecks/review-queue
  // TODO: Render stage-based latency breakdowns (Time to First Review, Review Duration)
  // RULE: Identify systemic process bottlenecks, never call out or evaluate individual developers.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">PR Bottleneck Detection</h2>
        <p className="text-sm text-slate-400 mt-1">
          Detect friction points across review turnaround, feedback loops, and queue times.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-base font-semibold text-white mb-4">Review Queue Backlog</h3>
        {/* TODO: Implement bottleneck data table and review latency breakdown */}
        <EmptyState
          title="Review queue empty"
          description="No bottlenecks detected. PR review cycle latencies will populate once active pull requests are ingested."
        />
      </div>
    </div>
  );
};
