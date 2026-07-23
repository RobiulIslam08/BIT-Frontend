// ============================================
// BIT SOFTWARE — Hosting Orders API (purchase)
// ============================================

import axiosInstance from './axiosInstance';

export const createHostingPayPalOrder = async (payload) => {
  const res = await axiosInstance.post('/hosting-orders/create-paypal-order', payload);
  return res.data;
};

export const completeHostingPurchase = async (paypalOrderId) => {
  const res = await axiosInstance.post('/hosting-orders/complete-purchase', { paypalOrderId });
  return res.data;
};

/** Pay for a hosting plan using wallet balance (single step, no PayPal). */
export const payHostingWithWallet = async (payload) => {
  const res = await axiosInstance.post('/hosting-orders/pay-with-wallet', payload);
  return res.data;
};

export const getMyHostingOrders = async () => {
  const res = await axiosInstance.get('/hosting-orders/my');
  return res.data;
};

// ─── ADMIN ───

export const getAllHostingOrders = async (params = {}) => {
  const res = await axiosInstance.get('/hosting-orders', { params });
  return res.data;
};

export const updateHostingOrder = async (id, data) => {
  const res = await axiosInstance.patch(`/hosting-orders/${id}`, data);
  return res.data;
};
