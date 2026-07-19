// ============================================
// BIT SOFTWARE — Domain API
// ============================================
// Calls our backend proxy which forwards to Namecheap API.
// API Key never exposed to the browser.

import axiosInstance from './axiosInstance';

/**
 * Check domain availability via Namecheap API (server-side proxy).
 * @param {string} domainName - e.g. "example.com" or "example"
 * @returns {{ query, primaryResult, suggestions }}
 */
export const checkDomainAvailability = async (domainName) => {
  const response = await axiosInstance.post('/domain/check', { domainName });
  return response.data;
};
