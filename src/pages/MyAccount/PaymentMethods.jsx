// ============================================
// BIT SOFTWARE — Saved Payment Methods (Billing)
// ============================================
// Save a PayPal account so domains can auto-renew without the customer present.

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { motion } from 'motion/react';
import {
  CreditCard, Loader2, AlertCircle, Trash2, Star, ShieldCheck, Plus, Info,
} from 'lucide-react';
import {
  getMyPaymentMethods, createSetupToken, savePaymentMethod,
  setDefaultPaymentMethod, deletePaymentMethod,
} from '@/api/paymentMethodApi';
import { toast } from '@/components/common/Toast/Toast';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

function AddPayPalMethod({ onSaved, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [buttonError, setButtonError] = useState('');

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309', fontSize: 'var(--text-sm)' }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        PayPal is not configured. Please set VITE_PAYPAL_CLIENT_ID and try again.
      </div>
    );
  }

  return (
    <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h3 className="h6" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} /> Securely save your PayPal
        </h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
        Click the PayPal button below and approve saving your account. We never store your password or card numbers —
        PayPal keeps them secure. This enables automatic domain renewals.
      </p>

      {buttonError && (
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.7rem 0.85rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-xs)', marginBottom: '0.85rem' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} /> {buttonError}
        </div>
      )}

      {saving ? (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Loader2 size={26} className="spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ marginTop: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Saving your payment method… please wait.
          </p>
        </div>
      ) : (
        <PayPalScriptProvider
          options={{
            'client-id': PAYPAL_CLIENT_ID,
            components: 'buttons',
            currency: 'USD',
            // Vault save-payment flow uses createVaultSetupToken (do NOT use intent: tokenize)
            vault: true,
          }}
        >
          <PayPalButtons
            fundingSource="paypal"
            style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal', height: 42 }}
            disabled={saving}
            createVaultSetupToken={async () => {
              setButtonError('');
              try {
                const res = await createSetupToken();
                const token = res?.data?.setupToken;
                if (!token) {
                  throw new Error(res?.message || 'Could not start PayPal save flow.');
                }
                return token;
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Could not start PayPal. Please try again.';
                setButtonError(msg);
                toast.error(msg);
                throw err;
              }
            }}
            onApprove={async (data) => {
              const setupToken = data?.vaultSetupToken;
              if (!setupToken) {
                setButtonError('PayPal did not return a setup token. Please try again.');
                toast.error('PayPal approval incomplete. Please try again.');
                return;
              }

              setSaving(true);
              setButtonError('');
              try {
                const res = await savePaymentMethod(setupToken);
                if (!res?.success) {
                  throw new Error(res?.message || 'Could not save payment method.');
                }
                toast.success('Payment method saved successfully.');
                onSaved();
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || 'Could not save payment method.';
                setButtonError(msg);
                toast.error(msg);
              } finally {
                setSaving(false);
              }
            }}
            onError={(err) => {
              console.error('[PayPal Vault]', err);
              const msg = 'PayPal encountered an error. Please refresh and try again.';
              setButtonError(msg);
              toast.error(msg);
            }}
            onCancel={() => {
              toast.info('Saving payment method cancelled.');
            }}
          />
        </PayPalScriptProvider>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.9rem', fontSize: '11px', color: 'var(--color-text-muted)', alignItems: 'flex-start' }}>
        <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>After saving, turn on Auto-Renew on any domain from its Details page.</span>
      </div>

      <div style={{ marginTop: '0.85rem', padding: '0.75rem 0.85rem', borderRadius: '8px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
        <strong style={{ color: 'var(--color-text-secondary)' }}>Note for merchant:</strong>{' '}
        If PayPal says vaulting is not allowed, your PayPal business app needs
        “Save PayPal payment methods” / Vault (Reference Transactions) enabled.
        Ask PayPal support to turn this on for your account.
      </div>
    </div>
  );
}

export default function PaymentMethods() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyPaymentMethods();
      if (res.success) setMethods(res.data || []);
      else setError(res.message || 'Failed to load payment methods.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payment methods.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  // Handle return from PayPal redirect (vault=success / vault=cancel)
  useEffect(() => {
    const vault = searchParams.get('vault');
    if (!vault) return;

    if (vault === 'cancel') {
      toast.info('Saving payment method was cancelled.');
    } else if (vault === 'success') {
      // Popup flow usually finishes in-page; if redirected, reopen add UI so user can retry if needed.
      setAdding(true);
      toast.info('If your payment method was approved, it will appear below shortly.');
      fetchMethods();
    }

    const next = new URLSearchParams(searchParams);
    next.delete('vault');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, fetchMethods]);

  const handleSetDefault = async (id) => {
    setBusyId(id);
    try {
      await setDefaultPaymentMethod(id);
      toast.success('Default payment method updated.');
      await fetchMethods();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this saved payment method? Auto-renew will stop using it.')) return;
    setBusyId(id);
    try {
      await deletePaymentMethod(id);
      toast.success('Payment method removed.');
      await fetchMethods();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Remove failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div key="billing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="myaccount__section-header">
        <div>
          <h2 className="h4">Billing & Payment</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Save a payment method to enable automatic domain renewals
          </p>
        </div>
        {!adding && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Payment Method
          </button>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {adding && (
        <AddPayPalMethod
          onCancel={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            fetchMethods();
          }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <Loader2 size={28} className="spin" />
        </div>
      ) : methods.length === 0 ? (
        !adding && (
          <div className="card-elevated" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <CreditCard size={44} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
            <h3 className="h6" style={{ marginBottom: '0.5rem' }}>No Saved Payment Methods</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
              Add a PayPal account to turn on automatic domain renewals.
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
              <Plus size={14} /> Add Payment Method
            </button>
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {methods.map((m) => (
            <div
              key={m._id}
              className="card-elevated"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', opacity: busyId === m._id ? 0.7 : 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                    PayPal · {m.label}
                    {m.isDefault && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '11px', fontWeight: 700, color: '#16a34a', background: 'rgba(34,197,94,0.12)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>
                        Default
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Saved for auto-renewals
                    {m.createdAt ? ` · ${new Date(m.createdAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!m.isDefault && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleSetDefault(m._id)}
                    disabled={!!busyId}
                    title="Make default"
                  >
                    {busyId === m._id ? <Loader2 size={14} className="spin" /> : <Star size={14} />} Make Default
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(m._id)}
                  disabled={!!busyId}
                  style={{ color: '#dc2626' }}
                  title="Remove"
                >
                  {busyId === m._id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
