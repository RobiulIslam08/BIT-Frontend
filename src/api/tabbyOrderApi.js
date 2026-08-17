// ============================================
// BIT SOFTWARE — Tabby Business Order API
// ============================================

import axiosInstance from './axiosInstance';

export const createTabbyPayPalOrder = async () => {
  const response = await axiosInstance.post('/tabby-orders/create-paypal-order', {}, { timeout: 60000 });
  return response.data;
};

export const submitTabbyOrder = async (orderData) => {
  const response = await axiosInstance.post('/tabby-orders', orderData, { timeout: 60000 });
  return response.data;
};

export const payTabbyWithWallet = async (orderData) => {
  const response = await axiosInstance.post('/tabby-orders/pay-with-wallet', orderData, { timeout: 60000 });
  return response.data;
};

export const getMyTabbyOrders = async () => {
  const response = await axiosInstance.get('/tabby-orders/my');
  return response.data;
};

export const getMyTabbyOrderById = async (id) => {
  const response = await axiosInstance.get(`/tabby-orders/my/${id}`);
  return response.data;
};

export const requestTabbyRefund = async (id, reason) => {
  const response = await axiosInstance.post(`/tabby-orders/${id}/refund-request`, { reason });
  return response.data;
};

export const uploadTabbyOrderFile = async (orderId, key, file) => {
  const formData = new FormData();
  formData.append('key', key);
  formData.append('file', file);
  const response = await axiosInstance.post(`/tabby-orders/${orderId}/files`, formData, {
    timeout: 120000,
  });
  return response.data;
};

export const getTabbyFileUrl = (orderId, fileId) =>
  `/tabby-orders/${orderId}/files/${fileId}`;

export const downloadTabbyFile = async (orderId, fileId) => {
  const response = await axiosInstance.get(`/tabby-orders/${orderId}/files/${fileId}`, {
    responseType: 'blob',
    timeout: 60000,
  });
  const blob = response.data;
  if (blob?.type && blob.type.includes('application/json')) {
    throw new Error('Could not open this document.');
  }
  return blob;
};

export const openTabbyFile = async (orderId, file) => {
  const preview = window.open('about:blank', '_blank');
  try {
    const blob = await downloadTabbyFile(orderId, file._id);
    const url = URL.createObjectURL(blob);
    if (preview) {
      preview.location.href = url;
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.key || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    preview?.close();
    throw err;
  }
};

export const getAllTabbyOrders = async (params = {}) => {
  const response = await axiosInstance.get('/tabby-orders', { params });
  return response.data;
};

export const updateTabbyOrder = async (id, payload) => {
  const response = await axiosInstance.patch(`/tabby-orders/${id}`, payload);
  return response.data;
};

export const processTabbyRefund = async (id, { action, adminNote }) => {
  const response = await axiosInstance.post(`/tabby-orders/${id}/refund`, { action, adminNote });
  return response.data;
};

export const deleteTabbyOrder = async (id) => {
  const response = await axiosInstance.delete(`/tabby-orders/${id}`);
  return response.data;
};
