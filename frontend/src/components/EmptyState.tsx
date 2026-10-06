import React from 'react';
import { FolderGit2 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No repository data available',
  description = 'Connect your GitHub repository or trigger a sync to populate team delivery metrics.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-xl text-center bg-slate-900/30">
      <div className="p-3 bg-slate-800 rounded-full mb-3 text-slate-400">
        <FolderGit2 className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
