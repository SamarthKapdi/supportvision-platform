import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';
import { useAuthStore } from './stores/authStore';
import { Role } from './types';

// Components & Pages
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MetricsDashboard } from './pages/MetricsDashboard';
import { SessionHistory } from './pages/SessionHistory';
import { VideoRoom } from './pages/VideoRoom';
import { CustomerJoin } from './pages/CustomerJoin';
import { RecordingLibrary } from './components/admin/RecordingLibrary';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: Role[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === Role.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.JOIN} element={<CustomerJoin />} />

      {/* Root redirect */}
      <Route 
        path={ROUTES.HOME} 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === Role.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        } 
      />

      {/* Authenticated Routes with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        
        {/* Agent Routes */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={<ProtectedRoute allowedRoles={[Role.AGENT, Role.ADMIN]}><AgentDashboard /></ProtectedRoute>} 
        />
        <Route 
          path={ROUTES.HISTORY} 
          element={<ProtectedRoute allowedRoles={[Role.AGENT, Role.ADMIN]}><SessionHistory /></ProtectedRoute>} 
        />
        
        {/* Admin Routes */}
        <Route 
          path={ROUTES.ADMIN} 
          element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path={ROUTES.METRICS} 
          element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><MetricsDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/recordings" 
          element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><RecordingLibrary /></ProtectedRoute>} 
        />
      </Route>

      {/* Full-screen Routes */}
      <Route 
        path={ROUTES.ROOM} 
        element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} 
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default App;
