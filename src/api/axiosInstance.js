// ============================================
// BIT SOFTWARE — AXIOS INSTANCE
// ============================================
// Express.js backend-এর সাথে সব HTTP request
// এই instance-এর মাধ্যমে যাবে।
// JWT token auto-attach + 401 auto-logout।

import axios from 'axios';
import { tokenStorage } from '@/utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // cookie-based auth-এর জন্য
});

// ─── REQUEST INTERCEPTOR ───
// প্রতিটি request-এ JWT token header-এ যোগ করে
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
// 401: token expire → logout + redirect
// 403: permission নেই → handle
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh token দিয়ে নতুন access token নেওয়ার চেষ্টা
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const { accessToken } = res.data;
          tokenStorage.setToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch {
          // Refresh ব্যর্থ হলে সব clear করে login-এ পাঠাও
          tokenStorage.clearAll();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
      } else {
        tokenStorage.clearAll();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
