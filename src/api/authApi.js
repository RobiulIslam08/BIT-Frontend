// ============================================
// BIT SOFTWARE — AUTH API
// ============================================
// Backend: /api/v1/auth/* endpoints

import axiosInstance from './axiosInstance';

export const authApi = {
  // POST /api/v1/auth/register
  register: (data) => axiosInstance.post('/auth/register', data),

  // POST /api/v1/auth/login
  login: (data) => axiosInstance.post('/auth/login', data),

  // POST /api/v1/auth/refresh-token (cookie থেকে refreshToken পাঠানো হয়)
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),

  // POST /api/v1/auth/change-password
  changePassword: (data) => axiosInstance.post('/auth/change-password', data),

  // POST /api/v1/auth/forget-password
  forgotPassword: (email) =>
    axiosInstance.post('/auth/forget-password', { email }),

  // POST /api/v1/auth/reset-password (token Authorization header এ যাবে)
  resetPassword: (token, data) =>
    axiosInstance.post('/auth/reset-password', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
