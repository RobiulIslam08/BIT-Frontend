// ============================================
// BIT SOFTWARE — Currency Redux Slice
// ============================================
// Global currency state for domain price display.
// Default: SAR. Persisted in localStorage.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'EUR', 'CAD', 'BDT', 'PKR', 'INR'];
const CURRENCY_SYMBOLS = { SAR: 'SR', USD: '$', EUR: '€', CAD: 'C$', BDT: '৳', PKR: '₨', INR: '₹' };
const CURRENCY_NAMES = { SAR: 'Saudi Riyal', USD: 'US Dollar', EUR: 'Euro', CAD: 'Canadian Dollar', BDT: 'Bangladeshi Taka', PKR: 'Pakistani Rupee', INR: 'Indian Rupee' };

// ─── Fetch live exchange rates (1-hr cached on backend) ───
export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchRates',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/domain-orders/exchange-rates');
      return res.data.data;
    } catch {
      // Fallback rates if backend is unavailable
      return { SAR: 3.75, USD: 1, EUR: 0.92, CAD: 1.36, BDT: 110, PKR: 278, INR: 83.5 };
    }
  }
);

let savedCurrency = 'SAR';
try {
  savedCurrency = localStorage.getItem('bit_currency') || 'SAR';
} catch (e) {
  console.warn('[Currency] localStorage read blocked:', e);
}

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    selected: SUPPORTED_CURRENCIES.includes(savedCurrency) ? savedCurrency : 'SAR',
    rates: { SAR: 3.75, USD: 1, EUR: 0.92, CAD: 1.36, BDT: 110, PKR: 278, INR: 83.5 },
    loading: false,
  },
  reducers: {
    setCurrency: (state, action) => {
      console.log('[Currency] Action setCurrency dispatched:', action.payload);
      if (SUPPORTED_CURRENCIES.includes(action.payload)) {
        state.selected = action.payload;
        try {
          localStorage.setItem('bit_currency', action.payload);
        } catch (e) {
          console.warn('[Currency] localStorage write blocked:', e);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => { state.loading = true; })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.rates = action.payload;
        state.loading = false;
      })
      .addCase(fetchExchangeRates.rejected, (state) => { state.loading = false; });
  },
});

export const { setCurrency } = currencySlice.actions;

// ─── Selectors ───
export const selectCurrency = (state) => state?.currency?.selected || 'SAR';
export const selectRates = (state) => state?.currency?.rates || { SAR: 3.75, USD: 1, EUR: 0.92, CAD: 1.36, BDT: 110, PKR: 278, INR: 83.5 };
export const selectCurrencySymbol = (state) => CURRENCY_SYMBOLS[state?.currency?.selected || 'SAR'] || '$';

/** Convert USD amount to selected currency */
export const convertFromUSD = (usdAmount, rates, currency) => {
  const rate = rates[currency] ?? 1;
  return parseFloat((usdAmount * rate).toFixed(2));
};

/** Format amount with currency symbol */
export const formatPrice = (usdAmount, rates, currency) => {
  const converted = convertFromUSD(usdAmount, rates, currency);
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  // Right-to-left symbol for SAR
  if (currency === 'SAR') return `${converted.toLocaleString()} ${symbol}`;
  return `${symbol}${converted.toLocaleString()}`;
};

export const CURRENCY_META = { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, CURRENCY_NAMES };

export default currencySlice.reducer;
