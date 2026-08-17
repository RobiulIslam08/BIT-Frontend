import axiosInstance from './axiosInstance';

export const createEmailPayPalOrder = async (payload) => {
  const res = await axiosInstance.post('/email-orders/create-paypal-order', payload);
  return res.data;
};

export const completeEmailPurchase = async (paypalOrderId) => {
  const res = await axiosInstance.post('/email-orders/complete-purchase', { paypalOrderId });
  return res.data;
};

export const payEmailWithWallet = async (payload) => {
  const res = await axiosInstance.post('/email-orders/pay-with-wallet', payload);
  return res.data;
};

export const getMyEmailOrders = async () => {
  const res = await axiosInstance.get('/email-orders/my');
  return res.data;
};

export const getAllEmailOrders = async (params = {}) => {
  const res = await axiosInstance.get('/email-orders', { params });
  return res.data;
};

export const updateEmailOrder = async (id, data) => {
  const res = await axiosInstance.patch(`/email-orders/${id}`, data);
  return res.data;
};
