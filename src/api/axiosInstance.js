// ============================================
// BIT SOFTWARE — AXIOS INSTANCE
// ============================================
// Express.js backend-এর সাথে সব HTTP request
// এই instance-এর মাধ্যমে যাবে।
// JWT token auto-attach + 401 auto-refresh → logout।

import axios from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // cookie-based refresh token-এর জন্য
});

// ─── REQUEST INTERCEPTOR ───
// প্রতিটি request-এ JWT access token Authorization header-এ যোগ করে
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ───
// 401 হলে → cookie থেকে refresh token দিয়ে নতুন access token নেওয়ার চেষ্টা
// তাও fail করলে → সব clear করে login-এ redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/google-verify') ||
                        originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Refresh token httpOnly cookie থেকে automatically যাবে
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          tokenStorage.setToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
        throw new Error('No access token received');
      } catch {
        // Refresh ব্যর্থ হলে সব clear করে login-এ পাঠাও
        tokenStorage.clearAll();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
