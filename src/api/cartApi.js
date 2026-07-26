// ============================================
// BIT SOFTWARE — Cart Checkout API
// ============================================

import axiosInstance from './axiosInstance';

/**
 * Map Redux cart items → backend checkout payload items.
 */
export const toCheckoutItems = (cartItems = []) =>
  cartItems.map((item) => {
    if (item.type === 'domain') {
      return { type: 'domain', domainName: item.domainName };
    }
    return {
      type: 'hosting',
      planSlug: item.planSlug,
      billingCycle: item.billingCycle === 'monthly' ? 'monthly' : 'yearly',
      websiteLabel: item.websiteLabel || undefined,
      attachedDomain: item.attachedDomain || undefined,
    };
  });

export const createCartPayPalOrder = async ({
  items,
  displayCurrency,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  const res = await axiosInstance.post('/cart/create-paypal-order', {
    items: toCheckoutItems(items),
    displayCurrency,
    customerName,
    customerEmail,
    customerPhone,
  });
  return res.data;
};

export const completeCartPurchase = async (paypalOrderId) => {
  const res = await axiosInstance.post('/cart/complete-purchase', { paypalOrderId });
  return res.data;
};

export const payCartWithWallet = async ({
  items,
  displayCurrency,
  customerName,
  customerEmail,
  customerPhone,
}) => {
  const res = await axiosInstance.post('/cart/pay-with-wallet', {
    items: toCheckoutItems(items),
    displayCurrency,
    customerName,
    customerEmail,
    customerPhone,
  });
  return res.data;
};
