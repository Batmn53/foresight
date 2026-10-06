import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { githubApi } from '../services/api';
import { Repository } from '../types';

export interface AppLayoutContext {
  selectedRepo: Repository | null;
  timeRange: string;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [timeRange, setTimeRange] = useState('30D');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    githubApi
      .getRepositories()
      .then((repos) => {
        if (!isMounted) return;
        setRepositories(repos);
        if (repos.length > 0 && !selectedRepo) {
          setSelectedRepo(repos[0]);
        }
      })
      .catch(() => {
        // Fallback already handled inside api.ts
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await githubApi.triggerSync(selectedRepo?.id);
    } catch {
      // Ignored
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased">
      {/* Stitch Fixed Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Stitch Fixed Header */}
      <Header
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepo={(repo) => setSelectedRepo(repo)}
        onToggleMobile={() => setMobileMenuOpen((prev) => !prev)}
        timeRange={timeRange}
        onSelectTimeRange={(range) => setTimeRange(range)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <div className="md:pl-64">
        <main className="relative pt-14 w-full px-gutter min-h-screen bg-background">
          <Outlet
            context={{
              selectedRepo,
              timeRange,
              onSync: handleSync,
              isSyncing,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
