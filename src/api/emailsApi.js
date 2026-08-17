import axiosInstance from './axiosInstance';

export const getMyEmails = async () => {
  const res = await axiosInstance.get('/emails/my');
  return res.data;
};

export const getMyEmailById = async (id) => {
  const res = await axiosInstance.get(`/emails/my/${id}`);
  return res.data;
};

export const sendWebmailAccessEmail = async (id) => {
  const res = await axiosInstance.post(`/emails/my/${id}/send-webmail-access`);
  return res.data;
};

export const getAllEmails = async (params = {}) => {
  const res = await axiosInstance.get('/emails', { params });
  return res.data;
};

export const getEmailByIdAdmin = async (id) => {
  const res = await axiosInstance.get(`/emails/${id}`);
  return res.data;
};

export const createEmail = async (data) => {
  const res = await axiosInstance.post('/emails', data);
  return res.data;
};

export const updateEmail = async (id, data) => {
  const res = await axiosInstance.patch(`/emails/${id}`, data);
  return res.data;
};

export const deleteEmail = async (id) => {
  const res = await axiosInstance.delete(`/emails/${id}`);
  return res.data;
};

export const searchEmailUsers = async (search = '') => {
  const res = await axiosInstance.get('/emails/admin/users', {
    params: search ? { search } : undefined,
  });
  return res.data;
};
