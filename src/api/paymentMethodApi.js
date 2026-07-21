// ============================================
// BIT SOFTWARE — Payment Methods API
// ============================================
// Saved PayPal payment methods used to enable domain auto-renew.

import axiosInstance from './axiosInstance';

/** Step 1: create a vault setup token for the PayPal save flow. */
export const createSetupToken = async () => {
  const res = await axiosInstance.post('/payment-methods/setup-token');
  return res.data;
};

/** Step 2: persist the approved payment method. */
export const savePaymentMethod = async (setupToken) => {
  const res = await axiosInstance.post('/payment-methods', {
    setupToken,
    vaultSetupToken: setupToken, // alias accepted by backend
  });
  return res.data;
};

export const getMyPaymentMethods = async () => {
  const res = await axiosInstance.get('/payment-methods');
  return res.data;
};

export const setDefaultPaymentMethod = async (id) => {
  const res = await axiosInstance.patch(`/payment-methods/${id}/default`);
  return res.data;
};

export const deletePaymentMethod = async (id) => {
  const res = await axiosInstance.delete(`/payment-methods/${id}`);
  return res.data;
};
