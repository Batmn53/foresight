import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load telemetry data',
  message = 'An unexpected error occurred while communicating with the ForgeSight API.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded border border-error/30 text-center relative overflow-hidden">
      <div className="w-1 absolute left-0 top-0 bottom-0 bg-error" />
      <div className="w-10 h-10 rounded bg-error/15 text-error flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-xl">error_outline</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-1.5 mb-5">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-mono-label text-mono-label font-semibold border border-outline-variant/40 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
