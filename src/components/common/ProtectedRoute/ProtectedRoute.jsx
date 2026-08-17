// ============================================
// BIT SOFTWARE — PROTECTED ROUTE
// ============================================
// JWT token check করে route guard।
// isAuthenticated false হলে login-এ redirect।
// isAdmin required হলে admin check করে।
// GuestRoute — logged in থাকলে saved page (বা role default) এ redirect।

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectCurrentUser,
} from '@/features/auth/authSlice';
import { getPostAuthRedirect } from '@/utils/authRedirect';

/**
 * ProtectedRoute — authenticated users only
 * Usage in router: element: <ProtectedRoute />
 */
export function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Login-এ redirect — current URL save করা হয় যাতে login-এর পরে ফিরে আসা যায়
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * AdminRoute — admin role required
 * Usage in router: element: <AdminRoute />
 */
export function AdminRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Authenticated কিন্তু admin নয় → home-এ পাঠাও (toast নেই — login success-এর সাথে clash এড়াতে)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * GuestRoute — logged-out users only (login/register pages)
 * Logged in থাকলে → saved page, otherwise role default
 */
export function GuestRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (isAuthenticated) {
    const redirectTo = getPostAuthRedirect({ location, userRole: user?.role });
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
