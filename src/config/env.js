// ============================================
// BIT SOFTWARE — ENVIRONMENT CONFIG
// ============================================

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  FB_APP_ID: import.meta.env.VITE_FB_APP_ID || '',
  GA_ID: import.meta.env.VITE_GA_ID || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
