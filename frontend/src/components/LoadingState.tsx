import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading engineering metrics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500 mb-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
