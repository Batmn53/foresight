import React, { useState } from 'react';
import { Repository } from '../types';

interface HeaderProps {
  repositories?: Repository[];
  selectedRepo?: Repository | null;
  onSelectRepo?: (repo: Repository) => void;
  onToggleMobile?: () => void;
  timeRange?: string;
  onSelectTimeRange?: (range: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  repositories = [],
  selectedRepo,
  onSelectRepo,
  onToggleMobile,
  timeRange = '30D',
  onSelectTimeRange,
  onSync,
  isSyncing = false,
}) => {
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

  const activeRepoName = selectedRepo?.full_name || 'org/core-telemetry-service';
  const defaultBranch = selectedRepo?.default_branch || 'main';

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md z-40 flex items-center justify-between px-gutter shadow-[0_1px_8px_rgba(0,0,0,0.3)] border-b border-surface-variant/20 select-none">
      {/* Left controls */}
      <div className="flex items-center gap-space-sm md:gap-space-md">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Repo Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
            className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded hover:bg-surface-container cursor-pointer transition-colors text-left"
          >
            <span className="material-symbols-outlined text-base text-primary">account_tree</span>
            <span className="font-mono-body text-mono-body font-medium text-on-surface truncate max-w-[150px] sm:max-w-[240px]">
              {activeRepoName}
            </span>
            <span className="material-symbols-outlined text-sm text-outline">
              keyboard_arrow_down
            </span>
          </button>

          {/* Repo dropdown menu */}
          {repoDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-surface-container-highest border border-outline-variant/40 rounded shadow-xl py-1 z-50">
              <div className="px-3 py-1 font-mono-label text-mono-label text-outline uppercase tracking-wider">
                Select Repository
              </div>
              {repositories.length > 0 ? (
                repositories.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => {
                      if (onSelectRepo) onSelectRepo(repo);
                      setRepoDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono-body hover:bg-surface-container flex items-center justify-between transition-colors ${
                      repo.full_name === activeRepoName
                        ? 'text-primary bg-surface-container/60 font-semibold'
                        : 'text-on-surface'
                    }`}
                  >
                    <span className="truncate">{repo.full_name}</span>
                    {repo.full_name === activeRepoName && (
                      <span className="material-symbols-outlined text-xs text-primary">check</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-on-surface-variant font-mono-body">
                  org/core-telemetry-service
                </div>
              )}
            </div>
          )}
        </div>

        {/* Branch pill */}
        <div className="hidden sm:flex items-center gap-space-xs font-mono-label text-mono-label text-outline bg-surface-container-high px-space-xs py-0.5 rounded">
          <span className="material-symbols-outlined text-xs text-secondary">fork_right</span>
          <span>{defaultBranch}</span>
        </div>

        {/* Tier badge */}
        <span className="hidden md:inline-block font-mono-label text-mono-label text-secondary bg-surface-container px-space-xs py-0.5 rounded">
          Tier-0 Service
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-space-sm md:gap-space-md">
        {/* Enterprise Connected Pill */}
        <div className="hidden xl:flex items-center gap-space-xs bg-surface-container-low px-space-xs py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="font-mono-label text-mono-label text-on-surface-variant">
            GH Ent: Connected (98.4%)
          </span>
        </div>

        {/* Time window segments */}
        <div className="flex items-center bg-surface-container-low rounded p-0.5 font-mono-label text-mono-label">
          {['7D', '14D', '30D', 'Custom'].map((range) => {
            const isSelected = timeRange === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onSelectTimeRange && onSelectTimeRange(range)}
                className={`px-2 py-1 rounded transition-colors ${
                  isSelected
                    ? 'bg-surface-container-high text-primary font-semibold shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>

        {/* Live sync indicator */}
        <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-mono-label text-mono-label">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="hidden lg:inline">Synced 42s ago</span>
        </div>

        {/* Sync action button */}
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-sm py-1.5 rounded transition-colors font-body-sm text-body-sm disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="font-medium hidden sm:inline">Sync Now</span>
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-mono-label text-primary font-bold text-xs shrink-0 ml-space-xs overflow-hidden">
          <img
            alt="Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Ww05CWPrG_TMlhCfIGnJrbZf_cfZwRhARX7Ye2tZuWH50MKiA8LlMiT87FJGYyYIxnw2RyoC1JHnHC-_a_XEi17yJBydkpaBcLbaVT1zODGsCMkMx-1-K3Mb_ulN0R06iSmbBp5qO9kAwokn3X1wWKT7ayYzDbRYPx6P6mLthGatRyrSYm9X7hAGSlITudFgxWnbrlDGVuA2kdQ5fM_jzBgtWfbtJ6d9hcuv8smvu_iQANTfnaptgU4Xo"
            onError={(e) => {
              // Graceful fallback to initials if avatar URL fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-[10px]">PR</span>
        </div>
      </div>
    </header>
  );
};
