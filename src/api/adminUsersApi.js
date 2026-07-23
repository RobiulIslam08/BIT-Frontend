// ============================================
// BIT SOFTWARE — Admin User Management API
// ============================================
// Backend: /api/v1/users/* admin endpoints (admin auth required).

import axiosInstance from './axiosInstance';

/** List users — supports { search, role, status, page, limit }. Returns { data, meta }. */
export const getAllUsers = async (params = {}) => {
  const res = await axiosInstance.get('/users', { params });
  return res.data;
};

/** Get a single user's full profile by id. */
export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
};

/** Update a user's role ('user' | 'admin'). */
export const updateUserRole = async (id, role) => {
  const res = await axiosInstance.patch(`/users/${id}/role`, { role });
  return res.data;
};

/** Update a user's status ('active' | 'blocked'). */
export const updateUserStatus = async (id, status) => {
  const res = await axiosInstance.patch(`/users/${id}/status`, { status });
  return res.data;
};

/** Soft-delete a user. */
export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};

export const adminUsersApi = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
