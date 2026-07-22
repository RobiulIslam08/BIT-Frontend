// ============================================
// BIT SOFTWARE — Hostings (Assets) API
// ============================================

import axiosInstance from './axiosInstance';
import { ENV } from '@/config/env';
import { tokenStorage } from '@/utils/tokenStorage';

// ─── USER ───

export const getMyHostings = async () => {
  const res = await axiosInstance.get('/hostings/my');
  return res.data;
};

export const getMyHostingById = async (id) => {
  const res = await axiosInstance.get(`/hostings/my/${id}`);
  return res.data;
};

/** Trigger browser download of the project ZIP (auth via Bearer). */
export const downloadHostingProject = async (id, fallbackName = 'project.zip') => {
  const token = tokenStorage.getToken();
  const base = (ENV.API_URL || '').replace(/\/$/, '');
  const url = `${base}/hostings/my/${id}/download`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let message = 'Failed to download project file.';
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  let filename = fallbackName;
  if (match?.[1]) {
    filename = match[1].replace(/['"]/g, '');
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
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
    headers: { 'Content-Type': 'multipart/form-data' },
    // Large project ZIPs (200–400 MB) need a long timeout + no body size cap
    timeout: 30 * 60 * 1000, // 30 minutes
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return res.data;
};

export const removeHostingProject = async (id) => {
  const res = await axiosInstance.delete(`/hostings/${id}/project`);
  return res.data;
};
