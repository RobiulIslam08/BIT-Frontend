// ============================================
// BIT SOFTWARE — AUTH SLICE
// ============================================
// Express.js + MongoDB backend-এর জন্য আপডেট করা হয়েছে।
// JWT token এবং user data localStorage-এ persist করা হয়।
// MongoDB _id (ObjectId string) handle করা হয়।

import { createSlice } from '@reduxjs/toolkit';
import { tokenStorage } from '@/utils/tokenStorage';

// App load-এ localStorage থেকে পড়া (persisted state)
const persistedToken = tokenStorage.getToken();
const persistedUser = tokenStorage.getUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser || null,         // MongoDB user document
    token: persistedToken || null,       // JWT access token
    isAuthenticated: !!(persistedToken && persistedUser),
    isLoading: false,
    error: null,
  },
  reducers: {
    // Login সফল হলে call করা হয়
    // payload: { user: {..., _id: 'mongo_id'}, token: 'jwt', refreshToken: 'jwt' }
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
      // localStorage-এ persist
      tokenStorage.setToken(token);
      tokenStorage.setUser(user);
      if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
    },

    // Profile update-এর পরে user data রিফ্রেশ
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      tokenStorage.setUser(state.user);
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Logout — সব clear
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      tokenStorage.clearAll();
    },
  },
});

export const { setCredentials, updateUser, setLoading, setError, logout } =
  authSlice.actions;

// ─── SELECTORS ───
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// MongoDB-এ role check
export const selectIsAdmin = (state) =>
  state.auth.user?.role === 'admin';

export default authSlice.reducer;
