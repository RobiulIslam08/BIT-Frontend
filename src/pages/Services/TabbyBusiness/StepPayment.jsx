// ============================================
// BIT SOFTWARE — Tabby Step 3: Review & Payment
// ============================================

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  CreditCard, Wallet, Shield, AlertCircle, Loader2, ArrowLeft, CheckCircle2,
} from 'lucide-react';
import { toast } from '@/components/common/Toast/Toast';
import { createTabbyPayPalOrder } from '@/api/tabbyOrderApi';
import { getWalletSummary } from '@/api/walletApi';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useCurrency } from '@/context/CurrencyContext';
import { TABBY_PRICE_SAR } from '@/constants/tabbyService';
import { trackEvent } from '@/utils/analytics';

function PayPalCheckoutButtons({ termsAccepted, setError, isBusy, setBusy, onPayPalApprove }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="paypal-loading-state" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Loader2 size={20} className="spin" /> Loading PayPal checkout...
      </div>
    );
  }
  if (isRejected) {
    return (
      <div className="tabby-error" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <AlertCircle size={16} /> Failed to load PayPal. Refresh and try again.
      </div>
    );
  }
  if (isBusy) {
    return (
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Loader2 size={20} className="spin" /> Capturing payment and placing order...
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
      disabled={isBusy}
      onClick={(_data, actions) => {
        if (!termsAccepted) {
          const msg = 'Please accept the Terms of Service and refund policy before paying.';
          setError(msg);
          toast.warning(msg);
          return actions.reject();
        }
        setError('');
        return actions.resolve();
      }}
      createOrder={async () => {
        const res = await createTabbyPayPalOrder();
        const id = res?.data?.paypalOrderId;
        if (!id) throw new Error('No PayPal order ID returned.');
        trackEvent('add_payment_info', {
          currency: 'SAR',
          value: TABBY_PRICE_SAR,
          payment_type: 'PayPal',
          items: [{ item_id: 'tabby_business', item_name: 'Tabby Business Account Setup', price: TABBY_PRICE_SAR, quantity: 1 }],
        });
        return id;
      }}
      onApprove={async (data) => {
        setBusy(true);
        try {
          await onPayPalApprove(data.orderID);
        } catch (err) {
          const msg = err?.response?.data?.message || 'Failed to place the Tabby order after PayPal payment.';
          setError(msg);
        } finally {
          setBusy(false);
        }
      }}
      onError={() => {
        const msg = 'PayPal payment failed. Please try again or use account balance.';
        setError(msg);
        toast.error(msg);
      }}
      onCancel={() => toast.info('PayPal payment cancelled.')}
    />
  );
}

