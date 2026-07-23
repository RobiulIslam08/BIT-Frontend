// ============================================
// BIT SOFTWARE — Wallet (Account Balance + Promotional Credit)
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import {
  Wallet as WalletIcon, Gift, Plus, ArrowUpRight, RefreshCw, Loader2,
  X, ArrowUpCircle, ArrowDownCircle, Info,
} from 'lucide-react';
import {
  getWalletSummary, getWalletTransactions, createTopupOrder, completeTopup,
  createWithdrawal, getMyWithdrawals,
} from '@/api/walletApi';
import { getMyProfile } from '@/api/userApi';
import { updateUser } from '@/features/auth/authSlice';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';

const txnMeta = {
  topup: { label: 'Top-up', icon: ArrowDownCircle, color: '#16a34a', sign: '+' },
  refund: { label: 'Refund', icon: ArrowDownCircle, color: '#16a34a', sign: '+' },
  bonus_credit: { label: 'Promotional Credit', icon: Gift, color: '#7c3aed', sign: '+' },
  withdrawal_reversal: { label: 'Withdrawal Reversed', icon: ArrowDownCircle, color: '#16a34a', sign: '+' },
  purchase: { label: 'Purchase', icon: ArrowUpCircle, color: '#dc2626', sign: '-' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpCircle, color: '#dc2626', sign: '-' },
  adjustment: { label: 'Adjustment', icon: Info, color: '#2563eb', sign: '' },
};

