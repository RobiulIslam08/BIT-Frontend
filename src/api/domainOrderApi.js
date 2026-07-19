// ============================================
// BIT SOFTWARE — Domain Order API
// ============================================

import axiosInstance from './axiosInstance';

/**
 * Step 1: Create PayPal order for domain purchase.
 * Returns PayPal order ID and pending DB order ID.
 */
export const createDomainPayPalOrder = async ({ domainName, displayCurrency, customerName, customerEmail, customerPhone }) => {
  const res = await axiosInstance.post('/domain-orders/create-paypal-order', {
    domainName, displayCurrency, customerName, customerEmail, customerPhone,
  });
  return res.data;
};

/**
 * Step 2: Complete purchase after PayPal approval.
 * Backend captures payment + registers on Namecheap + auto-refunds if fail.
 */
export const completeDomainPurchase = async (paypalOrderId) => {
  const res = await axiosInstance.post('/domain-orders/complete-purchase', { paypalOrderId });
  return res.data;
};

/**
 * Get logged-in user's own domains.
 */
export const getMyDomains = async () => {
  const res = await axiosInstance.get('/domain-orders/my-domains');
  return res.data;
};

/**
 * Get live exchange rates (public endpoint).
 */
export const getExchangeRates = async () => {
  const res = await axiosInstance.get('/domain-orders/exchange-rates');
  return res.data;
};

/**
 * Get single domain order by ID.
 */
export const getDomainOrderById = async (id) => {
  const res = await axiosInstance.get(`/domain-orders/${id}`);
  return res.data;
};

// ─── Admin ───

export const getAllDomainOrders = async (params = {}) => {
  const res = await axiosInstance.get('/domain-orders', { params });
  return res.data;
};

export const updateDomainOrderStatus = async (id, data) => {
  const res = await axiosInstance.patch(`/domain-orders/${id}`, data);
  return res.data;
};