export default function StepPayment({ form, files, onBack, onSubmit, isSubmitting, reviewRows }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { currency, formatFromSARWithCode, formatPriceWithCode } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [walletSummary, setWalletSummary] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await getWalletSummary();
        if (!cancelled && res?.success) setWalletSummary(res.data);
      } catch { /* optional */ }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const paypalClientId = (() => {
    const envId = (import.meta.env.VITE_PAYPAL_CLIENT_ID || '').trim();
    if (!envId || envId === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE') {
      return import.meta.env.DEV ? 'sb' : '';
    }
    return envId;
  })();
  const paypalReady = Boolean(paypalClientId);

  const walletNeededUSD = parseFloat((TABBY_PRICE_SAR / 3.75).toFixed(2));
  const walletBalance = walletSummary?.totalBalance ?? 0;
  const walletSufficient = isAuthenticated && walletSummary != null && walletBalance >= walletNeededUSD;

  const buildPayload = (extra = {}) => ({
    legalCompanyName: form.legalCompanyName,
    crNumber: form.crNumber,
    vatRegistered: form.vatRegistered,
    vatNumber: form.vatNumber,
    city: form.city,
    nationalAddressCode: form.nationalAddressCode,
    ownerName: form.ownerName,
    ownerNationalId: form.ownerNationalId,
    email: form.email,
    phone: form.phone,
    website: form.website,
    iban: form.iban,
    ownerRole: 'owner',
    integrationType: 'online',
    businessActivity: 'General business',
    bankName: 'As per IBAN letter',
    termsAccepted: true,
    crCopy: files.crCopy,
    nationalAddressPdf: files.nationalAddressPdf,
    vatCertificate: files.vatCertificate,
    ibanCertificate: files.ibanCertificate,
    ownerIdCopy: files.ownerIdCopy,
    ...extra,
  });

  const handleWalletPay = async () => {
    if (isSubmitting || busy) return;
    if (!termsAccepted) {
      const msg = 'Please accept the Terms of Service and refund policy before paying with wallet.';
      setError(msg);
      toast.warning(msg);
      document.getElementById('tabby-terms-check')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!walletSufficient) {
      const msg = 'Insufficient account balance. Please add funds or choose PayPal.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(buildPayload({ paymentMethod: 'wallet' }));
    } catch {
      /* parent already shows a toast */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h3 className="h5" style={{ marginBottom: '0.75rem' }}>Review & pay</h3>
      <div className="tabby-review">
        {reviewRows.map(([label, value]) => (
          <div className="tabby-review__row" key={label}>
            <span>{label}</span>
            <strong>{value || '—'}</strong>
          </div>
        ))}
      </div>

      <div className="tabby-pay-bar" style={{ position: 'relative', bottom: 0 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>TABBY SETUP FEE</div>
          <strong>{formatFromSARWithCode(TABBY_PRICE_SAR)}</strong>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Activation within 3 working days</div>
      </div>

      {!isAuthenticated ? (
        <div className="tabby-login-box" style={{ marginTop: '1.25rem' }}>
          <Shield size={28} style={{ color: 'var(--tabby)', marginBottom: '0.5rem' }} />
          <h4 className="h5">Log in to pay</h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0.4rem 0 1rem' }}>
            Your typed details stay on this device. After you sign in you will return here — re-upload the documents, then pay.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth/login" state={{ from: location }} className="btn btn-primary">Log in</Link>
            <Link to="/auth/register" state={{ from: location }} className="btn btn-secondary">Create account</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="tabby-pay-methods">
            <label className={`tabby-pay-card ${paymentMethod === 'paypal' ? 'is-on' : ''}`}>
              <input type="radio" name="tabbyPay" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} style={{ display: 'none' }} />
              <CreditCard size={18} />
              <div style={{ fontWeight: 800, marginTop: 6 }}>Pay with Card</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Pay 500 SAR securely (charged in USD)</div>
            </label>
            <label className={`tabby-pay-card ${paymentMethod === 'wallet' ? 'is-on' : ''}`}>
              <input type="radio" name="tabbyPay" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} style={{ display: 'none' }} />
              <Wallet size={18} />
              <div style={{ fontWeight: 800, marginTop: 6 }}>Account Balance</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {walletSummary == null ? 'Loading balance…' : (
                  <>Balance: <strong>{formatPriceWithCode(walletBalance)}</strong>
                    {!walletSufficient && <> — <Link to="/my-account?tab=wallet">Add funds</Link></>}
                  </>
                )}
              </div>
            </label>
          </div>

          <label id="tabby-terms-check" className={`tabby-terms ${!termsAccepted && error ? 'is-warn' : ''}`}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) setError('');
              }}
            />
            <span>
              I confirm the documents are accurate and I accept the{' '}
              <Link to="/terms-and-conditions#tabby">Terms of Service</Link> and{' '}
              <Link to="/privacy#refund">refund policy</Link>. Setup is completed within 3 working days.
            </span>
          </label>

          {!termsAccepted && (
            <div className="tabby-terms-warning">
              <AlertCircle size={15} />
              Please accept the Terms of Service and refund policy above before paying.
            </div>
          )}

          {error && (
            <div className="tabby-error" style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.35rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="tabby-nav">
            <button type="button" className="btn btn-secondary" onClick={onBack} disabled={isSubmitting || busy}>
              <ArrowLeft size={16} /> Back
            </button>

            {paymentMethod === 'wallet' ? (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting || busy}
                onClick={handleWalletPay}
              >
                {isSubmitting || busy ? <><Loader2 size={16} className="spin" /> Processing...</> : <><CheckCircle2 size={16} /> Pay {formatFromSARWithCode(TABBY_PRICE_SAR)}</>}
              </button>
            ) : !paypalReady ? (
              <div className="tabby-error" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <AlertCircle size={16} /> PayPal is not configured. Please pay with wallet or try again later.
              </div>
            ) : (
              <div style={{ minWidth: 280, flex: 1 }}>
                <PayPalScriptProvider options={{ 'client-id': paypalClientId, currency: 'USD', intent: 'capture', components: 'buttons' }}>
                  <PayPalCheckoutButtons
                    termsAccepted={termsAccepted}
                    setError={setError}
                    isBusy={busy || isSubmitting}
                    setBusy={setBusy}
                    onPayPalApprove={(paypalOrderId) => onSubmit(buildPayload({ paymentMethod: 'paypal', paypalOrderId }))}
                  />
                </PayPalScriptProvider>
                {currency !== 'USD' && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6, textAlign: 'center' }}>
                    PayPal charges approximately ${walletNeededUSD.toFixed(2)} USD
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!isAuthenticated && (
        <div className="tabby-nav">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}
    </div>
  );
}
