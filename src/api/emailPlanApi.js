import axiosInstance from './axiosInstance';

export const getPublicEmailPlans = async () => {
  const res = await axiosInstance.get('/email-plans/public');
  return res.data;
};

export const getAllEmailPlans = async (params = {}) => {
  const res = await axiosInstance.get('/email-plans', { params });
  return res.data;
};

export const createEmailPlan = async (data) => {
  const res = await axiosInstance.post('/email-plans', data);
  return res.data;
};

export const updateEmailPlan = async (id, data) => {
  const res = await axiosInstance.patch(`/email-plans/${id}`, data);
  return res.data;
};

export const deleteEmailPlan = async (id) => {
  const res = await axiosInstance.delete(`/email-plans/${id}`);
  return res.data;
};
