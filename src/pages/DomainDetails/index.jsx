// ============================================
// BIT SOFTWARE — Domain Details (Customer)
// ============================================
// Full details for a single owned domain: expiry, renewal fee, auto-renew
// toggle, nameservers, WHOIS, and a secure renew flow (PayPal).

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock,
  Calendar, Shield, RotateCw, Server, RefreshCw, CreditCard, Info, AlertTriangle,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getMyDomainById, toggleAutoRenew, createRenewOrder, completeRenew,
} from '@/api/domainsApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';
import { trackBeginCheckout, trackPurchase, trackEvent } from '@/utils/analytics';

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
  transferred_out: { label: 'Transferred', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: XCircle },
};

const getDaysUntilExpiry = (expiresAt) => {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—');

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.9rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>{children}</div>
      </div>
    </div>
  );
}

export default function DomainDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, formatPriceWithCode } = useCurrency();

  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingAuto, setTogglingAuto] = useState(false);

  // Renew flow
  const [renewStep, setRenewStep] = useState('idle'); // idle | payment | processing | success
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [creatingRenew, setCreatingRenew] = useState(false);
  const [renewError, setRenewError] = useState('');

  const fetchDomain = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyDomainById(id);
      if (res.success) setDomain(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load domain details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDomain(); }, [fetchDomain]);

  const handleToggleAuto = async (next) => {
    setTogglingAuto(true);
    try {
      const res = await toggleAutoRenew(id, next);
      if (res.success) {
        setDomain((d) => ({ ...d, autoRenew: next }));
        trackEvent('auto_renew_toggle', { item_name: domain?.domainName, enabled: next });
        if (res.data?.needsPaymentMethod) {
          toast.warning('Auto-renew enabled. Add a saved payment method in Billing to allow automatic charges.');
        } else {
          toast.success(`Auto-renew ${next ? 'enabled' : 'disabled'}.`);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update auto-renew.');
    } finally {
      setTogglingAuto(false);
    }
  };

  const startRenew = async () => {
    setCreatingRenew(true);
    setRenewError('');
    try {
      const res = await createRenewOrder(id, currency);
      if (res.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setRenewStep('payment');
        trackBeginCheckout({
          currency: 'USD',
          value: domain?.renewPriceUSD,
          items: [{
            item_id: domain?.domainName,
            item_name: domain?.domainName,
            item_category: 'domain_renewal',
            price: domain?.renewPriceUSD,
            quantity: 1,
          }],
        });
      } else {
        setRenewError(res.message || 'Could not start renewal. Please try again.');
      }
    } catch (err) {
      setRenewError(err?.response?.data?.message || 'Could not start renewal. Please try again.');
    } finally {
      setCreatingRenew(false);
    }
  };

  const onRenewApprove = useCallback(async (data) => {
    setRenewStep('processing');
    setRenewError('');
    try {
      const res = await completeRenew(data.orderID);
      if (res.success) {
        setRenewStep('success');
        toast.success('Domain renewed successfully!');
        trackPurchase({
          transactionId: data.orderID,
          currency: 'USD',
          value: domain?.renewPriceUSD,
          items: [{
            item_id: domain?.domainName,
            item_name: domain?.domainName,
            item_category: 'domain_renewal',
            price: domain?.renewPriceUSD,
            quantity: 1,
          }],
        });
        fetchDomain();
      } else {
        setRenewError(res.message || 'Renewal failed. Please contact support.');
        setRenewStep('payment');
      }
    } catch (err) {
      setRenewError(err?.response?.data?.message || 'Renewal failed. If you were charged, a refund will be issued automatically.');
      setRenewStep('payment');
    }
  }, [fetchDomain, domain?.domainName, domain?.renewPriceUSD]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-muted)' }}>
        <Loader2 size={34} className="spin" />
        <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading domain...</p>
        <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div style={{ maxWidth: 640, margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)' }}>
          <AlertCircle size={16} /> {error || 'Domain not found.'}
        </div>
        <Link to="/my-account" className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={14} /> Back to My Account
        </Link>
      </div>
    );
  }

  const status = statusConfig[domain.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const daysLeft = getDaysUntilExpiry(domain.expiresAt);
  const renewPrice = typeof domain.renewPriceUSD === 'number' ? domain.renewPriceUSD : null;
  const canRenew = ['active', 'expired', 'pending'].includes(domain.status);

  return (
    <PayPalScriptProvider options={{
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb',
      currency: 'USD',
      intent: 'capture',
    }}>
      <SEOHead title={`${domain.domainName} — Domain Details`} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-account')} style={{ marginBottom: '1.25rem' }}>
          <ArrowLeft size={14} /> Back to My Domains
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={26} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.3rem, 5vw, 1.9rem)', margin: 0, wordBreak: 'break-all' }}>
                {domain.domainName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: status.bg, color: status.color }}>
                  <StatusIcon size={12} /> {status.label}
                </span>
                {domain.autoRenew && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                    <RotateCw size={12} /> Auto-Renew ON
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expiry alert */}
          {daysLeft !== null && daysLeft <= 30 && (
            <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', background: daysLeft < 0 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${daysLeft < 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, color: daysLeft < 0 ? '#dc2626' : '#b45309', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              {daysLeft < 0
                ? `This domain expired ${Math.abs(daysLeft)} day(s) ago. Renew now to restore it.`
                : `This domain expires in ${daysLeft} day(s). Renew now to keep it active.`}
            </div>
          )}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: '1.25rem', alignItems: 'start' }} className="domain-details-grid">
          {/* Left: info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-elevated">
            <h3 className="h6" style={{ marginTop: 0, marginBottom: '0.5rem' }}>Domain Information</h3>
            <InfoRow icon={Calendar} label="Registered On">{formatDate(domain.registeredAt)}</InfoRow>
            <InfoRow icon={Calendar} label="Expires On">
              {formatDate(domain.expiresAt)}
              {daysLeft !== null && daysLeft >= 0 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  ({daysLeft} days left)
                </span>
              )}
            </InfoRow>
            <InfoRow icon={Shield} label="WHOIS Privacy">
              {domain.whoisPrivacy ? 'Protected' : 'Public'}
            </InfoRow>
            <InfoRow icon={Server} label="Nameservers">
              {domain.nameservers && domain.nameservers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {domain.nameservers.map((ns) => (
                    <span key={ns} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{ns}</span>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>Default (managed by us)</span>
              )}
            </InfoRow>
            <div style={{ paddingTop: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                Need DNS or nameserver changes? Contact support and our team will handle it for you.
              </div>
            </div>
          </motion.div>

          {/* Right: renewal + auto-renew */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Renewal card */}
            <div className="card-elevated">
              <h3 className="h6" style={{ marginTop: 0, marginBottom: '0.75rem' }}>Renewal</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Renewal fee</span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-primary)' }}>
                  {renewPrice !== null ? formatPriceWithCode(renewPrice) : '—'}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {renewPrice !== null ? `per year · ${currency}` : 'Contact support for pricing'}
              </div>

              <AnimatePresence>
                {renewError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-xs)', marginBottom: '0.75rem' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {renewError}
                  </motion.div>
                )}
              </AnimatePresence>

              {renewStep === 'success' ? (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <CheckCircle2 size={34} style={{ color: '#22c55e' }} />
                  <p style={{ fontWeight: 700, color: '#16a34a', marginTop: '0.5rem' }}>Renewed!</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>New expiry: {formatDate(domain.expiresAt)}</p>
                </div>
              ) : renewStep === 'processing' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <Loader2 size={26} className="spin" style={{ color: 'var(--color-primary)' }} />
                  <p style={{ marginTop: '0.6rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Processing your renewal...<br />Please don't close this page.</p>
                </div>
              ) : renewStep === 'payment' ? (
                <div>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                    createOrder={() => Promise.resolve(paypalOrderId)}
                    onApprove={onRenewApprove}
                    onError={() => setRenewError('Payment encountered an error. Please try again.')}
                    onCancel={() => { setRenewStep('idle'); setPaypalOrderId(null); toast.info('Renewal cancelled.'); }}
                  />
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => { setRenewStep('idle'); setPaypalOrderId(null); }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={startRenew}
                  disabled={creatingRenew || !canRenew || renewPrice === null}
                >
                  {creatingRenew ? <><Loader2 size={15} className="spin" /> Preparing...</> : <><RefreshCw size={15} /> Renew Now</>}
                </button>
              )}
            </div>

            {/* Auto-renew card */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 className="h6" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RotateCw size={15} style={{ color: 'var(--color-primary)' }} /> Auto-Renew
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                    Automatically renew before expiry
                  </p>
                </div>
                <label className="domains__switch" style={{ opacity: togglingAuto ? 0.6 : 1 }}>
                  <input
                    type="checkbox"
                    checked={!!domain.autoRenew}
                    disabled={togglingAuto}
                    onChange={(e) => handleToggleAuto(e.target.checked)}
                  />
                  <span className="domains__switch-track" />
                </label>
              </div>

              {domain.autoRenew && !domain.hasSavedPaymentMethod && (
                <div style={{ marginTop: '0.85rem', padding: '0.7rem 0.85rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 'var(--text-xs)', color: '#b45309' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <CreditCard size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>
                      No saved payment method. Add one to allow automatic charges.{' '}
                      <Link to="/my-account?tab=billing" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Add now</Link>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .domains__switch { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
        .domains__switch input { position: absolute; opacity: 0; width: 0; height: 0; }
        .domains__switch-track { width: 48px; height: 28px; border-radius: 999px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); position: relative; transition: background .22s ease, border-color .22s ease; flex-shrink: 0; box-sizing: border-box; }
        .domains__switch-track::after { content:''; position:absolute; top:50%; left:3px; transform:translateY(-50%); width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .22s cubic-bezier(0.4,0,0.2,1); box-shadow:0 1px 2px rgba(0,0,0,.25), 0 1px 3px rgba(0,0,0,.15); }
        .domains__switch:hover .domains__switch-track { border-color: var(--color-primary); }
        .domains__switch input:focus-visible + .domains__switch-track { box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.25); }
        .domains__switch input:checked + .domains__switch-track { background: var(--color-primary); border-color: var(--color-primary); }
        .domains__switch input:checked + .domains__switch-track::after { transform: translate(20px, -50%); }
        .domains__switch input:disabled + .domains__switch-track { opacity: 0.55; cursor: not-allowed; }
        @media (max-width: 720px) { .domain-details-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PayPalScriptProvider>
  );
}
