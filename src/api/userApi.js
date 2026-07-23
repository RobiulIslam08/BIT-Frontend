// ============================================
// BIT SOFTWARE — User Profile API
// ============================================
// Backend: /api/v1/users/* endpoints (authenticated)

import axiosInstance from './axiosInstance';

/** Get the logged-in user's full profile. */
export const getMyProfile = async () => {
  const res = await axiosInstance.get('/users/me');
  return res.data;
};

/** Update the logged-in user's profile (Namecheap-style fields). */
export const updateProfile = async (data) => {
  const res = await axiosInstance.patch('/users/me', data);
  return res.data;
};

export const userApi = {
  getMyProfile,
  updateProfile,
};
