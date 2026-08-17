// ============================================
// BIT SOFTWARE — Visitor Activity API
// ============================================
// Ingest (page-view / heartbeat / leave) uses raw fetch so tracking
// failures never trigger the axios 401 → login redirect.
// Admin reads use axiosInstance like other dashboard pages.

import axiosInstance from './axiosInstance';
import { ENV } from '@/config/env';
import { tokenStorage } from '@/utils/tokenStorage';

async function ingest(path, body, { keepalive = false } = {}) {
  try {
    const token = tokenStorage.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    await fetch(`${ENV.API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      keepalive,
      credentials: 'omit',
    });
  } catch {
    // Tracking must never break the site
  }
}

export const trackActivityPageView = (body) => ingest('/activity/page-view', body);

export const trackActivityHeartbeat = (body) => ingest('/activity/heartbeat', body);

export const trackActivityLeave = (body) => ingest('/activity/leave', body, { keepalive: true });

export const trackActivityEvent = (body) => ingest('/activity/event', body);

export const getLiveActivity = async () => {
  const res = await axiosInstance.get('/activity/live');
  return res.data;
};

export const getActivitySessions = async (params = {}) => {
  const res = await axiosInstance.get('/activity/sessions', { params });
  return res.data;
};

export const getActivitySessionById = async (id) => {
  const res = await axiosInstance.get(`/activity/sessions/${id}`);
  return res.data;
};
