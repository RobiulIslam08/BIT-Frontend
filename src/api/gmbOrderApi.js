// ============================================
// BIT SOFTWARE — GMB ORDER API
// ============================================
// Google My Business service order API endpoints.
// Designed for scalability — new payment methods
// can be added without modifying existing logic.

import axiosInstance from './axiosInstance';

/**
 * Submit a new GMB service order.
 * Uses FormData to support file uploads (payment screenshots).
 */
export const submitGMBOrder = async (orderData) => {
  const formData = new FormData();

  // Flatten order data into FormData
  Object.entries(orderData).forEach(([key, value]) => {
    if (key === 'paymentScreenshot' && value instanceof File) {
      formData.append('paymentScreenshot', value);
    } else if (key === 'businessHours' || key === 'transactionDetails' || Array.isArray(value)) {
      // Arrays and known objects must be JSON stringified for FormData
      if (value !== null && value !== undefined) {
        formData.append(key, JSON.stringify(value));
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  const response = await axiosInstance.post('/gmb-orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Pay for a GMB order using wallet balance (authenticated customers only).
 * Sends JSON (no file upload needed for wallet payments).
 */
export const payGMBWithWallet = async (orderData) => {
  const response = await axiosInstance.post('/gmb-orders/pay-with-wallet', orderData);
  return response.data;
};

/**
 * Validate a coupon code for GMB services.
 */
export const validateCoupon = async (couponCode) => {
  const response = await axiosInstance.post('/gmb-orders/validate-coupon', {
    couponCode,
  });
  return response.data;
};

/**
 * Create a PayPal order SERVER-SIDE.
 * Returns the PayPal order ID for the frontend SDK to use.
 * This replaces the deprecated client-side actions.order.create().
 */
export const createPayPalOrder = async ({ finalAmount, serviceType }) => {
  const response = await axiosInstance.post('/gmb-orders/create-paypal-order', {
    finalAmount,
    serviceType,
  });
  return response.data;
};

/**
 * Get GMB order status by order ID.
 */
export const getGMBOrderStatus = async (orderId) => {
  const response = await axiosInstance.get(`/gmb-orders/${orderId}`);
  return response.data;
};

/**
 * Admin: Get all GMB orders with filters.
 */
export const getAllGMBOrders = async (params = {}) => {
  const response = await axiosInstance.get('/gmb-orders', { params });
  return response.data;
};

/**
 * Admin: Update order status / payment verification.
 */
export const updateGMBOrderStatus = async (orderId, statusData) => {
  const response = await axiosInstance.patch(`/gmb-orders/${orderId}`, statusData);
  return response.data;
};

/**
 * Admin: Update order info (Business Name, Email, etc).
 */
export const updateGMBOrderInfo = async (orderId, updateData) => {
  const response = await axiosInstance.put(`/gmb-orders/${orderId}`, updateData);
  return response.data;
};

/**
 * Admin: Delete an order completely.
 */
export const deleteGMBOrder = async (orderId) => {
  const response = await axiosInstance.delete(`/gmb-orders/${orderId}`);
  return response.data;
};
