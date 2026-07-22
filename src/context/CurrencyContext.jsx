// ============================================
// BIT SOFTWARE — Currency Context
// ============================================
// Global currency selection for the customer website.
// Prices are stored in USD (canonical). Display converts via live rates.
// GMB prices are stored in SAR — use convertFromSAR / formatFromSAR.
// Persists selection in localStorage (`bit_currency`).

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axiosInstance';

const CurrencyContext = createContext();

const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'EUR', 'CAD', 'BDT', 'PKR', 'INR'];
const CURRENCY_SYMBOLS = {
  SAR: 'SR',
  USD: '$',
  EUR: '€',
  CAD: 'C$',
  BDT: '৳',
  PKR: '₨',
  INR: '₹',
};
const CURRENCY_NAMES = {
  SAR: 'Saudi Riyal',
  USD: 'US Dollar',
  EUR: 'Euro',
  CAD: 'Canadian Dollar',
  BDT: 'Bangladeshi Taka',
  PKR: 'Pakistani Rupee',
  INR: 'Indian Rupee',
};

const FALLBACK_RATES = {
  SAR: 3.75,
  USD: 1,
  EUR: 0.92,
  CAD: 1.36,
  BDT: 110,
  PKR: 278,
  INR: 83.5,
};

function toNumber(amount) {
  const n = typeof amount === 'number' ? amount : parseFloat(amount);
  return Number.isFinite(n) ? n : 0;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('bit_currency');
      return SUPPORTED_CURRENCIES.includes(saved) ? saved : 'SAR';
    } catch {
      return 'SAR';
    }
  });

  const [rates, setRates] = useState(FALLBACK_RATES);

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await axiosInstance.get('/domain-orders/exchange-rates');
        if (res.data?.success && res.data?.data) {
          setRates({ ...FALLBACK_RATES, ...res.data.data });
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

  const value = useMemo(() => {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const rate = rates[currency] ?? 1;
    const sarRate = rates.SAR || FALLBACK_RATES.SAR;

    const convertFromUSD = (usdAmount) => {
      const usd = toNumber(usdAmount);
      return parseFloat((usd * rate).toFixed(2));
    };

    /** Convert a SAR-denominated amount into the selected display currency. */
    const convertFromSAR = (sarAmount) => {
      const sar = toNumber(sarAmount);
      const usd = sar / sarRate;
      return convertFromUSD(usd);
    };

    const formatAmount = (converted) => {
      const formatted = converted.toLocaleString(undefined, {
        minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      });
      // SAR traditionally shown as "15 SR"; others as "$15" / "৳1,650"
      if (currency === 'SAR') return `${formatted} ${symbol}`;
      return `${symbol}${formatted}`;
    };

    /** Format a USD price in the customer's selected currency. */
    const formatPrice = (usdAmount) => formatAmount(convertFromUSD(usdAmount));

    /** Format a SAR price in the customer's selected currency (GMB, etc.). */
    const formatFromSAR = (sarAmount) => formatAmount(convertFromSAR(sarAmount));

    /**
     * Format with explicit currency code — useful on checkout/payment.
     * e.g. "৳1,650 BDT" or "15 SR"
     */
    const formatPriceWithCode = (usdAmount) => {
      const base = formatPrice(usdAmount);
      if (currency === 'SAR') return base; // already includes SR
      return `${base} ${currency}`;
    };

    const formatFromSARWithCode = (sarAmount) => {
      const base = formatFromSAR(sarAmount);
      if (currency === 'SAR') return base;
      return `${base} ${currency}`;
    };

    return {
      currency,
      rates,
      changeCurrency,
      symbol,
      formatPrice,
      formatPriceWithCode,
      formatFromSAR,
      formatFromSARWithCode,
      convertFromUSD,
      convertFromSAR,
      SUPPORTED_CURRENCIES,
      CURRENCY_SYMBOLS,
      CURRENCY_NAMES,
    };
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={value}>
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
