import React from 'react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColorClass?: string;
  legend?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  disclaimer?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  icon,
  iconColorClass = 'text-primary',
  legend,
  headerRight,
  children,
  footer,
  disclaimer,
}) => {
  return (
    <div className="bg-surface-container-low p-space-lg rounded flex flex-col justify-between shadow-sm border border-transparent">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-space-xs">
            {icon && (
              <span className={`material-symbols-outlined ${iconColorClass} text-base`}>
                {icon}
              </span>
            )}
            {title}
          </h2>
          {subtitle && (
            <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
              {subtitle}
            </span>
          )}
        </div>

        {/* Legend or Right Action */}
        <div className="flex items-center gap-space-md">
          {legend}
          {headerRight}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full">
        {children}
      </div>

      {/* Optional Disclaimer or Footer */}
      {disclaimer && (
        <div className="flex items-center gap-2 mt-space-sm pt-space-xs font-mono-label text-mono-label text-outline bg-surface-container-high/40 px-2 py-1 rounded">
          <span className="material-symbols-outlined text-xs text-outline shrink-0">
            shield
          </span>
          <span className="truncate">{disclaimer}</span>
        </div>
      )}

      {footer && !disclaimer && (
        <div className="mt-space-sm pt-space-xs">
          {footer}
        </div>
      )}
    </div>
  );
};