const statusPill = {
  completed: { label: 'Completed', color: '#16a34a', bg: 'rgba(34,197,94,0.12)' },
  pending: { label: 'Pending', color: '#d97706', bg: 'rgba(245,158,11,0.12)' },
  processing: { label: 'Processing', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  failed: { label: 'Failed', color: '#dc2626', bg: 'rgba(239,68,68,0.12)' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: 'rgba(239,68,68,0.12)' },
};

const formatBalance = (formatPrice, value) =>
  (value == null ? '—' : formatPrice(value));

export default function Wallet() {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();

  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingReturn, setCompletingReturn] = useState(false);
  const [returnTopupError, setReturnTopupError] = useState('');

  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  /** Prevents auto-complete from re-firing for the same token on every render. */
  const autoCompleteTokenRef = useRef(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await getMyProfile();
      if (res?.success && res.data) dispatch(updateUser(res.data));
    } catch {
      /* non-blocking */
    }
  }, [dispatch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, w] = await Promise.all([
        getWalletSummary(),
        getWalletTransactions({ limit: 20 }),
        getMyWithdrawals({ limit: 10 }),
      ]);
      if (s?.success) setSummary(s.data);
      if (t?.success) setTxns(t.data || []);
      if (w?.success) setWithdrawals(w.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load wallet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const clearPayPalReturnParams = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('token');
    next.delete('PayerID');
    next.delete('ba_token');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const runCompleteTopup = useCallback(async (paypalOrderId) => {
    setCompletingReturn(true);
    setReturnTopupError('');
    try {
      const res = await completeTopup(paypalOrderId);
      if (res?.success) {
        toast.success(res.message || 'Wallet topped up successfully!');
        await Promise.all([loadAll(), refreshProfile()]);
        clearPayPalReturnParams();
        return true;
      }
      const msg = res?.message || 'Could not complete top-up.';
      setReturnTopupError(msg);
      toast.error(msg);
      return false;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not complete top-up.';
      setReturnTopupError(msg);
      toast.error(msg);
      return false;
    } finally {
      setCompletingReturn(false);
    }
  }, [loadAll, refreshProfile, clearPayPalReturnParams]);

  // Complete PayPal top-up when returning from redirect (return_url has ?token=ORDER_ID).
  // On failure keep `token` so the customer can retry (backend completeTopup is retryable).
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    if (autoCompleteTokenRef.current === token) return;
    autoCompleteTokenRef.current = token;
    runCompleteTopup(token);
  }, [searchParams, runCompleteTopup]);

  const onTopupDone = async () => {
    setShowTopup(false);
    await Promise.all([loadAll(), refreshProfile()]);
  };
  const onWithdrawDone = async () => {
    setShowWithdraw(false);
    await Promise.all([loadAll(), refreshProfile()]);
  };

  const account = summary != null ? Number(summary.accountBalance || 0) : null;
  const promo = summary != null ? Number(summary.promotionalCredit || 0) : null;
  const total = summary != null ? Number(summary.totalBalance || 0) : null;
  const withdrawable = summary != null ? Number(summary.withdrawableWholeUSD || 0) : 0;
  const returnToken = searchParams.get('token');

  return (
    <motion.div key="wallet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="myaccount__section-header">
        <div>
          <h2 className="h4">My Wallet</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Add funds, pay for services, and manage promotional credit
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadAll} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {(completingReturn || returnTopupError || returnToken) && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: returnTopupError ? 'rgba(239,68,68,0.08)' : 'var(--color-primary-muted)',
            border: `1px solid ${returnTopupError ? 'rgba(239,68,68,0.25)' : 'var(--color-primary-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
            fontSize: 'var(--text-sm)',
          }}
        >
          <span>
            {completingReturn
              ? 'Completing your PayPal top-up…'
              : returnTopupError
                ? returnTopupError
                : 'PayPal return detected.'}
          </span>
          {returnToken && !completingReturn && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                autoCompleteTokenRef.current = null;
                runCompleteTopup(returnToken);
              }}
            >
              Retry Complete Top-up
            </button>
          )}
        </div>
      )}

      {/* ─── Balance cards ─── */}
      <div className="wallet-cards">
        {/* Account balance */}
        <div className="wallet-card wallet-card--primary">
          <div className="wallet-card__icon"><WalletIcon size={22} /></div>
          <div className="wallet-card__label">Account Balance</div>
          <div className="wallet-card__value">
            {loading && summary == null ? <Loader2 size={22} className="spin" /> : formatBalance(formatPrice, account)}
          </div>
          <div className="wallet-card__hint">Withdrawable · usable on all services</div>
          <div className="wallet-card__actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowTopup(true)}>
              <Plus size={14} /> Add Funds
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => {
                if (summary == null) {
                  toast.warning('Wallet is still loading. Please wait a moment.');
                  return;
                }
                if (withdrawable < 1) {
                  toast.warning(
                    (account || 0) < 1
                      ? 'You need at least $1 in Account Balance to withdraw. Promotional credit cannot be withdrawn.'
                      : 'Only whole-dollar amounts can be withdrawn. Add funds until you have at least $1.',
                  );
                  return;
                }
                setShowWithdraw(true);
              }}
            >
              <ArrowUpRight size={14} /> Withdraw
            </button>
          </div>
        </div>

        {/* Promotional credit */}
        <div className="wallet-card wallet-card--promo">
          <div className="wallet-card__icon wallet-card__icon--promo"><Gift size={22} /></div>
          <div className="wallet-card__label">Promotional Credit</div>
          <div className="wallet-card__value" style={{ color: '#7c3aed' }}>
            {loading && summary == null ? <Loader2 size={22} className="spin" /> : formatBalance(formatPrice, promo)}
          </div>
          <div className="wallet-card__hint">Gift credit · spent first, not withdrawable</div>
          <div className="wallet-card__combined">
            Total spendable:{' '}
            <strong>{loading && summary == null ? '—' : formatBalance(formatPrice, total)}</strong>
          </div>
        </div>
      </div>

      {/* ─── Withdrawals ─── */}
      {withdrawals.length > 0 && (
        <div className="card-elevated" style={{ marginTop: '1.25rem' }}>
          <h3 className="h5" style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpRight size={18} /> Withdrawal Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {withdrawals.map((w) => {
              const st = statusPill[w.status] || statusPill.pending;
              return (
                <div key={w._id} className="wallet-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{formatPrice(w.amountUSD)}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {w.method} · {new Date(w.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="wallet-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Transactions ─── */}
      <div className="card-elevated" style={{ marginTop: '1.25rem' }}>
        <h3 className="h5" style={{ marginBottom: '0.875rem' }}>Transaction History</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            <Loader2 size={26} className="spin" />
          </div>
        ) : txns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            No transactions yet. Add funds to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {txns.map((t) => {
              const meta = txnMeta[t.type] || txnMeta.adjustment;
              const Icon = meta.icon;
              const st = statusPill[t.status] || statusPill.completed;
              const signedNet = Number(t.accountAmount || 0) + Number(t.promoAmount || 0);
              const displayAmt = Math.abs(signedNet) > 0
                ? Math.abs(signedNet)
                : Number(t.netUSD || t.grossUSD || t.amount || 0);
              const sign = signedNet !== 0
                ? (signedNet >= 0 ? '+' : '-')
                : (meta.sign || '');
              return (
                <div key={t._id} className="wallet-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div className="wallet-txn-icon" style={{ color: meta.color, background: `${meta.color}1a` }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{meta.label}</div>
                      <div className="wallet-txn-note">
                        {t.note || new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: meta.color, fontFamily: 'var(--font-display)' }}>
                      {sign}{formatPrice(displayAmt)}
                    </div>
                    <span className="wallet-pill" style={{ color: st.color, background: st.bg, fontSize: '10px' }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTopup && (
        <TopupModal summary={summary} onClose={() => setShowTopup(false)} onDone={onTopupDone} formatPrice={formatPrice} />
      )}
      {showWithdraw && (
        <WithdrawModal summary={summary} onClose={() => setShowWithdraw(false)} onDone={onWithdrawDone} formatPrice={formatPrice} />
      )}

      <WalletStyles />
    </motion.div>
  );
}

// ============================================
// TOP-UP MODAL
// ============================================
function apiErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (data?.errorSources?.length) {
    return data.errorSources.map((e) => e.message).filter(Boolean).join(' · ') || data.message || fallback;
  }
  return data?.message || err?.message || fallback;
}

function TopupModal({ summary, onClose, onDone, formatPrice }) {
  const min = summary?.minTopupUSD || 1;
  const feePercent = summary?.feePercent || 0;
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('form'); // form | pay | processing
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const gross = parseFloat(amount) || 0;
  const fee = Math.round(gross * feePercent) / 100;
  const net = Math.max(0, Math.round((gross - fee) * 100) / 100);

  const proceed = async () => {
    setError('');
    if (gross < min) { setError(`Minimum top-up is $${min.toFixed(2)}.`); return; }
    setBusy(true);
    try {
      const res = await createTopupOrder(gross);
      if (res?.success && res.data?.paypalOrderId) {
        setPaypalOrderId(res.data.paypalOrderId);
        setBreakdown(res.data);
        setStep('pay');
      } else {
        setError(res?.message || 'Failed to start top-up.');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to start top-up.'));
    } finally {
      setBusy(false);
    }
  };

  const onApprove = async (data) => {
    setStep('processing');
    setError('');
    try {
      const res = await completeTopup(data.orderID);
      if (res?.success) {
        toast.success('Wallet topped up successfully!');
        onDone();
      } else {
        setError(res?.message || 'Top-up could not be completed.');
        setStep('pay');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Top-up could not be completed.'));
      setStep('pay');
    }
  };

  return (
    <ModalShell title="Add Funds" onClose={onClose}>
      {step === 'form' && (
        <>
          <label className="wallet-label">Amount to add (USD)</label>
          <div className="wallet-amount-input">
            <span>$</span>
            <input
              type="number" min={min} step="0.01" inputMode="decimal"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${min}`} autoFocus
            />
          </div>
          <div className="wallet-quick">
            {[10, 25, 50, 100].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className="wallet-quick__btn">
                ${v}
              </button>
            ))}
          </div>

          <div className="wallet-breakdown">
            <div><span>You pay</span><strong>${gross.toFixed(2)}</strong></div>
            <div><span>Fee ({feePercent}%)</span><strong>- ${fee.toFixed(2)}</strong></div>
            <div className="wallet-breakdown__net"><span>Credited to wallet</span><strong>${net.toFixed(2)}</strong></div>
          </div>
          <p className="wallet-note"><Info size={12} /> ≈ {formatPrice(net)} will be added to your balance.</p>

          {error && <div className="wallet-error">{error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={proceed} disabled={busy || gross < min}>
            {busy ? <><Loader2 size={16} className="spin" /> Preparing...</> : 'Continue to PayPal'}
          </button>
        </>
      )}

      {step === 'pay' && (
        <>
          <div className="wallet-breakdown" style={{ marginTop: 0 }}>
            <div><span>You pay</span><strong>${(breakdown?.grossUSD ?? gross).toFixed(2)}</strong></div>
            <div className="wallet-breakdown__net"><span>Credited</span><strong>${(breakdown?.netUSD ?? net).toFixed(2)}</strong></div>
          </div>
          {error && <div className="wallet-error">{error}</div>}
          <div style={{ marginTop: '0.75rem' }}>
            <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
              <PayPalButtons
                style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                createOrder={() => Promise.resolve(paypalOrderId)}
                onApprove={onApprove}
                onError={() => setError('PayPal encountered an error. Please try again.')}
                onCancel={() => toast.info('Payment cancelled.')}
              />
            </PayPalScriptProvider>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={() => setStep('form')}>
            Back
          </button>
        </>
      )}

      {step === 'processing' && (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Loader2 size={28} className="spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Crediting your wallet...
          </p>
        </div>
      )}
    </ModalShell>
  );
}

