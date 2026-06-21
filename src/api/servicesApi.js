// ============================================
// BIT SOFTWARE — SERVICES API
// ============================================
// Express.js → /api/services/* endpoints

import axiosInstance from './axiosInstance';

export const servicesApi = {
  // GET /api/services?category=web&page=1&limit=10
  getAll: (params = {}) => axiosInstance.get('/services', { params }),

  // GET /api/services/:id
  getById: (id) => axiosInstance.get(`/services/${id}`),

  // GET /api/services/slug/:slug
  getBySlug: (slug) => axiosInstance.get(`/services/slug/${slug}`),

  // POST /api/services (admin only)
  create: (data) => axiosInstance.post('/services', data),

  // PUT /api/services/:id (admin only)
  update: (id, data) => axiosInstance.put(`/services/${id}`, data),

  // DELETE /api/services/:id (admin only)
  delete: (id) => axiosInstance.delete(`/services/${id}`),

  // POST /api/services/:id/upload (image upload)
  uploadImage: (id, formData) =>
    axiosInstance.post(`/services/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
