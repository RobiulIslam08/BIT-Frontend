// ============================================
// BIT SOFTWARE — Currency Context
// ============================================
// Bypasses Redux Toolkit caching issues to handle global currency conversions.
// Persists selection automatically in localStorage.

import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

const CurrencyContext = createContext();

const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'EUR', 'CAD', 'BDT', 'PKR', 'INR'];
const CURRENCY_SYMBOLS = { SAR: 'ر.স', USD: '$', EUR: '€', CAD: 'C$', BDT: '৳', PKR: '₨', INR: '₹' };
const CURRENCY_NAMES = { SAR: 'Saudi Riyal', USD: 'US Dollar', EUR: 'Euro', CAD: 'Canadian Dollar', BDT: 'Bangladeshi Taka', PKR: 'Pakistani Rupee', INR: 'Indian Rupee' };

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('bit_currency');
      return SUPPORTED_CURRENCIES.includes(saved) ? saved : 'SAR';
    } catch {
      return 'SAR';
    }
  });

  const [rates, setRates] = useState({
    SAR: 3.75, USD: 1, EUR: 0.92, CAD: 1.36, BDT: 110, PKR: 278, INR: 83.5
  });

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await axiosInstance.get('/domain-orders/exchange-rates');
        if (res.data?.success && res.data?.data) {
          setRates(res.data.data);
        }
      } catch (err) {
        console.warn('[CurrencyContext] Rates API failed, using fallbacks:', err);
      }
    }
    loadRates();
  }, []);

  const changeCurrency = (code) => {
    if (SUPPORTED_CURRENCIES.includes(code)) {
      setCurrencyState(code);
      try {
        localStorage.setItem('bit_currency', code);
      } catch (e) {
        console.warn('[CurrencyContext] localStorage write blocked:', e);
      }
    }
  };

  const getSymbol = () => CURRENCY_SYMBOLS[currency] || '$';

  const convertFromUSD = (usdAmount) => {
    const rate = rates[currency] ?? 1;
    return parseFloat((usdAmount * rate).toFixed(2));
  };

  const formatPrice = (usdAmount) => {
    const converted = convertFromUSD(usdAmount);
    const symbol = getSymbol();
    if (currency === 'SAR') return `${converted.toLocaleString()} ${symbol}`;
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      rates,
      changeCurrency,
      symbol: getSymbol(),
      formatPrice,
      convertFromUSD,
      SUPPORTED_CURRENCIES,
      CURRENCY_SYMBOLS,
      CURRENCY_NAMES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
