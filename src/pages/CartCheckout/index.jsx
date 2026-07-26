// ============================================
// BIT SOFTWARE — Combined Cart Checkout
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart, Shield, CheckCircle2, AlertCircle, Loader2,
  Lock, User, Mail, Phone, Wallet, Globe, Server, XCircle,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated, updateUser } from '@/features/auth/authSlice';
import {
  selectCartItems,
  selectCartTotalUSD,
  clearCart,
  cartItemKey,
} from '@/features/cart/cartSlice';
import { createCartPayPalOrder, completeCartPurchase, payCartWithWallet } from '@/api/cartApi';
import { getWalletSummary } from '@/api/walletApi';
import { getMyProfile } from '@/api/userApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';
import { trackBeginCheckout, trackPurchase, trackEvent } from '@/utils/analytics';

export default function CartCheckout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const items = useSelector(selectCartItems);
  const totalUSD = useSelector(selectCartTotalUSD);
  const { currency, formatPriceWithCode } = useCurrency();

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [step, setStep] = useState('form'); // form | payment | success
  const [payMethod, setPayMethod] = useState('paypal');
  const [walletSummary, setWalletSummary] = useState(null);
  const [lineResults, setLineResults] = useState([]);
  const [checkoutMeta, setCheckoutMeta] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to checkout.');
      navigate(`/auth/login?redirect=${encodeURIComponent('/cart-checkout')}`);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Only bounce empty carts from the form step — after success we clear the cart on purpose.
    if (isAuthenticated && items.length === 0 && step === 'form') {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, navigate, step]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getWalletSummary();
        if (!cancelled && res?.success) setWalletSummary(res.data);
      } catch { /* optional */ }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        customerName: f.customerName || user.name || '',
        customerEmail: f.customerEmail || user.email || '',
        customerPhone: f.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  const walletBalance = Number(walletSummary?.totalBalance ?? 0);
  const canAffordWallet = walletBalance + 0.001 >= totalUSD;

  const validateForm = () => {
    const errors = {};
    if (!form.customerName.trim()) errors.customerName = 'Full name is required.';
    if (!form.customerEmail.trim()) errors.customerEmail = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) errors.customerEmail = 'Invalid email address.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const gaItems = items.map((item) => ({
    item_id: item.type === 'domain' ? item.domainName : item.planSlug,
    item_name: item.label || item.domainName || item.planName,
    item_category: item.type === 'domain' ? 'domain_registration' : 'hosting',
    item_variant: item.type === 'domain' ? undefined : item.billingCycle,
    price: item.priceUSD || 0,
    quantity: 1,
  }));

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!validateForm() || !items.length) return;
    setIsCreatingOrder(true);
    setOrderError('');
    try {
      const res = await createCartPayPalOrder({
        items,
        displayCurrency: currency,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
      });
      if (res.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setCheckoutMeta(res.data);
        setStep('payment');
        trackBeginCheckout({ currency: 'USD', value: totalUSD, items: gaItems });
      } else {
        setOrderError(res.message || 'Failed to create order.');
      }
    } catch (err) {
      setOrderError(err?.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleWalletPay = async (e) => {
    e.preventDefault();
    if (!validateForm() || !items.length) return;
    if (!canAffordWallet) {
      toast.warning('Insufficient wallet balance.');
      return;
    }
    setIsCompleting(true);
    setOrderError('');
    try {
      const res = await payCartWithWallet({
        items,
        displayCurrency: currency,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
      });
      if (res.success) {
        setLineResults(res.data?.lineResults || []);
        setCheckoutMeta(res.data);
        setStep('success');
        dispatch(clearCart());
        toast.success('Cart checkout completed.');
        try {
          const profile = await getMyProfile();
          if (profile?.success && profile.data) dispatch(updateUser(profile.data));
        } catch { /* non-blocking */ }
        trackPurchase({
          transactionId: res.data?.cartCheckoutId || `cart-${Date.now()}`,
          currency: 'USD',
          value: totalUSD,
          items: gaItems,
        });
      } else {
        setOrderError(res.message || 'Wallet payment failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Wallet payment failed.';
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  };

  const onPayPalApprove = useCallback(async (data) => {
    setIsCompleting(true);
    setOrderError('');
    try {
      const res = await completeCartPurchase(data.orderID);
      if (res.success) {
        setLineResults(res.data?.lineResults || []);
        setCheckoutMeta(res.data);
        setStep('success');
        dispatch(clearCart());
        toast.success('Payment successful.');
        const purchasedValue = (res.data?.lineResults || [])
          .filter((l) => l.status === 'active')
          .reduce((s, l) => s + (Number(l.sellPriceUSD) || 0), 0);
        trackPurchase({
          transactionId: res.data?.cartCheckoutId || data.orderID,
          currency: 'USD',
          value: purchasedValue || res.data?.sellPriceUSD || 0,
          items: (res.data?.lineResults || []).map((l) => ({
            item_id: l.orderId || l.label,
            item_name: l.label,
            item_category: l.type === 'domain' ? 'domain_registration' : 'hosting',
            price: l.sellPriceUSD,
            quantity: 1,
          })),
        });
      } else {
        setOrderError(res.message || 'Purchase failed. Please contact support.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Purchase failed. If charged, refunds are issued for failed items automatically.';
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  }, [dispatch]);

  if (!isAuthenticated) return null;
  if (items.length === 0 && step !== 'success') return null;

  return (
    <PayPalScriptProvider options={{
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb',
      currency: 'USD',
      intent: 'capture',
    }}>
      <SEOHead title="Cart Checkout" description="Pay for domain and hosting in one checkout." />

      <div className="checkout-container" style={{ minHeight: '70vh', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <ShoppingCart size={20} style={{ color: 'var(--color-primary)' }} />
              <h1 className="h4" style={{ margin: 0 }}>Cart Checkout</h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              One secure payment for all items
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step !== 'success' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="checkout-card"
                style={{
                  marginBottom: '1rem',
                  padding: '1rem 1.1rem',
                  borderRadius: 14,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  {items.map((item) => (
                    <div key={cartItemKey(item)} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'var(--color-primary-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {item.type === 'domain'
                          ? <Globe size={15} style={{ color: 'var(--color-primary)' }} />
                          : <Server size={15} style={{ color: 'var(--color-primary)' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>
                          {item.label || item.domainName || item.planName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {item.type === 'domain' ? 'Domain · 1 year' : `Hosting · ${item.billingCycle}`}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                        {formatPriceWithCode(item.priceUSD || 0)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                    {formatPriceWithCode(totalUSD)}
                  </span>
                </div>
                <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    { icon: Shield, text: 'Secure PayPal / Wallet payment', color: '#8b5cf6' },
                    { icon: Lock, text: 'Live server pricing at checkout', color: '#3b82f6' },
                    { icon: CheckCircle2, text: 'Failed lines auto-refunded', color: '#22c55e' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      <Icon size={13} style={{ color, flexShrink: 0 }} /> {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {orderError && (
            <div style={{
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
              padding: '0.75rem 0.9rem', borderRadius: 12, marginBottom: '1rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#dc2626', fontSize: 'var(--text-sm)',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{orderError}</span>
            </div>
          )}

          {step === 'form' && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={payMethod === 'wallet' ? handleWalletPay : handleProceedToPayment}
              style={{
                padding: '1.15rem',
                borderRadius: 14,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card, #fff)',
              }}
            >
              <div className="pay-method-chooser" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  Payment method
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`pay-method-btn ${payMethod === 'paypal' ? 'is-active' : ''}`}
                    onClick={() => setPayMethod('paypal')}
                    style={{
                      minHeight: 44, borderRadius: 10, border: payMethod === 'paypal' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: payMethod === 'paypal' ? 'var(--color-primary-muted)' : 'var(--color-bg-secondary)',
                      fontWeight: 700, fontSize: 'var(--text-xs)', cursor: 'pointer',
                      color: payMethod === 'paypal' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    className={`pay-method-btn ${payMethod === 'wallet' ? 'is-active' : ''}`}
                    onClick={() => setPayMethod('wallet')}
                    style={{
                      minHeight: 44, borderRadius: 10, border: payMethod === 'wallet' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: payMethod === 'wallet' ? 'var(--color-primary-muted)' : 'var(--color-bg-secondary)',
                      fontWeight: 700, fontSize: 'var(--text-xs)', cursor: 'pointer',
                      color: payMethod === 'wallet' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Wallet size={14} /> Wallet
                  </button>
                </div>
                {payMethod === 'wallet' && (
                  <p style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: canAffordWallet ? 'var(--color-text-muted)' : '#d97706' }}>
                    Balance: <strong>{formatPriceWithCode(walletBalance)}</strong>
                    {!canAffordWallet && ' — insufficient for this cart.'}
                  </p>
                )}
              </div>

              {[
                { key: 'customerName', label: 'Full name', icon: User, type: 'text' },
                { key: 'customerEmail', label: 'Email', icon: Mail, type: 'email' },
                { key: 'customerPhone', label: 'Phone (optional)', icon: Phone, type: 'tel' },
              ].map(({ key, label, icon: Icon, type }) => (
                <label key={key} style={{ display: 'block', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{label}</span>
                  <div style={{ position: 'relative', marginTop: 4 }}>
                    <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.1rem', borderRadius: 10,
                        border: formErrors[key] ? '1px solid #ef4444' : '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    />
                  </div>
                  {formErrors[key] && (
                    <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>{formErrors[key]}</span>
                  )}
                </label>
              ))}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.35rem' }}
                disabled={isCreatingOrder || isCompleting || (payMethod === 'wallet' && !canAffordWallet)}
              >
                {(isCreatingOrder || isCompleting)
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                  : payMethod === 'wallet'
                    ? <>Pay with Wallet · {formatPriceWithCode(totalUSD)}</>
                    : <>Continue to PayPal · {formatPriceWithCode(totalUSD)}</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <Link to="/cart" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>← Back to cart</Link>
              </div>
            </motion.form>
          )}

          {step === 'payment' && paypalOrderId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1.15rem',
                borderRadius: 14,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card, #fff)',
              }}
            >
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Complete payment with PayPal to activate all cart items.
              </p>
              {isCompleting ? (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                  <p style={{ marginTop: '0.75rem', fontSize: 'var(--text-sm)' }}>Confirming payment & fulfilling orders…</p>
                </div>
              ) : (
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                  forceReRender={[paypalOrderId]}
                  createOrder={() => paypalOrderId}
                  onApprove={onPayPalApprove}
                  onError={() => {
                    setOrderError('PayPal encountered an error. Please try again.');
                    trackEvent('payment_error', { item_category: 'cart' });
                  }}
                  onCancel={() => {
                    toast.info('Payment cancelled.');
                    setStep('form');
                    setPaypalOrderId(null);
                    trackEvent('payment_cancelled', { item_category: 'cart', value: totalUSD, currency: 'USD' });
                  }}
                />
              )}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                onClick={() => { setStep('form'); setPaypalOrderId(null); }}
              >
                Back
              </button>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '1.5rem 1.25rem',
                borderRadius: 16,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card, #fff)',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={40} style={{ color: '#22c55e', marginBottom: '0.65rem' }} />
              <h2 className="h4" style={{ marginBottom: '0.35rem' }}>Checkout complete</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Order {checkoutMeta?.cartCheckoutId || ''} processed.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', textAlign: 'left', marginBottom: '1.25rem' }}>
                {(lineResults.length ? lineResults : []).map((line) => (
                  <div
                    key={`${line.type}-${line.orderId || line.label}`}
                    style={{
                      display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                      padding: '0.65rem 0.75rem', borderRadius: 10,
                      background: line.status === 'active' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${line.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {line.status === 'active'
                      ? <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
                      : <XCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />}
                    <div>
                      <div style={{ fontWeight: 700 }}>{line.label}</div>
                      <div style={{ color: 'var(--color-text-muted)' }}>
                        {line.status === 'active'
                          ? `Active · $${Number(line.sellPriceUSD || 0).toFixed(2)}`
                          : `Failed${line.refundedUSD ? ` · refunded $${Number(line.refundedUSD).toFixed(2)}` : ''}${line.failureReason ? ` — ${line.failureReason}` : ''}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/my-account" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  Go to My Account
                </Link>
                <Link to="/services/domain-hosting" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                  Continue shopping
                </Link>
              </div>
            </motion.div>
          )}

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .checkout-container { box-sizing: border-box; }
          `}</style>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
