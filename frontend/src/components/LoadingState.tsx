import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading engineering telemetry...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant min-h-[320px] bg-surface-container-low/40 rounded border border-surface-variant/20">
      <div className="relative flex h-10 w-10 mb-4 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
        <span className="relative inline-flex rounded-full h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="font-mono-body text-mono-body text-on-surface font-medium">{message}</p>
      <span className="font-mono-label text-mono-label text-outline mt-1.5">
        Aggregating PR cycles & CI cluster metrics
      </span>
    </div>
  );
};
