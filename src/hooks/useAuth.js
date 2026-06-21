// ============================================
// BIT SOFTWARE — AUTH HOOK
// ============================================
// Redux auth state সহজে access করার custom hook

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsAdmin,
  setCredentials,
  logout,
  setLoading,
  setError,
} from '@/features/auth/authSlice';
import { authApi } from '@/api/authApi';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAdmin = useSelector(selectIsAdmin);

  // Login
  const login = async (credentials) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.login(credentials);
      const { user, token, refreshToken } = response.data;
      dispatch(setCredentials({ user, token, refreshToken }));
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      dispatch(setError(message));
      return { success: false, error: message };
    }
  };

  // Register
  const register = async (data) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.register(data);
      const { user, token, refreshToken } = response.data;
      dispatch(setCredentials({ user, token, refreshToken }));
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(setError(message));
      return { success: false, error: message };
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Backend call fail হলেও local logout করা হবে
    } finally {
      dispatch(logout());
      navigate('/auth/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    login,
    register,
    logout: handleLogout,
  };
}
