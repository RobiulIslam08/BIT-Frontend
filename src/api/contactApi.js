// ============================================
// BIT SOFTWARE — CONTACT API
// ============================================
// Express.js → /api/contact/* endpoints

import axiosInstance from './axiosInstance';

export const contactApi = {
  // POST /api/contact (submit form — public)
  submit: (data) => axiosInstance.post('/contact', data),

  // GET /api/contact (admin: সব leads দেখো)
  getAll: (params = {}) => axiosInstance.get('/contact', { params }),

  // GET /api/contact/:id (admin)
  getById: (id) => axiosInstance.get(`/contact/${id}`),

  // PATCH /api/contact/:id/status (admin: mark as read/replied)
  updateStatus: (id, status) =>
    axiosInstance.patch(`/contact/${id}/status`, { status }),

  // DELETE /api/contact/:id (admin)
  delete: (id) => axiosInstance.delete(`/contact/${id}`),
};
