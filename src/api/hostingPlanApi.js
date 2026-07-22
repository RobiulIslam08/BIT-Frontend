// ============================================
// BIT SOFTWARE — Hosting Plans API
// ============================================

import axiosInstance from './axiosInstance';

/** Public active plans for marketing / checkout. */
export const getPublicHostingPlans = async (planType) => {
  const res = await axiosInstance.get('/hosting-plans/public', {
    params: planType ? { planType } : undefined,
  });
  return res.data;
};

// ─── ADMIN ───

export const getAllHostingPlans = async (params = {}) => {
  const res = await axiosInstance.get('/hosting-plans', { params });
  return res.data;
};

export const createHostingPlan = async (data) => {
  const res = await axiosInstance.post('/hosting-plans', data);
  return res.data;
};

export const updateHostingPlan = async (id, data) => {
  const res = await axiosInstance.patch(`/hosting-plans/${id}`, data);
  return res.data;
};

export const deleteHostingPlan = async (id) => {
  const res = await axiosInstance.delete(`/hosting-plans/${id}`);
  return res.data;
};
