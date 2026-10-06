import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  statusBadge?: {
    label: string;
    bgColor?: string;
    textColor?: string;
  };
  change?: {
    text: string;
    icon?: string;
    colorClass?: string;
  };
  sparklinePath?: string;
  sparklineColorClass?: string;
  tooltipText: string;
  valueColorClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  statusBadge,
  change,
  sparklinePath,
  sparklineColorClass = 'text-primary',
  tooltipText,
  valueColorClass = 'text-on-surface',
}) => {
  return (
    <div className="relative bg-surface-container-low p-space-md rounded flex flex-col justify-between group hover:bg-surface-container transition-colors shadow-sm border border-transparent hover:border-surface-variant/30">
      {/* Top Label & Info Tooltip */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">
          {label}
        </span>
        <div className="relative group/tip cursor-help">
          <span className="material-symbols-outlined text-xs text-outline group-hover/tip:text-primary transition-colors">
            info
          </span>
          <div className="absolute right-0 top-5 hidden group-hover/tip:flex z-30 w-60 p-2.5 bg-surface-container-highest text-on-surface rounded shadow-xl font-body-sm text-body-sm pointer-events-none border border-outline-variant/30 leading-snug">
            {tooltipText}
          </div>
        </div>
      </div>

      {/* Main Metric Value & Unit */}
      <div className="flex items-baseline gap-space-xs my-0.5">
        <span className={`font-mono-metric text-mono-metric ${valueColorClass}`}>
          {value}
        </span>
        {statusBadge ? (
          <span
            className={`font-mono-label text-mono-label px-1 py-0.5 rounded font-bold ${
              statusBadge.bgColor || 'bg-secondary/15'
            } ${statusBadge.textColor || 'text-secondary'}`}
          >
            {statusBadge.label}
          </span>
        ) : unit ? (
          <span className="font-mono-body text-mono-body text-outline font-normal">
            {unit}
          </span>
        ) : null}
      </div>

      {/* Footer Trend & Sparkline */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-variant/40">
        {change && (
          <span
            className={`inline-flex items-center font-mono-label text-mono-label px-1 py-0.5 rounded ${
              change.colorClass || 'bg-secondary/15 text-secondary'
            }`}
          >
            {change.icon && (
              <span className="material-symbols-outlined text-[11px] mr-0.5">
                {change.icon}
              </span>
            )}
            {change.text}
          </span>
        )}

        {sparklinePath && (
          <svg
            className={`w-14 h-4 ${sparklineColorClass} overflow-visible`}
            fill="none"
            viewBox="0 0 56 16"
          >
            <path
              d={sparklinePath}
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
