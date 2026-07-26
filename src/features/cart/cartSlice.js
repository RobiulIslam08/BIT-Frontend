// ============================================
// BIT SOFTWARE — Shopping Cart (client-side)
// ============================================
// Persisted in localStorage. Server prices are revalidated at checkout.

import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'bit_cart_v1';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[Cart] localStorage write blocked:', e);
  }
};

/** Stable key for dedupe */
export const cartItemKey = (item) => {
  if (item.type === 'domain') return `domain:${String(item.domainName || '').toLowerCase()}`;
  if (item.type === 'hosting') {
    return `hosting:${String(item.planSlug || '').toLowerCase()}:${item.billingCycle || 'yearly'}`;
  }
  return `unknown:${Math.random()}`;
};

const initialState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      if (!item?.type) return;
      const key = cartItemKey(item);
      const exists = state.items.some((i) => cartItemKey(i) === key);
      if (exists) return;
      const next = {
        ...item,
        key,
        addedAt: Date.now(),
      };
      if (next.type === 'domain') {
        next.domainName = String(next.domainName || '').toLowerCase();
      }
      if (next.type === 'hosting') {
        next.planSlug = String(next.planSlug || '').toLowerCase();
        next.billingCycle = next.billingCycle === 'monthly' ? 'monthly' : 'yearly';
      }
      state.items.push(next);
      persist(state.items);
    },
    updateCartItem: (state, action) => {
      const { key, patch } = action.payload || {};
      if (!key || !patch) return;
      const idx = state.items.findIndex((i) => cartItemKey(i) === key || i.key === key);
      if (idx < 0) return;
      state.items[idx] = { ...state.items[idx], ...patch, key: state.items[idx].key };
      persist(state.items);
    },
    removeFromCart: (state, action) => {
      const key = action.payload;
      state.items = state.items.filter((i) => cartItemKey(i) !== key && i.key !== key);
      persist(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartTotalUSD = (state) =>
  state.cart.items.reduce((sum, i) => sum + (Number(i.priceUSD) || 0), 0);

export default cartSlice.reducer;
