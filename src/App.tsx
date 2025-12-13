import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './stores/store';
import { Layout, ProtectedRoute } from './components/ui';
import { LoginPage } from './pages/auth/LoginPage';
import { UsersPage } from './pages/auth/UsersPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { CreateLeadPage } from './pages/leads/CreateLeadPage';
import { EditLeadPage } from './pages/leads/EditLeadPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { KanbanPage } from './pages/leads/KanbanPage';
import { authStore } from './stores/authStore';
import { authApiClient } from './lib/authApiClient';
import CampaignPage from './pages/campaigns/CampaignPage';
import { DatabasePage } from './pages/database/DatabasePage';
import { EmailCampaignsPage } from './pages/campaigns/emails';
import ExistingCampaignsPage from './pages/campaigns/emails/ExistingCampaignsPage';

// In your routes:

import DealCampaignPage from './pages/campaigns/deals';

function AppContent() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const accessToken = authStore((state) => state.accessToken);
  const refreshToken = authStore((state) => state.refreshToken);
  const logout = authStore((state) => state.logout);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const validateAndRefreshAuth = async () => {
      console.log('App: Initializing auth validation');
      
      // If no tokens exist, just mark as initialized
      if (!accessToken && !refreshToken) {
        console.log('App: No tokens found, marking as initialized');
        setIsInitialized(true);
        return;
      }

      // If we have a refresh token, try to refresh the auth
      if (refreshToken) {
        try {
          console.log('App: Attempting to refresh authentication');
          // The authApiClient interceptor will handle the refresh automatically
          // We just need to make a test request
          await authApiClient.get('/auth/me');
          console.log('App: Auth validation successful');
        } catch (error) {
          console.error('App: Auth validation failed', error);
          logout();
        }
      }
      
      setIsInitialized(true);
      console.log('App: Auth validation complete');
    };

    validateAndRefreshAuth();
  }, []); // Run once on mount

  // Show loading while validating stored auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/leads" replace /> : <LoginPage />
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/leads" replace />} />
          
          <Route
            path="users"
            element={
              <ProtectedRoute requiredAccess={['SUPERADMIN', 'ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/campaigns/emails/existing" element={<ExistingCampaignsPage />} />
          <Route path="campaigns" element={<CampaignPage />} />
          <Route path="campaigns/deals" element={<DealCampaignPage />} />
          <Route path="campaigns/emails" element={<EmailCampaignsPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/kanban" element={<KanbanPage />} />
          <Route path="leads/create" element={<CreateLeadPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/:id/edit" element={<EditLeadPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;