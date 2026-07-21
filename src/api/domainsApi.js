// ============================================
// BIT SOFTWARE — Domains (Assets) API
// ============================================
// Canonical "owned domains" — admin management + user dashboard + renewals.

import axiosInstance from './axiosInstance';

// ─── USER ───

/** Get the logged-in user's domains (legacy + purchased, merged). */
export const getMyDomains = async () => {
  const res = await axiosInstance.get('/domains/my');
  return res.data;
};

/** Get full details for one of the user's domains (incl. live renewal fee). */
export const getMyDomainById = async (id) => {
  const res = await axiosInstance.get(`/domains/my/${id}`);
  return res.data;
};

/** Enable/disable auto-renew for a domain. */
export const toggleAutoRenew = async (id, autoRenew) => {
  const res = await axiosInstance.patch(`/domains/my/${id}/auto-renew`, { autoRenew });
  return res.data;
};

/** Step 1: create a PayPal order to renew a domain. */
export const createRenewOrder = async (id, displayCurrency) => {
  const res = await axiosInstance.post(`/domains/my/${id}/renew/create-order`, { displayCurrency });
  return res.data;
};

/** Step 2: complete a domain renewal after PayPal approval. */
export const completeRenew = async (paypalOrderId) => {
  const res = await axiosInstance.post('/domains/my/renew/complete', { paypalOrderId });
  return res.data;
};

// ─── ADMIN ───

export const getAllDomains = async (params = {}) => {
  const res = await axiosInstance.get('/domains', { params });
  return res.data;
};

export const getDomainByIdAdmin = async (id) => {
  const res = await axiosInstance.get(`/domains/${id}`);
  return res.data;
};

export const createDomain = async (data) => {
  const res = await axiosInstance.post('/domains', data);
  return res.data;
};

export const updateDomain = async (id, data) => {
  const res = await axiosInstance.patch(`/domains/${id}`, data);
  return res.data;
};

export const deleteDomain = async (id) => {
  const res = await axiosInstance.delete(`/domains/${id}`);
  return res.data;
};

/** Search users for the "assign to user" picker. */
export const searchUsers = async (search = '') => {
  const res = await axiosInstance.get('/domains/admin/users', { params: { search } });
  return res.data;
};

/** Manually run the auto-renew engine (admin). */
export const runRenewalEngine = async () => {
  const res = await axiosInstance.post('/domains/renewal-engine/run');
  return res.data;
};
