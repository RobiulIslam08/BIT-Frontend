// ============================================
// BIT SOFTWARE — Google Analytics (gtag.js) helper
// ============================================
// gtag.js base script index.html-e load kora hoy. Ei file SPA-r jonno
// page view, custom event o GA4 ecommerce event track korte gtag ke wrap kore.

export const GA_MEASUREMENT_ID = 'G-7M0068QN14';

function isReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

// Route change / initial load-e page view pathaay
export function trackPageView(path) {
  if (!isReady()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

// Custom event (button click, form submit, etc.) track korte
export function trackEvent(action, params = {}) {
  if (!isReady()) return;
  window.gtag('event', action, { send_to: GA_MEASUREMENT_ID, ...params });
}

// ─── GA4 Ecommerce helpers ───
// Reference: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

// Product/plan list theke ekta item select korle (Buy Now / Get Started click)
export function trackSelectItem({ item, listName } = {}) {
  if (!isReady() || !item) return;
  window.gtag('event', 'select_item', {
    send_to: GA_MEASUREMENT_ID,
    item_list_name: listName,
    items: [item],
  });
}

// Checkout shuru hole (contact info submit / checkout page load)
export function trackBeginCheckout({ currency, value, items } = {}) {
  if (!isReady()) return;
  window.gtag('event', 'begin_checkout', {
    send_to: GA_MEASUREMENT_ID,
    currency,
    value,
    items: items || [],
  });
}

// Payment info add hole (payment step-e pouchale)
export function trackAddPaymentInfo({ currency, value, paymentType, items } = {}) {
  if (!isReady()) return;
  window.gtag('event', 'add_payment_info', {
    send_to: GA_MEASUREMENT_ID,
    currency,
    value,
    payment_type: paymentType,
    items: items || [],
  });
}

// Purchase complete hole (PayPal approve / order confirm) — main conversion
export function trackPurchase({ transactionId, currency, value, items, coupon } = {}) {
  if (!isReady()) return;
  window.gtag('event', 'purchase', {
    send_to: GA_MEASUREMENT_ID,
    transaction_id: transactionId,
    currency,
    value,
    coupon,
    items: items || [],
  });
}

// Lead generate hole (contact form / quote request submit)
export function trackGenerateLead({ currency, value, ...rest } = {}) {
  if (!isReady()) return;
  window.gtag('event', 'generate_lead', {
    send_to: GA_MEASUREMENT_ID,
    currency,
    value,
    ...rest,
  });
}

// Login success
export function trackLogin(method = 'email') {
  trackEvent('login', { method });
}

// Sign up success
export function trackSignUp(method = 'email') {
  trackEvent('sign_up', { method });
}

// Search (domain availability search)
export function trackSearch(searchTerm) {
  trackEvent('search', { search_term: searchTerm });
}
