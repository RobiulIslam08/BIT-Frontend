// ============================================
// BIT SOFTWARE — Supply Company Portals Product Page
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck, Package, ClipboardList, MapPin, Shield, CheckCircle2,
  ArrowRight, X, Loader2, Wallet, Lock, AlertCircle, Sparkles,
  CalendarDays, BadgePercent,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import { selectCurrentUser, selectIsAuthenticated, updateUser } from '@/features/auth/authSlice';
import {
  createDigitalServicePayPalOrder,
  completeDigitalServicePurchase,
  payDigitalServiceWithWallet,
  getTrialEligibility,
} from '@/api/digitalServiceApi';
import { getWalletSummary } from '@/api/walletApi';
import { getMyProfile } from '@/api/userApi';
import { toast } from '@/components/common/Toast/Toast';
import { trackBeginCheckout, trackPurchase, trackEvent } from '@/utils/analytics';
import {
  DIGITAL_SERVICES,
  SUPPLY_COMPANY_SERVICE_KEY,
  sarToUsd,
} from '@/constants/digitalServices';
import './SupplyCompany.css';

const SERVICE = DIGITAL_SERVICES.supply_company_portal;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';

const FEATURES = [
  {
    icon: Package,
    title: 'Inventory Control',
    desc: 'Track stock levels, warehouses, and product movements in real time.',
  },
  {
    icon: ClipboardList,
    title: 'Order Management',
    desc: 'Create, approve, and fulfill purchase and sales orders without spreadsheets.',
  },
  {
    icon: MapPin,
    title: 'Logistics Visibility',
    desc: 'Monitor deliveries, suppliers, and shipment status from one dashboard.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Secure staff permissions so every team member sees only what they need.',
  },
];

const FAQS = [
  {
    q: 'What is included in Supply Company Portals?',
    a: 'A dedicated web portal for inventory, ordering, and logistics workflows tailored for Saudi supply businesses.',
  },
  {
    q: 'How does the trial work?',
    a: 'Pay 58 SAR once for a 1-month trial. Each account can use the trial only once. After it expires, choose Monthly or Yearly — there is no auto-charge.',
  },
  {
    q: 'How do I pay?',
    a: 'You can pay securely with PayPal or your BIT account balance. Prices are shown in SAR; PayPal settles in USD at the fixed rate of 3.75.',
  },
  {
    q: 'When do I get access?',
    a: 'Your subscription activates immediately after payment. Portal credentials and access links are provisioned by our team and appear under My Account → Services.',
  },
];

function formatSAR(n) {
  return `${Number(n).toLocaleString('en-US')} SAR`;
}

