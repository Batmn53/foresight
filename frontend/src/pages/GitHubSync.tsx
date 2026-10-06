import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const GitHubSync: React.FC = () => {
  // TODO: Fetch connected repositories from /github/repositories
  // TODO: Trigger manual and webhook-driven ingestion via /github/sync
  // TODO: Display sync progress and idempotent status

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">GitHub Integration & Sync</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage repository connections and trigger idempotent ingestion jobs.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
          onClick={() => {
            // TODO: Initiate OAuth or repo sync
            alert('GitHub OAuth connection flow pending implementation');
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
        <h3 className="text-base font-semibold text-white mb-4">Connected Repositories</h3>
        {/* TODO: Implement connected repository list and sync trigger controls */}
        <EmptyState
          title="No repositories connected"
          description="Connect your GitHub organization or personal repositories to start ingesting PRs and CI workflows."
          actionLabel="Connect GitHub Account"
          onAction={() => {
            // TODO: OAuth redirect
            window.location.href = '/api/v1/auth/github/login';
          }}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white">Idempotent Sync Guarantees</h4>
            <p className="text-xs text-slate-400 mt-1">
              ForgeSight tracks external GitHub IDs and unique commit SHAs. Ingestion runs can be safely repeated without generating duplicate records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
