import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

/**
 * Wraps any route that requires authentication.
 *
 * Props:
 *   children      — the page to render if access is granted
 *   requiredRole  — (optional) restrict to a specific role
 *
 * Behaviour:
 *   1. Not authenticated → redirect to /login with the attempted path saved
 *   2. Wrong role        → redirect to own dashboard
 *   3. Authenticated + correct role → render children
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Hook checks token expiry every 60 seconds
  useSessionTimeout();

  // 1. Not logged in at all
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // 2. Logged in but wrong role
  if (requiredRole && user.role !== requiredRole) {
    const ownDashboard = getDashboardPath(user.role);
    return <Navigate to={ownDashboard} replace />;
  }

  // 3. All good
  return children;
}

/**
 * Returns the correct dashboard path for a given role.
 * Used by ProtectedRoute and the login success handler.
 */
export function getDashboardPath(role) {
  const paths = {
    ADMIN: '/admin/dashboard',
    STUDENT: '/student/dashboard',
    LECTURER: '/lecturer/dashboard',
    TECHNICIAN: '/technician/dashboard',
  };
  return paths[role] || '/login';
}
