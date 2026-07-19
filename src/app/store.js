// ============================================
// BIT SOFTWARE — REDUX STORE
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import currencyReducer from '../features/currency/currencySlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    ui: uiReducer,
    currency: currencyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});
