import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const diagnosticsNav = [
  { name: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { name: 'Bottleneck Detective', to: '/bottlenecks', icon: 'troubleshoot' },
  { name: 'Change Risk Radar', to: '/risk', icon: 'radar' },
  { name: 'Release Readiness', to: '/release', icon: 'verified' },
];

const workspaceNav = [
  { name: 'Repositories', to: '/github', icon: 'source_environment' },
  { name: 'GitHub Sync', to: '/github', icon: 'sync_alt' },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.5)] transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo / Header */}
          <div className="h-14 px-space-md flex items-center justify-between bg-surface-container-lowest border-b border-surface-variant/20">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-base">insights</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
                  ForgeSight
                </span>
              </div>
            </div>
            <span className="font-mono-label text-mono-label px-space-xs py-0.5 bg-surface-container text-outline rounded">
              v2.4-ent
            </span>
          </div>

          {/* Section 1: Telemetry Diagnostics */}
          <div className="px-space-md py-space-sm">
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-space-xs">
              Telemetry Diagnostics
            </span>
            <nav className="flex flex-col gap-0.5">
              {diagnosticsNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-sm py-1.5 rounded transition-colors font-body-sm text-body-sm ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Section 2: Workspace & Ingestion */}
          <div className="px-space-md py-space-sm">
            <span className="font-mono-label text-mono-label uppercase text-outline tracking-wider block mb-space-xs">
              Workspace &amp; Ingestion
            </span>
            <nav className="flex flex-col gap-0.5">
              {workspaceNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-sm py-1.5 rounded transition-colors font-body-sm text-body-sm ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col p-space-md gap-space-sm bg-surface-container-lowest border-t border-surface-variant/20">
          <nav className="flex flex-col gap-0.5">
            <NavLink
              to="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-space-sm px-space-sm py-1.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
            <span className="font-mono-label text-mono-label truncate">
              Prod Infra Cluster • US-East
            </span>
          </div>

          <div className="flex items-center gap-space-sm pt-space-xs">
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-mono-label text-primary font-bold shrink-0">
              PR
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate leading-tight">
                Reliability Lead
              </span>
              <span className="font-mono-label text-mono-label text-outline truncate leading-tight">
                Principal SRE
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
