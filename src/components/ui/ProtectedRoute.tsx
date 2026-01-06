/* src/components/ui/ProtectedRoute.tsx */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAccess?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredAccess = [],
}) => {
  const { isAuthenticated, user, _hasHydrated } = authStore();

  // Wait for hydration to complete before making auth decisions
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredAccess.length > 0) {
    const hasRequiredAccess = requiredAccess.some((access) =>
      user.roles.includes(access)
    );

    if (!hasRequiredAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};