// ============================================
// WITHDRAW MODAL
// ============================================
function WithdrawModal({ summary, onClose, onDone, formatPrice }) {
  const max = summary?.withdrawableWholeUSD || 0;
  const [amount, setAmount] = useState(max >= 1 ? String(Math.min(max, 1)) : '');
  const [method, setMethod] = useState('bank');
  const [details, setDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    walletNumber: '',
    paypalEmail: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const amt = parseInt(amount, 10) || 0;
  const setD = (k, v) => setDetails((d) => ({ ...d, [k]: v }));

  const changeMethod = (id) => {
    setMethod(id);
    setError('');
  };

  const buildDetails = () => {
    if (method === 'bank') {
      return {
        bankName: details.bankName.trim(),
        accountName: details.accountName.trim(),
        accountNumber: details.accountNumber.trim(),
        ...(details.branch.trim() ? { branch: details.branch.trim() } : {}),
      };
    }
    if (method === 'bkash' || method === 'nagad') {
      return { walletNumber: details.walletNumber.trim() };
    }
    return { paypalEmail: details.paypalEmail.trim() };
  };

  const validateLocal = () => {
    if (!Number.isInteger(amt) || amt < 1) {
      return 'Enter a whole amount of at least $1.';
    }
    if (amt > max) {
      return `You can withdraw at most $${max}.`;
    }
    if (method === 'bank') {
      if (!details.bankName.trim() || !details.accountName.trim() || !details.accountNumber.trim()) {
        return 'Bank withdrawals require bank name, account holder name, and account number.';
      }
    } else if (method === 'bkash' || method === 'nagad') {
      if (!details.walletNumber.trim()) {
        return `Enter your ${method === 'bkash' ? 'bKash' : 'Nagad'} number.`;
      }
    } else if (method === 'paypal') {
      const email = details.paypalEmail.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Enter a valid PayPal email address.';
      }
    }
    return '';
  };

  const submit = async () => {
    setError('');
    const localErr = validateLocal();
    if (localErr) {
      setError(localErr);
      toast.warning(localErr);
      return;
    }

    setBusy(true);
    try {
      const res = await createWithdrawal({
        amountUSD: amt,
        method,
        details: buildDetails(),
      });
      if (res?.success) {
        toast.success('Withdrawal request submitted. Pending admin approval.');
        onDone();
      } else {
        setError(res?.message || 'Failed to submit withdrawal.');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to submit withdrawal.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Withdraw Funds" onClose={onClose}>
      <p className="wallet-note" style={{ marginTop: 0 }}>
        <Info size={12} /> Only whole-dollar amounts of your <strong>Account Balance</strong> can be withdrawn.
        Promotional credit and fractional cents stay in your wallet. Available: <strong>${max}</strong>.
      </p>

      {max < 1 ? (
        <div className="wallet-error">
          You need at least $1 in Account Balance to request a withdrawal.
        </div>
      ) : (
        <>
          <label className="wallet-label">Amount (whole USD)</label>
          <div className="wallet-amount-input">
            <span>$</span>
            <input
              type="number"
              min="1"
              max={max}
              step="1"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder={`Max ${max}`}
              autoFocus
            />
          </div>
          <div className="wallet-quick">
            {[1, 5, 10, 25, 50].filter((v) => v <= max).map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className="wallet-quick__btn">
                ${v}
              </button>
            ))}
            {max >= 1 && (
              <button type="button" onClick={() => setAmount(String(max))} className="wallet-quick__btn">
                Max ${max}
              </button>
            )}
          </div>
          {amt > 0 && <p className="wallet-note">≈ {formatPrice(amt)}</p>}

          <label className="wallet-label">Withdrawal Method</label>
          <div className="wallet-method-tabs">
            {[
              { id: 'bank', label: 'Bank' },
              { id: 'bkash', label: 'bKash' },
              { id: 'nagad', label: 'Nagad' },
              { id: 'paypal', label: 'PayPal' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`wallet-method-tab ${method === m.id ? 'active' : ''}`}
                onClick={() => changeMethod(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
            {method === 'bank' && (
              <>
                <input className="input" value={details.bankName} placeholder="Bank name *" onChange={(e) => setD('bankName', e.target.value)} />
                <input className="input" value={details.accountName} placeholder="Account holder name *" onChange={(e) => setD('accountName', e.target.value)} />
                <input className="input" value={details.accountNumber} placeholder="Account number *" onChange={(e) => setD('accountNumber', e.target.value)} />
                <input className="input" value={details.branch} placeholder="Branch / routing (optional)" onChange={(e) => setD('branch', e.target.value)} />
              </>
            )}
            {(method === 'bkash' || method === 'nagad') && (
              <input
                className="input"
                value={details.walletNumber}
                placeholder={`${method === 'bkash' ? 'bKash' : 'Nagad'} number *`}
                onChange={(e) => setD('walletNumber', e.target.value)}
              />
            )}
            {method === 'paypal' && (
              <input
                className="input"
                type="email"
                value={details.paypalEmail}
                placeholder="PayPal email *"
                onChange={(e) => setD('paypalEmail', e.target.value)}
              />
            )}
          </div>

          {error && <div className="wallet-error">{error}</div>}
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
            onClick={submit}
            disabled={busy}
          >
            {busy ? <><Loader2 size={16} className="spin" /> Submitting...</> : 'Request Withdrawal'}
          </button>
        </>
      )}
    </ModalShell>
  );
}

// ============================================
// SHARED MODAL SHELL
// ============================================
function ModalShell({ title, onClose, children }) {
  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="wallet-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wallet-modal__header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
          <button className="wallet-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="wallet-modal__body">{children}</div>
      </motion.div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
function WalletStyles() {
  return (
    <style>{`
      .wallet-cards { display: grid; grid-template-columns: 1fr; gap: 1rem; }
      @media (min-width: 640px) { .wallet-cards { grid-template-columns: 1fr 1fr; } }
      .wallet-card {
        border-radius: 14px; padding: 1.15rem; border: 1px solid var(--color-border);
        background: var(--color-surface-elevated); box-shadow: var(--shadow-sm); position: relative; overflow: hidden;
      }
      @media (min-width: 480px) { .wallet-card { padding: 1.25rem; } }
      .wallet-card--primary { background: linear-gradient(135deg, var(--color-primary-muted), var(--color-surface-elevated)); }
      .wallet-card--promo { background: linear-gradient(135deg, rgba(124,58,237,0.10), var(--color-surface-elevated)); }
      .wallet-card__icon {
        width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
        background: var(--color-primary-muted); color: var(--color-primary); margin-bottom: 0.75rem;
      }
      .wallet-card__icon--promo { background: rgba(124,58,237,0.14); color: #7c3aed; }
      .wallet-card__label { font-size: var(--text-xs); color: var(--color-text-muted); }
      .wallet-card__value { font-size: clamp(1.4rem, 6vw, 2rem); font-weight: 800; font-family: var(--font-display); color: var(--color-primary); line-height: 1.2; margin: 0.15rem 0; word-break: break-word; }
      .wallet-card__hint { font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.4; }
      .wallet-card__actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
      .wallet-card__actions .btn { flex: 1 1 auto; min-width: 7.5rem; justify-content: center; }
      .wallet-card__combined { margin-top: 1rem; font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.4; }

      .wallet-row {
        display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
        padding: 0.7rem 0.85rem; border-radius: 10px; background: var(--color-bg-secondary);
        min-width: 0;
      }
      .wallet-txn-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .wallet-txn-note {
        font-size: var(--text-xs); color: var(--color-text-muted);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
      }
      .wallet-pill { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 0.2rem; white-space: nowrap; }

      .wallet-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 3000;
        display: flex; align-items: flex-end; justify-content: center; padding: 0;
      }
      @media (min-width: 560px) { .wallet-modal-overlay { align-items: center; padding: 1rem; } }
      .wallet-modal {
        background: var(--color-surface-elevated); width: 100%; max-width: 440px;
        border-radius: 16px 16px 0 0; max-height: min(92vh, 100dvh);
        overflow-y: auto; box-shadow: var(--shadow-lg);
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      @media (min-width: 560px) { .wallet-modal { border-radius: 16px; max-height: 90vh; } }
      .wallet-modal__header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border); position: sticky; top: 0; background: var(--color-surface-elevated); z-index: 1; }
      .wallet-modal__close { background: var(--color-bg-secondary); border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-muted); flex-shrink: 0; }
      .wallet-modal__body { padding: 1.1rem 1.15rem 1.35rem; }
      @media (min-width: 480px) { .wallet-modal__body { padding: 1.25rem; } }

      .wallet-label { display: block; font-size: var(--text-xs); font-weight: 700; margin: 0.75rem 0 0.35rem; color: var(--color-text-secondary); }
      .wallet-amount-input { display: flex; align-items: center; gap: 0.4rem; border: 1.5px solid var(--color-border); border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 1.25rem; font-weight: 700; }
      .wallet-amount-input span { color: var(--color-text-muted); }
      .wallet-amount-input input { border: none; outline: none; width: 100%; min-width: 0; font-size: 1.25rem; font-weight: 700; background: transparent; color: var(--color-text-primary); }
      .wallet-quick { display: flex; gap: 0.4rem; margin-top: 0.6rem; flex-wrap: wrap; }
      .wallet-quick__btn { flex: 1 1 calc(25% - 0.4rem); min-width: 4.25rem; padding: 0.5rem 0.4rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-secondary); font-weight: 700; cursor: pointer; color: var(--color-text-secondary); }
      .wallet-quick__btn:hover { border-color: var(--color-primary); color: var(--color-primary); }

      .wallet-breakdown { margin-top: 1rem; border: 1px solid var(--color-border); border-radius: 10px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: var(--text-sm); }
      .wallet-breakdown div { display: flex; justify-content: space-between; gap: 0.75rem; color: var(--color-text-secondary); }
      .wallet-breakdown__net { border-top: 1px dashed var(--color-border); padding-top: 0.4rem; color: var(--color-text-primary) !important; font-weight: 700; }
      .wallet-breakdown__net strong { color: var(--color-primary); }
      .wallet-note { display: flex; align-items: flex-start; gap: 0.35rem; font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 0.5rem; line-height: 1.45; }
      .wallet-note svg { flex-shrink: 0; margin-top: 1px; }
      .wallet-error { margin-top: 0.75rem; padding: 0.6rem 0.85rem; border-radius: 8px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #dc2626; font-size: var(--text-xs); line-height: 1.45; }

      .wallet-method-tabs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; }
      @media (min-width: 420px) { .wallet-method-tabs { grid-template-columns: repeat(4, 1fr); } }
      .wallet-method-tab { padding: 0.55rem 0.4rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-secondary); font-weight: 700; font-size: var(--text-xs); cursor: pointer; color: var(--color-text-secondary); min-height: 40px; }
      .wallet-method-tab.active { border-color: var(--color-primary); background: var(--color-primary-muted); color: var(--color-primary); }

      @media (max-width: 480px) {
        .wallet-row { padding: 0.65rem 0.7rem; gap: 0.5rem; }
        .wallet-card__actions .btn { min-width: 0; flex: 1 1 calc(50% - 0.25rem); }
      }
    `}</style>
  );
}
