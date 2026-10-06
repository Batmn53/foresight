import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Bottleneck } from './pages/Bottleneck';
import { RiskRadar } from './pages/RiskRadar';
import { ReleaseReadiness } from './pages/ReleaseReadiness';
import { GitHubSync } from './pages/GitHubSync';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Index redirect to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bottlenecks" element={<Bottleneck />} />
          <Route path="risk" element={<RiskRadar />} />
          <Route path="release" element={<ReleaseReadiness />} />
          <Route path="github" element={<GitHubSync />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
