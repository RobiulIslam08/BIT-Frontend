// ============================================
// BIT SOFTWARE — Domain Pricing API
// ============================================

import axiosInstance from './axiosInstance';

/** Public — active TLD prices for website / checkout. */
export const getPublicDomainPricing = async () => {
  const res = await axiosInstance.get('/domain-pricing/public');
  return res.data;
};

/** Admin — full list (including inactive). */
export const getAllDomainPricing = async (params = {}) => {
  const res = await axiosInstance.get('/domain-pricing', { params });
  return res.data;
};

export const createDomainPricing = async (data) => {
  const res = await axiosInstance.post('/domain-pricing', data);
  return res.data;
};

export const updateDomainPricing = async (id, data) => {
  const res = await axiosInstance.patch(`/domain-pricing/${id}`, data);
  return res.data;
};

export const deleteDomainPricing = async (id) => {
  const res = await axiosInstance.delete(`/domain-pricing/${id}`);
  return res.data;
};

export const bulkUpsertDomainPricing = async (items) => {
  const res = await axiosInstance.put('/domain-pricing/bulk', { items });
  return res.data;
};
