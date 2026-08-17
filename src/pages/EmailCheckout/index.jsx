// ============================================
// BIT SOFTWARE — Business Email Checkout
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  Mail, CheckCircle2, AlertCircle, Loader2, Lock, Wallet, Building2, Globe, User,
  ArrowLeft, ArrowRight, Shield, CreditCard,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated, updateUser } from '@/features/auth/authSlice';
import { createEmailPayPalOrder, completeEmailPurchase, payEmailWithWallet } from '@/api/emailOrderApi';
import { getPublicEmailPlans } from '@/api/emailPlanApi';
import { getWalletSummary } from '@/api/walletApi';
import { getMyProfile } from '@/api/userApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';
import { trackBeginCheckout, trackPurchase, trackEvent } from '@/utils/analytics';
import './EmailCheckout.css';

const TEAM_SIZES = ['1', '2-9', '10-49', '50-99', '100+'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const LOCAL_RE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;

const newIdemKey = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

const idemStorageKey = (planSlug, billingCycle, payMethod) =>
  `bit-email-idem:${planSlug}:${billingCycle}:${payMethod}`;

const readIdempotencyKey = (planSlug, billingCycle, payMethod) => {
  const key = idemStorageKey(planSlug, billingCycle, payMethod);
  try {
    const existing = sessionStorage.getItem(key);
    if (existing && existing.length >= 16) return existing;
    const next = newIdemKey();
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return newIdemKey();
  }
};

const clearIdempotencyKey = (planSlug, billingCycle, payMethod) => {
  try {
    sessionStorage.removeItem(idemStorageKey(planSlug, billingCycle, payMethod));
  } catch { /* ignore */ }
};

const normalizeDomain = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');

const paypalClientId = (() => {
  const envId = (import.meta.env.VITE_PAYPAL_CLIENT_ID || '').trim();
  if (!envId || envId === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE') {
    return import.meta.env.DEV ? 'sb' : '';
  }
  return envId;
})();

function PayPalCheckoutButtons({
  disabled, isBusy, setBusy, onCreate, onApprove, onCancel, onError,
}) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="be-co-loading" style={{ minHeight: 72 }}>
        <Loader2 size={20} className="spin" /> Loading PayPal…
      </div>
    );
  }
  if (isRejected) {
    return (
      <div className="be-co-alert be-co-alert--err">
        <AlertCircle size={16} /> Failed to load PayPal. Refresh and try again.
      </div>
    );
  }
  if (isBusy) {
    return (
      <div className="be-co-loading" style={{ minHeight: 88 }}>
        <Loader2 size={22} className="spin" />
        Confirming payment — do not close this page.
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
      disabled={disabled || isBusy}
      forceReRender={[disabled]}
      onClick={(_data, actions) => {
        if (disabled) return actions.reject();
        return actions.resolve();
      }}
      createOrder={onCreate}
      onApprove={async (data) => {
        setBusy(true);
        try {
          await onApprove(data.orderID);
        } finally {
          setBusy(false);
        }
      }}
      onCancel={onCancel}
      onError={onError}
    />
  );
}

