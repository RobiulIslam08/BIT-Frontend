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

export const uploadHostingProject = async (id, file, onProgress) => {
  // Chunked upload — each piece ~5 MB so Traefik/proxy won't stall on 100–400 MB bodies
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const uploadId = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const blob = file.slice(start, end);

      const form = new FormData();
      form.append('chunk', blob, `${file.name}.part${i}`);
      form.append('uploadId', uploadId);
      form.append('chunkIndex', String(i));
      form.append('totalChunks', String(totalChunks));

      await axiosInstance.post(`/hostings/${id}/project/chunk`, form, {
        timeout: 10 * 60 * 1000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      if (onProgress) {
        onProgress({
          percent: Math.min(99, Math.round(((i + 1) / totalChunks) * 100)),
          loaded: end,
          total: file.size,
        });
      }
    }

    const res = await axiosInstance.post(`/hostings/${id}/project/complete`, {
      uploadId,
      totalChunks,
      originalName: file.name,
      mimeType: file.type || 'application/zip',
      totalSize: file.size,
    }, {
      timeout: 10 * 60 * 1000,
    });

    if (onProgress) {
      onProgress({ percent: 100, loaded: file.size, total: file.size });
    }

    return res.data;
  } catch (err) {
    try {
      await axiosInstance.post(`/hostings/${id}/project/abort`, { uploadId });
    } catch {
      /* ignore abort errors */
    }
    throw err;
  }
};

export const removeHostingProject = async (id) => {
  const res = await axiosInstance.delete(`/hostings/${id}/project`);
  return res.data;
};
