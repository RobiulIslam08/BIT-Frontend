// ============================================
// BIT SOFTWARE — BLOG API
// ============================================
// Express.js → /api/blogs/* endpoints

import axiosInstance from './axiosInstance';

export const blogApi = {
  // GET /api/blogs?page=1&limit=10&category=tech
  getAll: (params = {}) => axiosInstance.get('/blogs', { params }),

  // GET /api/blogs/:id
  getById: (id) => axiosInstance.get(`/blogs/${id}`),

  // GET /api/blogs/slug/:slug
  getBySlug: (slug) => axiosInstance.get(`/blogs/slug/${slug}`),

  // POST /api/blogs (admin only)
  create: (data) => axiosInstance.post('/blogs', data),

  // PUT /api/blogs/:id (admin only)
  update: (id, data) => axiosInstance.put(`/blogs/${id}`, data),

  // DELETE /api/blogs/:id (admin only)
  delete: (id) => axiosInstance.delete(`/blogs/${id}`),

  // POST /api/blogs/:id/upload
  uploadThumbnail: (id, formData) =>
    axiosInstance.post(`/blogs/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