export default function SupplyCompany() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const pricingRef = useRef(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null); // monthly | yearly | trial
  const [trialAvailable, setTrialAvailable] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [payMethod, setPayMethod] = useState('paypal');
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [step, setStep] = useState('form'); // form | payment | success
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [walletSummary, setWalletSummary] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        customerName: f.customerName || user.name || '',
        customerEmail: f.customerEmail || user.email || '',
        customerPhone: f.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTrialAvailable(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [trialRes, walletRes] = await Promise.all([
          getTrialEligibility(SUPPLY_COMPANY_SERVICE_KEY),
          getWalletSummary().catch(() => null),
        ]);
        if (!cancelled) {
          if (trialRes?.success) setTrialAvailable(!!trialRes.data?.trialAvailable);
          if (walletRes?.success) setWalletSummary(walletRes.data);
        }
      } catch {
        /* non-blocking */
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCheckout = (packageType) => {
    if (packageType === 'trial' && !trialAvailable && isAuthenticated) {
      toast.warning('You have already used the trial. Please choose Monthly or Yearly.');
      return;
    }
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(
        `/services/web-development/supply-company?buy=${packageType}`,
      );
      toast.warning('Please sign in to continue.');
      navigate(`/auth/login?redirect=${redirect}`);
      return;
    }
    setSelectedPackage(packageType);
    setPaypalOrderId(null);
    setStep('form');
    setOrderError('');
    setPayMethod('paypal');
    setCheckoutOpen(true);
  };

  // Deep-link ?buy=monthly|yearly|trial after login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const buy = params.get('buy');
    if (buy && ['monthly', 'yearly', 'trial'].includes(buy) && isAuthenticated) {
      openCheckout(buy);
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const pkgDef = selectedPackage ? SERVICE.packages[selectedPackage] : null;
  const amountSAR = pkgDef?.priceSAR || 0;
  const amountUSD = sarToUsd(amountSAR);
  const walletBalance = Number(walletSummary?.totalBalance ?? 0);

  const validateForm = () => {
    const errors = {};
    if (!form.customerName.trim()) errors.customerName = 'Full name is required.';
    if (!form.customerEmail.trim()) errors.customerEmail = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) errors.customerEmail = 'Invalid email.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedPayPal = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedPackage) return;
    setIsCreatingOrder(true);
    setOrderError('');
    try {
      const res = await createDigitalServicePayPalOrder({
        serviceKey: SUPPLY_COMPANY_SERVICE_KEY,
        packageType: selectedPackage,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
      });
      if (res.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setStep('payment');
        trackBeginCheckout({
          currency: 'USD',
          value: amountUSD,
          items: [{
            item_id: `${SUPPLY_COMPANY_SERVICE_KEY}_${selectedPackage}`,
            item_name: SERVICE.name,
            item_category: 'digital_service',
            item_variant: selectedPackage,
            price: amountUSD,
            quantity: 1,
          }],
        });
      } else {
        setOrderError(res.message || 'Failed to create order.');
      }
    } catch (err) {
      setOrderError(err?.response?.data?.message || 'Failed to create order.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleWalletPay = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedPackage) return;
    setIsCompleting(true);
    setOrderError('');
    try {
      const res = await payDigitalServiceWithWallet({
        serviceKey: SUPPLY_COMPANY_SERVICE_KEY,
        packageType: selectedPackage,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
      });
      if (res.success) {
        setCompletedOrder(res.data);
        setStep('success');
        if (selectedPackage === 'trial') setTrialAvailable(false);
        toast.success(`${SERVICE.name} activated successfully!`);
        try {
          const profile = await getMyProfile();
          if (profile?.success && profile.data) dispatch(updateUser(profile.data));
          const w = await getWalletSummary();
          if (w?.success) setWalletSummary(w.data);
        } catch { /* non-blocking */ }
        trackPurchase({
          transactionId: res.data?.orderId || selectedPackage,
          currency: 'USD',
          value: amountUSD,
          items: [{
            item_id: `${SUPPLY_COMPANY_SERVICE_KEY}_${selectedPackage}`,
            item_name: SERVICE.name,
            item_category: 'digital_service',
            item_variant: selectedPackage,
            price: amountUSD,
            quantity: 1,
          }],
        });
      } else {
        setOrderError(res.message || 'Payment failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Account balance payment failed.';
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
      const res = await completeDigitalServicePurchase(data.orderID);
      if (res.success) {
        setCompletedOrder(res.data);
        setStep('success');
        if (selectedPackage === 'trial') setTrialAvailable(false);
        toast.success(`${SERVICE.name} activated successfully!`);
        trackPurchase({
          transactionId: data.orderID,
          currency: 'USD',
          value: amountUSD,
          items: [{
            item_id: `${SUPPLY_COMPANY_SERVICE_KEY}_${selectedPackage}`,
            item_name: SERVICE.name,
            item_category: 'digital_service',
            item_variant: selectedPackage,
            price: amountUSD,
            quantity: 1,
          }],
        });
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
  }, [selectedPackage, amountUSD]);

  const closeCheckout = () => {
    if (isCompleting || isCreatingOrder) return;
    setCheckoutOpen(false);
  };

  useEffect(() => {
    document.body.classList.toggle('scp-checkout-open', checkoutOpen);
    return () => document.body.classList.remove('scp-checkout-open');
  }, [checkoutOpen]);

  return (
    <div className="scp-page">
      <SEOHead
        title="Supply Company Portals"
        description="Inventory, ordering, and logistics management portals for supply companies in Saudi Arabia. Monthly, yearly, and trial packages."
      />

      {/* Hero — shared page-hero system */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <p className="page-hero__brand">BIT Software &amp; IT Solution</p>
              <span className="page-hero__product">Supply Company Portals</span>
              <h1 className="h1 page-hero__title">Inventory, Ordering &amp; Logistics in One Portal</h1>
              <p className="page-hero__desc">
                A modern web portal built for Saudi supply businesses — track stock,
                manage orders, and follow deliveries without spreadsheets.
              </p>
              <div className="page-hero__actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={scrollToPricing}>
                  View Packages <ArrowRight size={18} />
                </button>
                <button type="button" className="btn btn-outline-cyan btn-lg" onClick={() => openCheckout('trial')}>
                  Start Trial — 58 SAR
                </button>
              </div>
              <div className="page-hero__badges">
                <div className="page-hero__badge-item"><CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> PayPal &amp; Account Balance</div>
                <div className="page-hero__badge-item"><CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> 1-month trial</div>
                <div className="page-hero__badge-item"><CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> Monthly &amp; Yearly</div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features */}
      <ScrollBlurReveal className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Built for operations</span>
              <h2 className="h2 section-header__title">Everything your supply team needs</h2>
            </div>
          </FadeInUp>
          <StaggerChildren className="services-overview__grid scp-features">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="service-card scp-feature-card">
                  <div className="service-card__icon"><f.icon size={24} /></div>
                  <h3 className="service-card__title">{f.title}</h3>
                  <p className="service-card__desc">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </ScrollBlurReveal>

      {/* Pricing */}
      <ScrollBlurReveal className="section scp-pricing" id="pricing">
        <div className="container" ref={pricingRef}>
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Pricing</span>
              <h2 className="h2 section-header__title">Simple packages. Clear value.</h2>
              <p className="section-header__desc">
                Trial is 58 SAR for 1 month — once per account. No auto-renew after expiry.
              </p>
            </div>
          </FadeInUp>

          <div className="scp-pricing__grid">
            <FadeInUp delay={0.05}>
              <article className="scp-plan">
                <div className="scp-plan__badge"><CalendarDays size={14} /> Monthly</div>
                <h3 className="scp-plan__name">Monthly Access</h3>
                <div className="scp-plan__price">
                  <span className="scp-plan__amount">{formatSAR(SERVICE.packages.monthly.priceSAR)}</span>
                  <span className="scp-plan__period">/ month</span>
                </div>
                <ul className="scp-plan__features">
                  <li><CheckCircle2 size={16} /> Full portal access</li>
                  <li><CheckCircle2 size={16} /> Inventory &amp; orders</li>
                  <li><CheckCircle2 size={16} /> Logistics tools</li>
                  <li><CheckCircle2 size={16} /> Email support</li>
                </ul>
                <div className="scp-plan__actions">
                  <button type="button" className="btn btn-primary" onClick={() => openCheckout('monthly')}>
                    Buy — {formatSAR(SERVICE.packages.monthly.priceSAR)}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isAuthenticated && !trialAvailable}
                    onClick={() => openCheckout('trial')}
                  >
                    <Sparkles size={16} /> Start Trial — {formatSAR(SERVICE.packages.trial.priceSAR)}
                  </button>
                </div>
              </article>
            </FadeInUp>

            <FadeInUp delay={0.12}>
              <article className="scp-plan scp-plan--featured">
                <div className="scp-plan__ribbon"><BadgePercent size={14} /> Best value</div>
                <div className="scp-plan__badge scp-plan__badge--accent"><CalendarDays size={14} /> Yearly</div>
                <h3 className="scp-plan__name">Yearly Access</h3>
                <div className="scp-plan__price">
                  <span className="scp-plan__amount">{formatSAR(SERVICE.packages.yearly.priceSAR)}</span>
                  <span className="scp-plan__period">/ year</span>
                </div>
                <p className="scp-plan__save">
                  Save ~{formatSAR(SERVICE.packages.monthly.priceSAR * 12 - SERVICE.packages.yearly.priceSAR)} vs monthly
                </p>
                <ul className="scp-plan__features">
                  <li><CheckCircle2 size={16} /> Everything in Monthly</li>
                  <li><CheckCircle2 size={16} /> Priority provisioning</li>
                  <li><CheckCircle2 size={16} /> 365 days access</li>
                  <li><CheckCircle2 size={16} /> Best long-term rate</li>
                </ul>
                <div className="scp-plan__actions">
                  <button type="button" className="btn btn-primary" onClick={() => openCheckout('yearly')}>
                    Buy — {formatSAR(SERVICE.packages.yearly.priceSAR)}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isAuthenticated && !trialAvailable}
                    onClick={() => openCheckout('trial')}
                  >
                    <Sparkles size={16} /> Start Trial — {formatSAR(SERVICE.packages.trial.priceSAR)}
                  </button>
                </div>
              </article>
            </FadeInUp>
          </div>

          {isAuthenticated && !trialAvailable && (
            <p className="scp-pricing__trial-used">
              Trial already used on this account. Choose Monthly or Yearly to continue.
            </p>
          )}
        </div>
      </ScrollBlurReveal>

      {/* Trust */}
      <ScrollBlurReveal className="section-sm scp-trust">
        <div className="container scp-trust__row">
          <div className="scp-trust__item"><Lock size={18} /> Secure PayPal checkout</div>
          <div className="scp-trust__item"><Wallet size={18} /> Pay with Account Balance</div>
          <div className="scp-trust__item"><Truck size={18} /> Built for Saudi supply ops</div>
        </div>
      </ScrollBlurReveal>

      {/* FAQ */}
      <ScrollBlurReveal className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">FAQ</span>
              <h2 className="h2 section-header__title">Questions answered</h2>
            </div>
          </FadeInUp>
          <div className="scp-faq">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="scp-faq__item">
                <button
                  type="button"
                  className="scp-faq__q"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  aria-expanded={faqOpen === i}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    className="scp-faq__chevron"
                    animate={{ rotate: faqOpen === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div
                      className="scp-faq__a-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="scp-faq__a">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </ScrollBlurReveal>

      {/* Checkout drawer */}
      <AnimatePresence>
        {checkoutOpen && (
          <PayPalScriptProvider
            options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}
          >
            <motion.div
              className="scp-checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckout}
            />
            <motion.aside
              className="scp-checkout"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              role="dialog"
              aria-modal="true"
              aria-label="Checkout"
            >
              <div className="scp-checkout__header">
                <div>
                  <h2 className="scp-checkout__title">
                    {step === 'success' ? 'Activated' : 'Checkout'}
                  </h2>
                  <p className="scp-checkout__sub">
                    {SERVICE.name} · {pkgDef?.label}
                  </p>
                </div>
                <button type="button" className="scp-checkout__close" onClick={closeCheckout} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="scp-checkout__body">
                {step !== 'success' && (
                  <div className="scp-checkout__summary">
                    <span>{pkgDef?.label}</span>
                    <strong>{formatSAR(amountSAR)}</strong>
                    <small>≈ ${amountUSD.toFixed(2)} USD via PayPal</small>
                  </div>
                )}

                {orderError && (
                  <div className="scp-checkout__error">
                    <AlertCircle size={16} /> {orderError}
                  </div>
                )}

                {step === 'form' && (
                  <form
                    onSubmit={payMethod === 'wallet' ? handleWalletPay : handleProceedPayPal}
                    className="scp-checkout__form"
                  >
                    <label>
                      Full name
                      <input
                        className="input"
                        value={form.customerName}
                        onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                      />
                      {formErrors.customerName && <span className="scp-field-error">{formErrors.customerName}</span>}
                    </label>
                    <label>
                      Email
                      <input
                        className="input"
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      />
                      {formErrors.customerEmail && <span className="scp-field-error">{formErrors.customerEmail}</span>}
                    </label>
                    <label>
                      Phone (optional)
                      <input
                        className="input"
                        value={form.customerPhone}
                        onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      />
                    </label>

                    <div className="scp-pay-methods">
                      <button
                        type="button"
                        className={`scp-pay-method ${payMethod === 'paypal' ? 'is-active' : ''}`}
                        onClick={() => setPayMethod('paypal')}
                      >
                        PayPal
                      </button>
                      <button
                        type="button"
                        className={`scp-pay-method ${payMethod === 'wallet' ? 'is-active' : ''}`}
                        onClick={() => setPayMethod('wallet')}
                      >
                        Account Balance {walletSummary ? `($${walletBalance.toFixed(2)})` : ''}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isCreatingOrder || isCompleting}
                      style={{ width: '100%' }}
                    >
                      {(isCreatingOrder || isCompleting) && <Loader2 size={16} className="spin" />}
                      {payMethod === 'wallet'
                        ? `Pay ${formatSAR(amountSAR)} with Account Balance`
                        : 'Continue to PayPal'}
                    </button>
                  </form>
                )}

                {step === 'payment' && paypalOrderId && (
                  <div className="scp-checkout__paypal">
                    {isCompleting && (
                      <div className="scp-checkout__loading">
                        <Loader2 size={24} className="spin" /> Confirming payment…
                      </div>
                    )}
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
                      disabled={isCompleting}
                      createOrder={() => paypalOrderId}
                      onApprove={onPayPalApprove}
                      onError={() => {
                        setOrderError('PayPal encountered an error. Please try again.');
                        trackEvent('payment_error', {
                          item_name: SERVICE.name,
                          item_category: 'digital_service',
                        });
                      }}
                      onCancel={() => toast.info('Payment cancelled.')}
                    />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('form')}>
                      Back
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div className="scp-checkout__success">
                    <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
                    <h3>You&apos;re all set</h3>
                    <p>
                      {SERVICE.name} ({completedOrder?.packageLabel || pkgDef?.label}) is active.
                      Manage it anytime from My Account → Services.
                    </p>
                    <Link to="/my-account?tab=services" className="btn btn-primary">
                      Go to My Services
                    </Link>
                    <button type="button" className="btn btn-secondary" onClick={closeCheckout}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </PayPalScriptProvider>
        )}
      </AnimatePresence>
    </div>
  );
}
