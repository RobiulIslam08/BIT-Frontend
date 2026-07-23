// ============================================
// BIT SOFTWARE — Wallet API
// ============================================
// Account Balance (withdrawable) + Promotional Credit (gift) wallet.
// All balances are in USD; display conversion happens via CurrencyContext.

import axiosInstance from './axiosInstance';

// ─── Customer ───

/** Get wallet balances + settings (fee %, min top-up). */
export const getWalletSummary = async () => {
  const res = await axiosInstance.get('/wallet/summary');
  return res.data;
};

/** Get paginated wallet transaction history. */
export const getWalletTransactions = async (params = {}) => {
  const res = await axiosInstance.get('/wallet/transactions', { params });
  return res.data;
};

/** Step 1: create a PayPal order for a top-up. Returns fee/net breakdown. */
export const createTopupOrder = async (amountUSD) => {
  const res = await axiosInstance.post('/wallet/topup/create-paypal-order', { amountUSD });
  return res.data;
};

/** Step 2: capture the PayPal payment and credit the wallet. */
export const completeTopup = async (paypalOrderId) => {
  const res = await axiosInstance.post('/wallet/topup/complete', { paypalOrderId });
  return res.data;
};

/** Request a withdrawal of (whole USD) account balance. */
export const createWithdrawal = async ({ amountUSD, method, details }) => {
  const res = await axiosInstance.post('/wallet/withdrawals', { amountUSD, method, details });
  return res.data;
};

/** List the current user's withdrawal requests. */
export const getMyWithdrawals = async (params = {}) => {
  const res = await axiosInstance.get('/wallet/withdrawals', { params });
  return res.data;
};

// ─── Admin ───

export const getWalletSettings = async () => {
  const res = await axiosInstance.get('/wallet/settings');
  return res.data;
};

export const updateWalletSettings = async (data) => {
  const res = await axiosInstance.patch('/wallet/settings', data);
  return res.data;
};

/** Grant promotional credit to one user, several users, or all users. */
export const grantCredit = async ({ target, userId, userIds, amountUSD, note }) => {
  const res = await axiosInstance.post('/wallet/admin/grant-credit', {
    target, userId, userIds, amountUSD, note,
  });
  return res.data;
};

export const adjustBalance = async ({ userId, accountDelta, promoDelta, note }) => {
  const res = await axiosInstance.post('/wallet/admin/adjust', {
    userId, accountDelta, promoDelta, note,
  });
  return res.data;
};

export const listWithdrawals = async (params = {}) => {
  const res = await axiosInstance.get('/wallet/admin/withdrawals', { params });
  return res.data;
};

export const processWithdrawal = async (id, { action, payoutRef, adminNote }) => {
  const res = await axiosInstance.patch(`/wallet/admin/withdrawals/${id}`, {
    action, payoutRef, adminNote,
  });
  return res.data;
};

export const getUserWalletTransactions = async (userId, params = {}) => {
  const res = await axiosInstance.get(`/wallet/admin/users/${userId}/transactions`, { params });
  return res.data;
};

export const walletApi = {
  getWalletSummary,
  getWalletTransactions,
  createTopupOrder,
  completeTopup,
  createWithdrawal,
  getMyWithdrawals,
  getWalletSettings,
  updateWalletSettings,
  grantCredit,
  adjustBalance,
  listWithdrawals,
  processWithdrawal,
  getUserWalletTransactions,
};
