// ============================================
// BIT SOFTWARE — Hostings (Assets) API
// ============================================

import axiosInstance from './axiosInstance';
import { toAbsoluteApiUrl } from '@/config/env';

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

  const url = toAbsoluteApiUrl(downloadPath);

  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** Open customer's cPanel via short-lived SSO auto-login (new tab). */
export const openCpanelLogin = async (id) => {
  // Open synchronously on user gesture so popup blockers don't kill the tab
  const popup = window.open('about:blank', '_blank');

  try {
    const res = await axiosInstance.post(`/hostings/my/${id}/cpanel-login`);
    const ssoUrl = res?.data?.data?.ssoUrl;
    const ssoPath = res?.data?.data?.ssoPath;
    if (!ssoUrl && !ssoPath) {
      if (popup && !popup.closed) popup.close();
      throw new Error(res?.data?.message || 'Failed to create cPanel login link.');
    }

    const url = toAbsoluteApiUrl(ssoUrl || ssoPath);

    if (popup && !popup.closed) {
      popup.opener = null;
      popup.location.href = url;
    } else {
      // Popup blocked — same-tab fallback
      window.location.href = url;
    }
    return res.data;
  } catch (err) {
    if (popup && !popup.closed) popup.close();
    throw err;
  }
};

/** Email cPanel credentials (URL, username, password, domain) to the customer. */
export const sendCpanelAccessEmail = async (id) => {
  const res = await axiosInstance.post(`/hostings/my/${id}/send-cpanel-access`);
  return res.data;
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
