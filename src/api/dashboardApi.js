// ============================================
// BIT SOFTWARE — DASHBOARD API
// ============================================
// Express.js → /api/dashboard/* endpoints (admin only)

import axiosInstance from './axiosInstance';

export const dashboardApi = {
  // GET /api/dashboard/stats (overview stats)
  getStats: () => axiosInstance.get('/dashboard/stats'),

  // GET /api/dashboard/users?page=1&limit=20
  getUsers: (params = {}) => axiosInstance.get('/dashboard/users', { params }),

  // GET /api/dashboard/users/:id
  getUserById: (id) => axiosInstance.get(`/dashboard/users/${id}`),

  // PATCH /api/dashboard/users/:id/role (change user role)
  updateUserRole: (id, role) =>
    axiosInstance.patch(`/dashboard/users/${id}/role`, { role }),

  // DELETE /api/dashboard/users/:id
  deleteUser: (id) => axiosInstance.delete(`/dashboard/users/${id}`),

  // GET /api/dashboard/orders?page=1&limit=20
  getOrders: (params = {}) => axiosInstance.get('/dashboard/orders', { params }),

  // PATCH /api/dashboard/orders/:id/status
  updateOrderStatus: (id, status) =>
    axiosInstance.patch(`/dashboard/orders/${id}/status`, { status }),

  // GET /api/dashboard/analytics
  getAnalytics: (params = {}) =>
    axiosInstance.get('/dashboard/analytics', { params }),
};
