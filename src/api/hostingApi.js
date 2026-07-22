// ============================================
// BIT SOFTWARE — Hostings (Assets) API
// ============================================

import axiosInstance from './axiosInstance';
import { ENV } from '@/config/env';

// ─── USER ───

export const getMyHostings = async () => {
  const res = await axiosInstance.get('/hostings/my');
  return res.data;
};

export const getMyHostingById = async (id) => {
  const res = await axiosInstance.get(`/hostings/my/${id}`);
  return res.data;
};

/** Trigger browser download of the project ZIP (auth via short-lived token + native stream). */
export const downloadHostingProject = async (id, fallbackName = 'project.zip') => {
  // 1) Get a short-lived download URL (avoids loading 200–400 MB into JS memory)
  const tokenRes = await axiosInstance.post(`/hostings/my/${id}/download-token`);
  const downloadPath = tokenRes?.data?.data?.downloadPath;
  if (!downloadPath) {
    throw new Error(tokenRes?.data?.message || 'Failed to create download link.');
  }

  // downloadPath is like /api/v1/hostings/download-file?token=...
  // ENV.API_URL is usually http://host/api/v1 — strip /api/v1 if path already includes it
  const apiBase = (ENV.API_BASE_URL || '').replace(/\/$/, '');
  const url = downloadPath.startsWith('http')
    ? downloadPath
    : `${apiBase}${downloadPath.startsWith('/') ? '' : '/'}${downloadPath}`;

  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ─── ADMIN ───

export const getAllHostings = async (params = {}) => {
  const res = await axiosInstance.get('/hostings', { params });
  return res.data;
};

export const getHostingByIdAdmin = async (id) => {
  const res = await axiosInstance.get(`/hostings/${id}`);
  return res.data;
};

export const createHosting = async (data) => {
  const res = await axiosInstance.post('/hostings', data);
  return res.data;
};

export const updateHosting = async (id, data) => {
  const res = await axiosInstance.patch(`/hostings/${id}`, data);
  return res.data;
};

export const deleteHosting = async (id) => {
  const res = await axiosInstance.delete(`/hostings/${id}`);
  return res.data;
};

export const searchHostingUsers = async (search = '') => {
  const res = await axiosInstance.get('/hostings/admin/users', { params: { search } });
  return res.data;
};

export const uploadHostingProject = async (id, file) => {
  const form = new FormData();
  form.append('projectFile', file);
  const res = await axiosInstance.post(`/hostings/${id}/project`, form, {
    // Do NOT set Content-Type manually — browser must add multipart boundary
    timeout: 30 * 60 * 1000, // 30 minutes for large ZIPs
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return res.data;
};

export const removeHostingProject = async (id) => {
  const res = await axiosInstance.delete(`/hostings/${id}/project`);
  return res.data;
};
