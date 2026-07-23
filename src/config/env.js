// ============================================
// BIT SOFTWARE — ENVIRONMENT CONFIG
// ============================================
// Express.js backend: port 5000
// MongoDB থেকে আসা image URL build করতে API_BASE_URL ব্যবহার করুন।

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/** Strip only a trailing /api or /api/v1 — never touch hostname (e.g. api.example.com). */
const stripTrailingApiPath = (url) =>
  String(url || '')
    .replace(/\/api\/v1\/?$/i, '')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

export const ENV = {
  // Express.js backend base URL (without /api suffix)
  API_BASE_URL: stripTrailingApiPath(rawApiUrl) || 'http://localhost:5000',
  // Full API URL (with /api suffix) — axiosInstance এটা ব্যবহার করে
  API_URL: rawApiUrl,
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  FB_APP_ID: import.meta.env.VITE_FB_APP_ID || '',
  GA_ID: import.meta.env.VITE_GA_ID || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

/**
 * Turn a backend path (e.g. /api/v1/hostings/cpanel-sso?token=…) into an absolute URL.
 * Safe with api.* hostnames and relative VITE_API_URL values like /api/v1.
 */
export function toAbsoluteApiUrl(pathOrUrl) {
  if (!pathOrUrl) return pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  const apiUrl = ENV.API_URL || '';

  if (/^https?:\/\//i.test(apiUrl)) {
    try {
      const origin = new URL(apiUrl).origin;
      return `${origin}${path}`;
    } catch {
      /* fall through */
    }
  }

  // Relative API base (e.g. /api/v1) — same origin as the SPA
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }

  const base = (ENV.API_BASE_URL || '').replace(/\/$/, '');
  if (/^https?:\/\//i.test(base)) return `${base}${path}`;
  return path;
}

/**
 * MongoDB থেকে আসা relative image path-কে full URL-এ রূপান্তর করে।
 * e.g. '/uploads/services/img.jpg' → 'http://localhost:5000/uploads/services/img.jpg'
 */
export function getImageUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${ENV.API_BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

