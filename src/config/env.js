// ============================================
// BIT SOFTWARE — ENVIRONMENT CONFIG
// ============================================
// Express.js backend: port 5000
// MongoDB থেকে আসা image URL build করতে API_BASE_URL ব্যবহার করুন।

export const ENV = {
  // Express.js backend base URL (without /api suffix)
  API_BASE_URL: import.meta.env.VITE_API_URL?.replace('/api/v1', '')?.replace('/api', '') || 'http://localhost:5000',
  // Full API URL (with /api suffix) — axiosInstance এটা ব্যবহার করে
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  FB_APP_ID: import.meta.env.VITE_FB_APP_ID || '',
  GA_ID: import.meta.env.VITE_GA_ID || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

/**
 * MongoDB থেকে আসা relative image path-কে full URL-এ রূপান্তর করে।
 * e.g. '/uploads/services/img.jpg' → 'http://localhost:5000/uploads/services/img.jpg'
 */
export function getImageUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${ENV.API_BASE_URL}${relativePath}`;
}

