// ============================================
// BIT SOFTWARE — Digital Services API
// ============================================

import axiosInstance from './axiosInstance';

export const getDigitalServiceCatalog = async () => {
  const res = await axiosInstance.get('/digital-services/catalog');
  return res.data;
};

export const getTrialEligibility = async (serviceKey = 'supply_company_portal') => {
  const res = await axiosInstance.get('/digital-services/trial-eligibility', {
    params: { serviceKey },
  });
  return res.data;
};

export const createDigitalServicePayPalOrder = async (payload) => {
  const res = await axiosInstance.post('/digital-service-orders/create-paypal-order', payload);
  return res.data;
};

export const completeDigitalServicePurchase = async (paypalOrderId) => {
  const res = await axiosInstance.post('/digital-service-orders/complete-purchase', {
    paypalOrderId,
  });
  return res.data;
};

export const payDigitalServiceWithWallet = async (payload) => {
  const res = await axiosInstance.post('/digital-service-orders/pay-with-wallet', payload);
  return res.data;
};

export const getMyDigitalServices = async () => {
  const res = await axiosInstance.get('/digital-services/my');
  return res.data;
};

export const getMyDigitalServiceById = async (id) => {
  const res = await axiosInstance.get(`/digital-services/my/${id}`);
  return res.data;
};

export const getMyDigitalServiceOrders = async () => {
  const res = await axiosInstance.get('/digital-service-orders/my');
  return res.data;
};

// ─── ADMIN ───

export const getAllDigitalServices = async (params = {}) => {
  const res = await axiosInstance.get('/digital-services', { params });
  return res.data;
};

export const getDigitalServiceAdmin = async (id) => {
  const res = await axiosInstance.get(`/digital-services/${id}`);
  return res.data;
};

export const updateDigitalServiceAdmin = async (id, data) => {
  const res = await axiosInstance.patch(`/digital-services/${id}`, data);
  return res.data;
};

export const getAllDigitalServiceOrders = async (params = {}) => {
  const res = await axiosInstance.get('/digital-service-orders', { params });
  return res.data;
};

export const updateDigitalServiceOrder = async (id, data) => {
  const res = await axiosInstance.patch(`/digital-service-orders/${id}`, data);
  return res.data;
};
