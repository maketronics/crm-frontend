import { } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Layout, ProtectedRoute } from './components/ui';
import { LoginPage } from './pages/auth/LoginPage';
import { UsersPage } from './pages/auth/UsersPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { CreateLeadPage } from './pages/leads/CreateLeadPage';
import { EditLeadPage } from './pages/leads/EditLeadPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { authStore } from './stores/authStore';

function App() {
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
              <ProtectedRoute requiredAccess={['superadmin', 'admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/create" element={<CreateLeadPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/edit/:id" element={<EditLeadPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;