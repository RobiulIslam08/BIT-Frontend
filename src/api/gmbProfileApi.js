// ============================================
// BIT SOFTWARE — GMB Profiles (Assets) API
// ============================================

import axiosInstance from './axiosInstance';

// ─── USER ───

export const getMyGmbProfiles = async () => {
  const res = await axiosInstance.get('/gmb-profiles/my');
  return res.data;
};

export const getMyGmbProfileById = async (id) => {
  const res = await axiosInstance.get(`/gmb-profiles/my/${id}`);
  return res.data;
};

// ─── ADMIN ───

export const getAllGmbProfiles = async (params = {}) => {
  const res = await axiosInstance.get('/gmb-profiles', { params });
  return res.data;
};

export const getGmbProfileByIdAdmin = async (id) => {
  const res = await axiosInstance.get(`/gmb-profiles/${id}`);
  return res.data;
};

export const createGmbProfile = async (payload) => {
  const res = await axiosInstance.post('/gmb-profiles', payload);
  return res.data;
};

export const updateGmbProfile = async (id, payload) => {
  const res = await axiosInstance.patch(`/gmb-profiles/${id}`, payload);
  return res.data;
};

export const deleteGmbProfile = async (id) => {
  const res = await axiosInstance.delete(`/gmb-profiles/${id}`);
  return res.data;
};

export const searchGmbProfileUsers = async (search = '') => {
  const res = await axiosInstance.get('/gmb-profiles/admin/users', {
    params: search ? { search } : {},
  });
  return res.data;
};
