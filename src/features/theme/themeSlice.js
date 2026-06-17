// ============================================
// BIT SOFTWARE — THEME SLICE
// ============================================

import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bit-theme');
    if (saved) return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

const initialTheme = getInitialTheme();

// Apply on load
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
    primaryColor: '#00FFFF',
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('bit-theme', state.mode);
      document.documentElement.setAttribute('data-theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('bit-theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    updatePrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      document.documentElement.style.setProperty('--color-primary', action.payload);
    },
  },
});

export const { toggleTheme, setTheme, updatePrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;
