// ============================================
// BIT SOFTWARE — Hosting Checkout Page
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server, Shield, CheckCircle2, AlertCircle, Loader2,
  Lock, ChevronRight, User, Mail, Phone, RefreshCw, Globe,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { createHostingPayPalOrder, completeHostingPurchase } from '@/api/hostingOrderApi';
import { getPublicHostingPlans } from '@/api/hostingPlanApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';

export default function HostingCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const { currency, formatPriceWithCode } = useCurrency();

  const planSlug = (searchParams.get('plan') || '').toLowerCase();
  const billingParam = searchParams.get('billing') === 'monthly' ? 'monthly' : 'yearly';

  const [billingCycle, setBillingCycle] = useState(billingParam);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState('');

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    websiteLabel: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [step, setStep] = useState('form'); // form | payment | success

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to purchase hosting.');
      const redirect = encodeURIComponent(`/hosting-checkout?plan=${planSlug}&billing=${billingCycle}`);
      navigate(`/auth/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, navigate, planSlug, billingCycle]);

  useEffect(() => {
    if (!planSlug) {
      navigate('/services/domain-hosting');
      return;
    }
    let cancelled = false;
    (async () => {
      setPlanLoading(true);
      setPlanError('');
      try {
        const res = await getPublicHostingPlans();
        const list = res?.data || [];
        const match = list.find((p) => p.slug === planSlug);
        if (!cancelled) {
          if (!match) {
            setPlanError('Selected hosting plan was not found.');
            setPlan(null);
          } else {
            setPlan(match);
          }
        }
      } catch {
        if (!cancelled) setPlanError('Failed to load hosting plan.');
      } finally {
        if (!cancelled) setPlanLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [planSlug, navigate]);

  const priceUSD = plan
    ? (billingCycle === 'monthly' ? plan.monthlyPriceUSD : plan.yearlyPriceUSD)
    : 0;
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
    if (!validateForm() || !plan) return;
    setIsCreatingOrder(true);
    setOrderError('');
    try {
      const res = await createHostingPayPalOrder({
        planSlug: plan.slug,
        billingCycle,
        displayCurrency: currency,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        websiteLabel: form.websiteLabel.trim() || undefined,
      });
      if (res.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setStep('payment');
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
      const res = await completeHostingPurchase(data.orderID);
      if (res.success) {
        setStep('success');
        toast.success(`Hosting "${plan?.name}" activated successfully!`);
      } else {
        setOrderError(res.message || 'Purchase failed. Please contact support.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Purchase failed. If payment was charged, contact support.';
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setIsCompleting(false);
    }
  }, [plan?.name]);

  const onPayPalError = useCallback(() => {
    setOrderError('PayPal encountered an error. Please try again.');
  }, []);

  const onPayPalCancel = useCallback(() => {
    toast.info('Payment cancelled.');
    setStep('form');
    setPaypalOrderId(null);
  }, []);

  if (!planSlug) return null;

  return (
    <PayPalScriptProvider options={{
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb',
      currency: 'USD',
      intent: 'capture',
    }}>
      <SEOHead
        title={plan ? `Checkout — ${plan.name} Hosting` : 'Hosting Checkout'}
        description="Purchase web hosting securely with PayPal."
      />

      <div className="checkout-container">
        <div style={{ width: '100%', maxWidth: '540px' }}>
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <Server size={20} style={{ color: 'var(--color-primary)' }} />
              <h1 className="h4" style={{ margin: 0, fontSize: 'clamp(1.2rem, 5vw, 1.5rem)' }}>Hosting Checkout</h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              Secure payment powered by PayPal
            </p>
          </motion.div>

          {planLoading ? (
            <div className="checkout-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <Loader2 size={28} className="spin" style={{ color: 'var(--color-primary)' }} />
              <p style={{ marginTop: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Loading plan...</p>
            </div>
          ) : planError || !plan ? (
            <div className="checkout-card" style={{ textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
              <p style={{ marginBottom: '1rem' }}>{planError || 'Plan not found.'}</p>
              <Link to="/services/domain-hosting" className="btn btn-primary btn-sm">Browse Plans</Link>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-card">
                <div className="summary-header">
                  <div className="summary-left">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Server size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="domain-display-name">{plan.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {plan.planType} Hosting
                      </div>
                    </div>
                  </div>
                  <div className="summary-right">
                    <div className="price-display-val">{displayPrice}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      per {billingCycle === 'monthly' ? 'month' : 'year'} · {currency}
                    </div>
                  </div>
                </div>

                {step === 'form' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                    {['yearly', 'monthly'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBillingCycle(c)}
                        className={`btn btn-sm ${billingCycle === c ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(plan.features || []).slice(0, 4).map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    <Lock size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} /> Secure & Encrypted Payment
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {orderError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 'var(--text-xs)', marginBottom: '1rem', marginTop: '1rem' }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{orderError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {step === 'form' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-card" style={{ marginTop: orderError ? 0 : '1rem' }}>
                  <h3 className="h5" style={{ marginBottom: '1rem', fontSize: 'clamp(0.95rem, 4vw, 1.1rem)' }}>Contact Information</h3>
                  <form onSubmit={handleProceedToPayment}>
                    <div className="form-group-row">
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                          <User size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Full Name *
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={form.customerName}
                          onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                          placeholder="Your full name"
                          style={{ border: formErrors.customerName ? '1.5px solid #ef4444' : undefined, padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                        />
                        {formErrors.customerName && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>{formErrors.customerName}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                          <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Email Address *
                        </label>
                        <input
                          type="email"
                          className="input"
                          value={form.customerEmail}
                          onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                          placeholder="your@email.com"
                          style={{ border: formErrors.customerEmail ? '1.5px solid #ef4444' : undefined, padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                        />
                        {formErrors.customerEmail && <p style={{ color: '#ef4444', fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>{formErrors.customerEmail}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Phone (optional)
                        </label>
                        <input
                          type="tel"
                          className="input"
                          value={form.customerPhone}
                          onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                          placeholder="+966 5XX XXX XXXX"
                          style={{ padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                          <Globe size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />Website / Project (optional)
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={form.websiteLabel}
                          onChange={(e) => setForm((f) => ({ ...f, websiteLabel: e.target.value }))}
                          placeholder="example.com"
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
                          <><Loader2 size={16} className="spin" /> Creating Order...</>
                        ) : (
                          <>Continue to Payment <ChevronRight size={16} /></>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="checkout-card" style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 className="h5" style={{ margin: 0, fontSize: 'clamp(0.95rem, 4vw, 1.1rem)' }}>Complete Payment</h3>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0.6rem', fontSize: 'var(--text-xs)' }} onClick={() => { setStep('form'); setPaypalOrderId(null); }}>
                      <RefreshCw size={12} /> Back
                    </button>
                  </div>

                  <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', marginBottom: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{plan.name} ({billingCycle})</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{displayPrice}</strong>
                    </div>
                  </div>

                  {isCompleting ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <Loader2 size={28} className="spin" style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
                      <p style={{ marginTop: '0.875rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', lineHeight: '1.5' }}>
                        Activating your hosting...<br />Please don&apos;t close this page.
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

              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="checkout-card" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem 1.25rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 className="h5" style={{ marginBottom: '0.5rem' }}>Hosting Activated!</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
                    Your <strong>{plan.name}</strong> plan is now active. Manage it anytime from My Account.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/my-account?tab=hosting" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                      <Shield size={16} /> Go to My Hosting
                    </Link>
                    <Link to="/services/domain-hosting" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                      Back to Plans
                    </Link>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
