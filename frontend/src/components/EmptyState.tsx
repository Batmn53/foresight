import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No telemetry data available',
  description = 'Connect your GitHub repository or trigger a sync to populate team delivery metrics.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-outline-variant/40 rounded bg-surface-container-low/40 text-center">
      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center mb-3 text-primary">
        <span className="material-symbols-outlined text-xl">source_environment</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1 mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all"
        >
          <span className="material-symbols-outlined text-sm">sync_alt</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
