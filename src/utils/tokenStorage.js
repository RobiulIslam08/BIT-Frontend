// ============================================
// BIT SOFTWARE — JWT TOKEN STORAGE HELPER
// ============================================
// MongoDB backend থেকে পাওয়া JWT token
// localStorage-এ store/retrieve করার utility

const TOKEN_KEY = 'bit_access_token';
const REFRESH_KEY = 'bit_refresh_token';
const USER_KEY = 'bit_user';

export const tokenStorage = {
  // Access Token
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  // Refresh Token
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_KEY),

  // User data (MongoDB document)
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  // সব clear করে logout
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
