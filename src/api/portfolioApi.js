// ============================================
// BIT SOFTWARE — PORTFOLIO API
// ============================================
// Express.js → /api/portfolio/* endpoints

import axiosInstance from './axiosInstance';

export const portfolioApi = {
  // GET /api/portfolio?category=web&page=1&limit=12
  getAll: (params = {}) => axiosInstance.get('/portfolio', { params }),

  // GET /api/portfolio/:id
  getById: (id) => axiosInstance.get(`/portfolio/${id}`),

  // POST /api/portfolio (admin only)
  create: (data) => axiosInstance.post('/portfolio', data),

  // PUT /api/portfolio/:id (admin only)
  update: (id, data) => axiosInstance.put(`/portfolio/${id}`, data),

  // DELETE /api/portfolio/:id (admin only)
  delete: (id) => axiosInstance.delete(`/portfolio/${id}`),

  // POST /api/portfolio/:id/upload (image upload)
  uploadImage: (id, formData) =>
    axiosInstance.post(`/portfolio/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
