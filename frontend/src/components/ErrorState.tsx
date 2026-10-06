import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the ForgeSight API.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-red-800/40 bg-red-950/20 rounded-xl text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
      <h3 className="text-base font-semibold text-red-200">{title}</h3>
      <p className="text-sm text-red-300/80 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium bg-red-800/60 hover:bg-red-700/80 text-white rounded-lg transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
