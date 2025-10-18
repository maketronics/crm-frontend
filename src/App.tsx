import { } from 'react';
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

function AppContent() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);

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

          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/kanban" element={<KanbanPage />} />
          <Route path="leads/create" element={<CreateLeadPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/edit/:id" element={<EditLeadPage />} />
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