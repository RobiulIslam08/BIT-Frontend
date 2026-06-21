// ============================================
// BIT SOFTWARE — AUTH API
// ============================================
// Express.js → /api/auth/* endpoints

import axiosInstance from './axiosInstance';

export const authApi = {
  // POST /api/auth/register
  register: (data) => axiosInstance.post('/auth/register', data),

  // POST /api/auth/login
  login: (data) => axiosInstance.post('/auth/login', data),

  // POST /api/auth/logout
  logout: () => axiosInstance.post('/auth/logout'),

  // POST /api/auth/refresh-token
  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken }),

  // GET /api/auth/me (current logged-in user)
  getMe: () => axiosInstance.get('/auth/me'),

  // POST /api/auth/forgot-password
  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email }),

  // POST /api/auth/reset-password/:token
  resetPassword: (token, password) =>
    axiosInstance.post(`/auth/reset-password/${token}`, { password }),

  // PATCH /api/auth/change-password
  changePassword: (data) => axiosInstance.patch('/auth/change-password', data),
};
