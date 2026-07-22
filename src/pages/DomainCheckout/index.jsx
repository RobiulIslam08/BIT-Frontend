// ============================================
// BIT SOFTWARE — Domain Checkout Page
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Shield, CheckCircle2, AlertCircle, Loader2,
  Lock, ChevronRight, User, Mail, Phone, RefreshCw,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { createDomainPayPalOrder, completeDomainPurchase } from '@/api/domainOrderApi';
import { getPublicDomainPricing } from '@/api/domainPricingApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';
import { ENV } from '@/config/env';
import { trackBeginCheckout, trackPurchase, trackEvent } from '@/utils/analytics';

const FALLBACK_PRICE_USD = 20;

export default function DomainCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const { currency, formatPriceWithCode } = useCurrency();

  const domainParam = searchParams.get('domain') || '';
  const dotIdx = domainParam.indexOf('.');
  const sld = dotIdx > 0 ? domainParam.substring(0, dotIdx) : domainParam;
  const tld = dotIdx > 0 ? domainParam.substring(dotIdx + 1) : 'com';
  const domainName = `${sld}.${tld}`.toLowerCase();

  const [priceUSD, setPriceUSD] = useState(FALLBACK_PRICE_USD);
  const [priceLoading, setPriceLoading] = useState(true);

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
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'

  // Load live sell price from admin-maintainable pricing API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPriceLoading(true);
      try {
        const res = await getPublicDomainPricing();
        const list = res?.data || [];
        const match = list.find((p) => p.tld === tld.toLowerCase());
        if (!cancelled) {
          setPriceUSD(
            match && typeof match.registerPriceUSD === 'number'
              ? match.registerPriceUSD
              : FALLBACK_PRICE_USD,
          );
        }
      } catch {
        if (!cancelled) setPriceUSD(FALLBACK_PRICE_USD);
      } finally {
        if (!cancelled) setPriceLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tld]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to purchase a domain.');
      navigate(`/auth/login?redirect=/domain-checkout?domain=${domainParam}`);
    }
  }, [isAuthenticated, navigate, domainParam]);

  // Redirect if no domain
  useEffect(() => {
    if (!domainParam) navigate('/services/domain-hosting');
  }, [domainParam, navigate]);

  const displayPrice = formatPriceWithCode(priceUSD);

  const validateForm = () => {
    const errors = {};
    if (!form.customerName.trim()) errors.customerName = 'Full name is required.';
    if (!form.customerEmail.trim()) errors.customerEmail = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) errors.customerEmail = 'Invalid email address.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsCreatingOrder(true);
    setOrderError('');
    try {
      const res = await createDomainPayPalOrder({
        domainName,
        displayCurrency: currency,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
      });
      if (res.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setStep('payment');
        trackBeginCheckout({
          currency: 'USD',
          value: priceUSD,
          items: [{
            item_id: domainName,
            item_name: domainName,
            item_category: 'domain_registration',
            item_variant: tld,
            price: priceUSD,
            quantity: 1,
          }],
        });
      } else {
        setOrderError(res.message || 'Failed to create order. Please try again.');
      }
    } catch (err) {
      setOrderError(err?.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const onPayPalApprove = useCallback(async (data) => {
    setIsCompleting(true);
    setOrderError('');
    try {
      const res = await completeDomainPurchase(data.orderID);
      if (res.success) {
        setStep('success');
        toast.success(`Domain "${domainName}" registered successfully!`);
        trackPurchase({
          transactionId: data.orderID,
          currency: 'USD',
          value: priceUSD,
          items: [{
            item_id: domainName,
            item_name: domainName,
            item_category: 'domain_registration',
            item_variant: tld,
            price: priceUSD,
            quantity: 1,
          }],
        });
      } else {
        setOrderError(res.message || 'Purchase failed. Please contact support.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Purchase failed. If payment was charged, a refund will be issued automatically.';
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  }, [domainName, priceUSD, tld]);

  const onPayPalError = useCallback((err) => {
    console.error('PayPal error:', err);
    setOrderError('PayPal encountered an error. Please try again.');
    trackEvent('payment_error', { item_name: domainName, item_category: 'domain_registration' });
  }, [domainName]);

  const onPayPalCancel = useCallback(() => {
    toast.info('Payment cancelled. Your domain is still available.');
    setStep('form');
    setPaypalOrderId(null);
    trackEvent('payment_cancelled', { item_name: domainName, item_category: 'domain_registration', value: priceUSD, currency: 'USD' });
  }, [domainName, priceUSD]);

  if (!domainParam) return null;

  return (
    <PayPalScriptProvider options={{
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb',
      currency: 'USD',
      intent: 'capture',
    }}>
      <SEOHead
        title={`Checkout — ${domainName}`}
        description={`Purchase domain ${domainName} securely with PayPal.`}
      />

      <div className="checkout-container">
        <div style={{ width: '100%', maxWidth: '540px' }}>

          {/* ─── Header ─── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <Globe size={20} style={{ color: 'var(--color-primary)' }} />
              <h1 className="h4" style={{ margin: 0, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>Domain Checkout</h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              Secure payment powered by PayPal
            </p>
          </motion.div>

          {/* ─── Domain Summary Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="checkout-card"
          >
            <div className="summary-header">
              <div className="summary-left">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="domain-display-name">{domainName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Domain Registration • 1 Year</div>
                </div>
              </div>
              <div className="summary-right">
                <div className="price-display-val">{priceLoading ? '…' : displayPrice}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>per year · {currency}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { icon: CheckCircle2, text: 'WHOIS Privacy Protection — FREE', color: '#22c55e' },
                { icon: Shield, text: 'DNS Management — FREE', color: '#3b82f6' },
                { icon: Lock, text: 'Secure & Encrypted Payment', color: '#8b5cf6' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <Icon size={14} style={{ color, flexShrink: 0 }} /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── Error Banner ─── */}
          <AnimatePresence>
            {orderError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{orderError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── STEP: Form ─── */}
          {step === 'form' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-card">
              <h3 className="h5" style={{ marginBottom: '1rem', fontSize: 'clamp(0.95rem, 4vw, 1.1rem)' }}>Contact Information</h3>
              <form onSubmit={handleProceedToPayment}>
                <div className="form-group-row">
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                       <User size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Full Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={form.customerName}
                      onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                      placeholder="Your full name"
                      style={{ border: formErrors.customerName ? '1.5px solid #ef4444' : undefined, padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                    />
                    {formErrors.customerName && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>{formErrors.customerName}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                      <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Email Address *
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={form.customerEmail}
                      onChange={(e) => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                      placeholder="your@email.com"
                      style={{ border: formErrors.customerEmail ? '1.5px solid #ef4444' : undefined, padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                    />
                    {formErrors.customerEmail && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>{formErrors.customerEmail}</p>}
                  </div>
                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                      <Phone size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      className="input"
                      value={form.customerPhone}
                      onChange={(e) => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                      placeholder="+966 5XX XXX XXXX"
                      style={{ padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{displayPrice}</span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreatingOrder}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-sm)', padding: '0.75rem' }}
                  >
                    {isCreatingOrder ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating Order...</>
                    ) : (
                      <>Continue to Payment <ChevronRight size={16} /></>
                    )}
                  </button>

                  {/* bKash placeholder */}
                  {/* <button type="button" disabled className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '0.375rem', opacity: 0.4, cursor: 'not-allowed', fontSize: 'var(--text-xs)' }}>
                    🟢 Pay with bKash (Coming Soon)
                  </button> */}
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── STEP: PayPal Payment ─── */}
          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="h5" style={{ margin: 0, fontSize: 'clamp(0.95rem, 4vw, 1.1rem)' }}>Complete Payment</h3>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)' }} onClick={() => { setStep('form'); setPaypalOrderId(null); }}>
                  <RefreshCw size={12} /> Back
                </button>
              </div>

              <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', marginBottom: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{domainName}</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{displayPrice}</strong>
                </div>
              </div>

              {isCompleting ? (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)', margin: '0 auto' }} />
                  <p style={{ marginTop: '0.875rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                    Registering your domain...<br />
                    This may take up to 30 seconds. Please don't close this page.
                  </p>
                </div>
              ) : (
                <div style={{ minHeight: '150px' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                    createOrder={() => Promise.resolve(paypalOrderId)}
                    onApprove={onPayPalApprove}
                    onError={onPayPalError}
                    onCancel={onPayPalCancel}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ─── STEP: Success ─── */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="checkout-card"
              style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}
              >
                <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
              </motion.div>
              <h2 className="h4" style={{ marginBottom: '0.5rem', color: '#16a34a', fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>Domain Registered!</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{domainName}</strong> is now yours.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: '1.25rem' }}>
                A confirmation email has been sent to <strong>{form.customerEmail}</strong>
              </p>
              <div className="success-button-group">
                <button className="btn btn-primary" style={{ fontSize: 'var(--text-xs)', padding: '0.6rem 1rem' }} onClick={() => navigate('/my-account')}>
                  View My Domains
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)', padding: '0.6rem 1rem' }} onClick={() => navigate('/services/domain-hosting')}>
                  Search More Domains
                </button>
              </div>
            </motion.div>
          )}

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }

            .checkout-container {
              min-height: 100vh;
              background: var(--color-bg-secondary);
              padding: 1rem 0.75rem;
              display: flex;
              align-items: flex-start;
              justify-content: center;
            }
            @media (min-width: 480px) {
              .checkout-container {
                padding: 2rem 1.5rem;
              }
            }

            .checkout-card {
              background: var(--color-surface-elevated);
              border: 1px solid var(--color-border);
              border-radius: 12px;
              padding: 1rem;
              box-shadow: var(--shadow-md);
              margin-bottom: 1rem;
            }
            @media (min-width: 480px) {
              .checkout-card {
                padding: 1.5rem;
              }
            }

            .summary-header {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              margin-bottom: 0.875rem;
            }
            @media (min-width: 440px) {
              .summary-header {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
              }
            }

            .summary-left {
              display: flex;
              align-items: center;
              gap: 0.625rem;
              min-width: 0;
            }

            .summary-right {
              text-align: left;
            }
            @media (min-width: 440px) {
              .summary-right {
                text-align: right;
              }
            }

            .domain-display-name {
              font-family: var(--font-display);
              font-weight: 800;
              font-size: clamp(1rem, 4vw, 1.25rem);
              color: var(--color-text-primary);
              word-break: break-all;
              line-height: 1.2;
            }

            .price-display-val {
              font-weight: 800;
              font-size: clamp(1.2rem, 5vw, 1.5rem);
              font-family: var(--font-display);
              color: var(--color-primary);
              line-height: 1.2;
            }

            .form-group-row {
              display: flex;
              flex-direction: column;
              gap: 0.875rem;
            }

            .success-button-group {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
              width: 100%;
            }
            @media (min-width: 400px) {
              .success-button-group {
                flex-direction: row;
                justify-content: center;
                gap: 0.75rem;
              }
            }
          `}</style>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