export default function EmailCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const { currency, formatPriceWithCode } = useCurrency();
  const payingRef = useRef(false);
  const succeededRef = useRef(false);

  const planSlug = (searchParams.get('plan') || '').toLowerCase();
  const billingParam = searchParams.get('billing') === 'monthly' ? 'monthly' : 'yearly';

  const [billingCycle, setBillingCycle] = useState(billingParam);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    businessName: '',
    country: '',
    teamSize: '1',
    domainName: '',
    domainOwnership: 'i_have_domain',
    adminFirstName: '',
    adminLastName: '',
    desiredEmailLocalPart: 'info',
    recoveryEmail: user?.email || '',
    businessAddress: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isBusy, setIsBusy] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [step, setStep] = useState('details');
  const [payMethod, setPayMethod] = useState('paypal');
  const [walletSummary, setWalletSummary] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paidOrder, setPaidOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to purchase Business Email.');
      const redirect = encodeURIComponent(`/email-checkout?plan=${planSlug}&billing=${billingParam}`);
      navigate(`/auth/login?redirect=${redirect}`, { replace: true });
    }
  }, [isAuthenticated, navigate, planSlug, billingParam]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      customerName: f.customerName || user.name || '',
      customerEmail: f.customerEmail || user.email || '',
      customerPhone: f.customerPhone || user.phone || '',
      recoveryEmail: f.recoveryEmail || user.email || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    (async () => {
      setWalletLoading(true);
      try {
        const res = await getWalletSummary();
        if (!cancelled && res?.success) setWalletSummary(res.data);
      } catch {
        if (!cancelled) setWalletSummary(null);
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!planSlug) {
      navigate('/services/business-email');
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setPlanLoading(true);
      try {
        const res = await getPublicEmailPlans();
        const found = (res.data || []).find((p) => p.slug === planSlug);
        if (!cancelled) {
          if (!found) {
            toast.error('Plan not found.');
            navigate('/services/business-email');
          } else setPlan(found);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load plan.');
      } finally {
        if (!cancelled) setPlanLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [planSlug, navigate]);

  const priceUSD = plan
    ? (billingCycle === 'monthly' ? plan.monthlyPriceUSD : plan.yearlyPriceUSD)
    : 0;
  const walletBalance = Number(walletSummary?.totalBalance ?? walletSummary?.totalBalanceUSD ?? 0);
  const canPayWallet = walletBalance + 0.001 >= priceUSD;
  const desiredPreview = `${form.desiredEmailLocalPart || 'you'}@${form.domainName || 'your-company.com'}`;

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFormErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Full name is required';
    if (!form.customerEmail.trim()) e.customerEmail = 'Email is required';
    else if (!EMAIL_RE.test(form.customerEmail.trim())) e.customerEmail = 'Enter a valid email';
    if (!form.customerPhone.trim() || form.customerPhone.trim().length < 8) {
      e.customerPhone = 'Enter a valid phone number';
    }
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.country.trim()) e.country = 'Country is required';
    const domain = normalizeDomain(form.domainName);
    if (!domain) e.domainName = 'Domain is required (e.g. yourcompany.com)';
    else if (!DOMAIN_RE.test(domain)) e.domainName = 'Enter a valid domain (e.g. yourcompany.com)';
    if (!form.adminFirstName.trim()) e.adminFirstName = 'First name is required';
    if (!form.adminLastName.trim()) e.adminLastName = 'Last name is required';
    const local = form.desiredEmailLocalPart.trim().toLowerCase();
    if (!local) e.desiredEmailLocalPart = 'Email username is required';
    else if (!LOCAL_RE.test(local)) e.desiredEmailLocalPart = 'Use letters, numbers, dots, hyphens, or underscores';
    if (!form.recoveryEmail.trim()) e.recoveryEmail = 'Recovery email is required';
    else if (!EMAIL_RE.test(form.recoveryEmail.trim())) e.recoveryEmail = 'Enter a valid recovery email';
    setFormErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => {
        document.querySelector('.be-co-field.is-bad')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    return Object.keys(e).length === 0;
  };

  const buildPayload = (method) => ({
    planSlug,
    billingCycle,
    displayCurrency: currency,
    customerName: form.customerName.trim(),
    customerEmail: form.customerEmail.trim(),
    customerPhone: form.customerPhone.trim(),
    businessName: form.businessName.trim(),
    country: form.country.trim(),
    teamSize: form.teamSize,
    domainName: normalizeDomain(form.domainName),
    domainOwnership: form.domainOwnership,
    adminFirstName: form.adminFirstName.trim(),
    adminLastName: form.adminLastName.trim(),
    desiredEmailLocalPart: form.desiredEmailLocalPart.trim().toLowerCase(),
    recoveryEmail: form.recoveryEmail.trim().toLowerCase(),
    businessAddress: form.businessAddress.trim() || undefined,
    termsAccepted: true,
    idempotencyKey: readIdempotencyKey(planSlug, billingCycle, method),
  });

  const markPaid = useCallback((order) => {
    succeededRef.current = true;
    payingRef.current = true;
    clearIdempotencyKey(planSlug, billingCycle, 'paypal');
    clearIdempotencyKey(planSlug, billingCycle, 'wallet');
    setPaidOrder(order || {});
    setStep('success');
    trackPurchase({
      transactionId: order?.orderId || order?.paypalOrderId || order?.paypalCaptureId,
      currency: 'USD',
      value: priceUSD,
      items: [{
        item_id: plan?.slug,
        item_name: plan?.name,
        item_category: 'business_email',
        item_variant: billingCycle,
        price: priceUSD,
        quantity: 1,
      }],
    });
  }, [planSlug, billingCycle, priceUSD, plan?.slug, plan?.name]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      if (profile?.success && profile.data) dispatch(updateUser(profile.data));
    } catch { /* ignore */ }
  }, [dispatch]);

  const goToPay = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setOrderError('');
    setStep('pay');
    trackBeginCheckout({
      currency: 'USD',
      value: priceUSD,
      items: [{ item_id: plan?.slug, item_name: plan?.name, item_category: 'business_email', price: priceUSD, quantity: 1 }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWalletPay = async () => {
    if (payingRef.current || isBusy) return;
    if (!termsAccepted) {
      const msg = 'Please accept the Terms of Service and refund policy before paying.';
      setOrderError(msg);
      toast.warning(msg);
      return;
    }
    if (!canPayWallet) {
      toast.error('Insufficient account balance.');
      return;
    }
    payingRef.current = true;
    setIsBusy(true);
    setOrderError('');
    try {
      const res = await payEmailWithWallet(buildPayload('wallet'));
      if (!res.success) throw new Error(res.message || 'Account balance payment failed.');
      await refreshProfile();
      markPaid(res.data);
      toast.success('Payment received. We are preparing your mailbox.');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Payment failed.';
      setOrderError(msg);
      toast.error(msg);
      payingRef.current = false;
    } finally {
      setIsBusy(false);
    }
  };

  const onPayPalCreate = async () => {
    if (payingRef.current) throw new Error('Payment already in progress.');
    if (!termsAccepted) {
      const msg = 'Please accept the Terms of Service and refund policy before paying.';
      setOrderError(msg);
      toast.warning(msg);
      throw new Error(msg);
    }
    const res = await createEmailPayPalOrder(buildPayload('paypal'));
    if (res?.data?.alreadyPaid) {
      await refreshProfile();
      markPaid(res.data);
      toast.success('This order was already paid.');
      throw new Error('ALREADY_PAID');
    }
    const id = res?.data?.paypalOrderId;
    if (!id) throw new Error(res.message || 'Could not start PayPal checkout.');
    trackEvent('add_payment_info', {
      currency: 'USD',
      value: priceUSD,
      payment_type: 'PayPal',
      items: [{ item_id: plan?.slug, item_name: plan?.name, price: priceUSD, quantity: 1 }],
    });
    return id;
  };

  const onPayPalApprove = async (paypalOrderId) => {
    if (payingRef.current) return;
    payingRef.current = true;
    setOrderError('');
    try {
      const res = await completeEmailPurchase(paypalOrderId);
      if (!res.success) throw new Error(res.message || 'Could not confirm payment.');
      await refreshProfile();
      markPaid(res.data);
      toast.success('Payment received. We are preparing your mailbox.');
    } catch (err) {
      payingRef.current = false;
      const msg = err?.response?.data?.message || err.message || 'Payment confirmation failed. If charged, open My Account — do not pay again.';
      setOrderError(msg);
      toast.error(msg);
      throw err;
    }
  };

  const onPayPalCancel = useCallback(() => {
    toast.info('PayPal payment cancelled.');
    trackEvent('payment_cancelled', { item_name: plan?.name, item_category: 'business_email', value: priceUSD });
  }, [plan?.name, priceUSD]);

  const onPayPalError = useCallback(() => {
    if (succeededRef.current) return;
    setOrderError('PayPal encountered an error. Please try again — you will not be charged twice.');
    trackEvent('payment_error', { item_name: plan?.name, item_category: 'business_email' });
  }, [plan?.name]);

  const errFor = (key) => formErrors[key];

  const fieldClass = (key) => `be-co-field${errFor(key) ? ' is-bad' : ''}`;

  if (!isAuthenticated || planLoading) {
    return (
      <div className="be-co-loading">
        <Loader2 className="spin" size={28} />
        <span>Loading checkout…</span>
      </div>
    );
  }

  if (!plan) return null;

  const stepIndex = step === 'details' ? 1 : step === 'pay' ? 2 : 3;

  const summaryCard = (
    <aside className="be-co-card be-co-summary">
      <h2><Mail size={16} /> Order summary</h2>
      <div className="be-co-summary__plan">
        <div>
          <div className="be-co-summary__name">{plan.name}</div>
          <div className="be-co-summary__meta">Business Email · {billingCycle}</div>
        </div>
        <div className="be-co-summary__price">{formatPriceWithCode(priceUSD)}</div>
      </div>
      {step === 'details' && (
        <div className="be-co-billing">
          <button
            type="button"
            className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`btn btn-sm ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
          </button>
        </div>
      )}
      <div className="be-co-features">
        {(plan.features || []).slice(0, 4).map((f) => (
          <div key={f}><CheckCircle2 size={14} /> {f}</div>
        ))}
        <div><Lock size={14} style={{ color: '#8b5cf6' }} /> Charged in USD · encrypted checkout</div>
      </div>
    </aside>
  );

  return (
    <PayPalScriptProvider options={{
      'client-id': paypalClientId || 'sb',
      currency: 'USD',
      intent: 'capture',
      components: 'buttons',
    }}>
      <SEOHead title={`Checkout — ${plan.name} Business Email`} />
      <div className="be-co">
        <div className="be-co__wrap">
          <div className="be-co__top">
            <Link to="/services/business-email" className="be-co__back">
              <ArrowLeft size={16} /> Back to plans
            </Link>
            <h1 className="be-co__title"><Mail size={22} /> Business Email checkout</h1>
            <p className="be-co__lead">Secure payment. You will only be charged once.</p>
            <div className="be-co__steps" aria-label="Checkout steps">
              {[
                { n: 1, label: 'Details' },
                { n: 2, label: 'Pay' },
                { n: 3, label: 'Done' },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`be-co__step ${stepIndex === s.n ? 'is-on' : ''} ${stepIndex > s.n ? 'is-done' : ''}`}
                >
                  <span className="be-co__step-n">{stepIndex > s.n ? '✓' : s.n}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {step === 'success' ? (
            <div className="be-co-card be-co-success">
              <CheckCircle2 size={52} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
              <h2>Payment received</h2>
              <p>
                We are preparing <strong>{desiredPreview}</strong>. Webmail access will appear in My Account
                when setup is complete — usually shortly after payment.
              </p>
              {(paidOrder?.orderId) && (
                <div className="be-co-success__id">Order {paidOrder.orderId}</div>
              )}
              <div className="be-co-nav" style={{ justifyContent: 'center', flexDirection: 'row' }}>
                <Link className="btn btn-primary" to="/my-account?tab=email">Go to My Email</Link>
                <Link className="btn btn-ghost" to="/services/business-email">Back to plans</Link>
              </div>
            </div>
          ) : (
            <div className="be-co__grid">
              {summaryCard}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {orderError && (
                  <div className="be-co-alert be-co-alert--err" role="alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {orderError}
                  </div>
                )}

                {step === 'details' && (
                  <form className="be-co-card" onSubmit={goToPay} noValidate>
                    <h2><User size={16} /> Contact</h2>
                    <div className="be-co-fields">
                      <div className={fieldClass('customerName')}>
                        <label htmlFor="be-customerName">Full name *</label>
                        <input id="be-customerName" className="input" autoComplete="name" value={form.customerName} onChange={(e) => setField('customerName', e.target.value)} />
                        {errFor('customerName') && <small className="be-co-field__err">{errFor('customerName')}</small>}
                      </div>
                      <div className={fieldClass('customerEmail')}>
                        <label htmlFor="be-customerEmail">Email *</label>
                        <input id="be-customerEmail" className="input" type="email" autoComplete="email" value={form.customerEmail} onChange={(e) => setField('customerEmail', e.target.value)} />
                        {errFor('customerEmail') && <small className="be-co-field__err">{errFor('customerEmail')}</small>}
                      </div>
                      <div className={`${fieldClass('customerPhone')} be-co-field--full`}>
                        <label htmlFor="be-customerPhone">Phone *</label>
                        <input id="be-customerPhone" className="input" type="tel" autoComplete="tel" placeholder="+966 5XX XXX XXXX" value={form.customerPhone} onChange={(e) => setField('customerPhone', e.target.value)} />
                        {errFor('customerPhone') && <small className="be-co-field__err">{errFor('customerPhone')}</small>}
                      </div>
                    </div>

                    <h2 style={{ marginTop: '1.25rem' }}><Building2 size={16} /> Business</h2>
                    <div className="be-co-fields">
                      <div className={fieldClass('businessName')}>
                        <label htmlFor="be-businessName">Business name *</label>
                        <input id="be-businessName" className="input" value={form.businessName} onChange={(e) => setField('businessName', e.target.value)} />
                        {errFor('businessName') && <small className="be-co-field__err">{errFor('businessName')}</small>}
                      </div>
                      <div className={fieldClass('country')}>
                        <label htmlFor="be-country">Country *</label>
                        <input id="be-country" className="input" autoComplete="country-name" value={form.country} onChange={(e) => setField('country', e.target.value)} />
                        {errFor('country') && <small className="be-co-field__err">{errFor('country')}</small>}
                      </div>
                      <div className="be-co-field">
                        <label htmlFor="be-teamSize">Team size</label>
                        <select id="be-teamSize" className="input" value={form.teamSize} onChange={(e) => setField('teamSize', e.target.value)}>
                          {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="be-co-field">
                        <label htmlFor="be-address">Business address (optional)</label>
                        <input id="be-address" className="input" autoComplete="street-address" value={form.businessAddress} onChange={(e) => setField('businessAddress', e.target.value)} />
                      </div>
                    </div>

                    <h2 style={{ marginTop: '1.25rem' }}><Globe size={16} /> Domain & mailbox</h2>
                    <div className="be-co-fields">
                      <div className={fieldClass('domainName')}>
                        <label htmlFor="be-domain">Domain name *</label>
                        <input
                          id="be-domain"
                          className="input"
                          placeholder="yourcompany.com"
                          value={form.domainName}
                          onChange={(e) => setField('domainName', e.target.value)}
                          onBlur={() => setField('domainName', normalizeDomain(form.domainName))}
                        />
                        {errFor('domainName') && <small className="be-co-field__err">{errFor('domainName')}</small>}
                      </div>
                      <div className="be-co-field">
                        <label htmlFor="be-ownership">Domain status</label>
                        <select id="be-ownership" className="input" value={form.domainOwnership} onChange={(e) => setField('domainOwnership', e.target.value)}>
                          <option value="i_have_domain">I already have this domain</option>
                          <option value="need_domain_help">I need help with a domain</option>
                        </select>
                        {form.domainOwnership === 'need_domain_help' && (
                          <small className="be-co-field__hint">Enter the domain you want. We will help set it up after payment.</small>
                        )}
                      </div>
                      <div className={fieldClass('adminFirstName')}>
                        <label htmlFor="be-adminFirst">Admin first name *</label>
                        <input id="be-adminFirst" className="input" autoComplete="given-name" value={form.adminFirstName} onChange={(e) => setField('adminFirstName', e.target.value)} />
                        {errFor('adminFirstName') && <small className="be-co-field__err">{errFor('adminFirstName')}</small>}
                      </div>
                      <div className={fieldClass('adminLastName')}>
                        <label htmlFor="be-adminLast">Admin last name *</label>
                        <input id="be-adminLast" className="input" autoComplete="family-name" value={form.adminLastName} onChange={(e) => setField('adminLastName', e.target.value)} />
                        {errFor('adminLastName') && <small className="be-co-field__err">{errFor('adminLastName')}</small>}
                      </div>
                      <div className={fieldClass('desiredEmailLocalPart')}>
                        <label htmlFor="be-local">Email username *</label>
                        <input
                          id="be-local"
                          className="input"
                          value={form.desiredEmailLocalPart}
                          onChange={(e) => setField('desiredEmailLocalPart', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        />
                        {errFor('desiredEmailLocalPart') && <small className="be-co-field__err">{errFor('desiredEmailLocalPart')}</small>}
                      </div>
                      <div className={fieldClass('recoveryEmail')}>
                        <label htmlFor="be-recovery">Recovery email *</label>
                        <input id="be-recovery" className="input" type="email" value={form.recoveryEmail} onChange={(e) => setField('recoveryEmail', e.target.value)} />
                        {errFor('recoveryEmail') && <small className="be-co-field__err">{errFor('recoveryEmail')}</small>}
                      </div>
                    </div>
                    <div className="be-co-preview" aria-live="polite">
                      <Mail size={16} />
                      <strong title={desiredPreview}>{desiredPreview}</strong>
                    </div>

                    <div className="be-co-nav">
                      <Link to="/services/business-email" className="btn btn-secondary">Cancel</Link>
                      <button type="submit" className="btn btn-primary btn-lg">
                        Continue to payment <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}

                {step === 'pay' && (
                  <div className="be-co-card">
                    <h2><Shield size={16} /> Review & pay</h2>
                    <p className="be-co-field__hint" style={{ marginBottom: '0.85rem' }}>
                      Mailbox <strong>{desiredPreview}</strong> · {form.businessName} · {form.country}
                    </p>

                    <div className="be-co-pay">
                      <button
                        type="button"
                        className={`be-co-pay-card ${payMethod === 'paypal' ? 'is-on' : ''}`}
                        onClick={() => setPayMethod('paypal')}
                        disabled={isBusy}
                      >
                        <CreditCard size={18} />
                        <div>
                          <strong>Card / PayPal</strong>
                          <span>Pay {formatPriceWithCode(priceUSD)} securely (USD)</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`be-co-pay-card ${payMethod === 'wallet' ? 'is-on' : ''}`}
                        onClick={() => setPayMethod('wallet')}
                        disabled={isBusy}
                      >
                        <Wallet size={18} />
                        <div>
                          <strong>Account Balance</strong>
                          <span>
                            {walletLoading
                              ? 'Loading…'
                              : walletSummary == null
                                ? 'Could not load balance — refresh the page'
                                : <>Available {formatPriceWithCode(walletBalance)}{!canPayWallet && ' — add funds first'}</>}
                          </span>
                        </div>
                      </button>
                    </div>

                    {payMethod === 'wallet' && !canPayWallet && (
                      <div className="be-co-alert be-co-alert--warn" style={{ marginTop: '0.75rem' }}>
                        <AlertCircle size={16} />
                        <span>
                          Not enough account balance.{' '}
                          <Link to="/my-account?tab=wallet">Add funds</Link> or pay with PayPal.
                        </span>
                      </div>
                    )}

                    <label className="be-co-terms">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        disabled={isBusy}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) setOrderError('');
                        }}
                      />
                      <span>
                        I confirm these details are correct and I accept the{' '}
                        <Link to="/terms-and-conditions">Terms of Service</Link> and{' '}
                        <Link to="/privacy#refund">refund policy</Link>.
                      </span>
                    </label>

                    {!termsAccepted && (
                      <div className="be-co-alert be-co-alert--warn">
                        <AlertCircle size={15} /> Accept the terms above before paying.
                      </div>
                    )}

                    <div className="be-co-nav">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={isBusy}
                        onClick={() => { setStep('details'); setOrderError(''); }}
                      >
                        <ArrowLeft size={16} /> Edit details
                      </button>

                      {payMethod === 'wallet' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-lg"
                          disabled={isBusy || walletLoading || !canPayWallet}
                          onClick={handleWalletPay}
                        >
                          {isBusy ? <><Loader2 size={16} className="spin" /> Processing…</> : <>Pay {formatPriceWithCode(priceUSD)}</>}
                        </button>
                      ) : !paypalClientId && !import.meta.env.DEV ? (
                        <div className="be-co-alert be-co-alert--err">
                          <AlertCircle size={16} /> PayPal is not configured. Pay with account balance or try later.
                        </div>
                      ) : (
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <PayPalCheckoutButtons
                            disabled={!termsAccepted || isBusy}
                            isBusy={isBusy}
                            setBusy={setIsBusy}
                            onCreate={onPayPalCreate}
                            onApprove={onPayPalApprove}
                            onCancel={onPayPalCancel}
                            onError={onPayPalError}
                          />
                          {currency !== 'USD' && (
                            <p className="be-co-field__hint" style={{ textAlign: 'center' }}>
                              PayPal charges ${Number(priceUSD).toFixed(2)} USD
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
