// ============================================
// BIT SOFTWARE — Admin Wallet Settings
// ============================================
// Configure the top-up fee (%) retained as business revenue and the minimum
// top-up amount. Balances are stored in USD.

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Wallet, Loader2, AlertCircle, Save, Percent, DollarSign, Info } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getWalletSettings, updateWalletSettings } from '@/api/walletApi';
import { toast } from '@/components/common/Toast/Toast';

export default function AdminWalletSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ topupFeePercent: '', minTopupUSD: '' });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getWalletSettings();
      if (res.success) {
        setForm({
          topupFeePercent: res.data?.topupFeePercent ?? 0,
          minTopupUSD: res.data?.minTopupUSD ?? 0,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load wallet settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    const fee = Number(form.topupFeePercent);
    const min = Number(form.minTopupUSD);
    if (Number.isNaN(fee) || fee < 0 || fee > 100) {
      toast.error('Top-up fee must be between 0 and 100%.');
      return;
    }
    if (Number.isNaN(min) || min < 1) {
      toast.error('Minimum top-up must be at least $1.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateWalletSettings({ topupFeePercent: fee, minTopupUSD: min });
      if (res.success) {
        toast.success('Wallet settings saved.');
        fetchSettings();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEOHead title="Wallet Settings" />
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={22} style={{ color: 'var(--color-primary)' }} /> Wallet Settings
          </h1>
          <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>
            Control the top-up fee (your revenue) and the minimum deposit amount.
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated ws-card">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Loader2 size={26} className="spin" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="ws-form">
              <div>
                <label className="form-label ws-label">
                  <Percent size={15} style={{ color: 'var(--color-primary)' }} /> Top-up Fee (%)
                </label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.topupFeePercent}
                  onChange={(e) => setForm((f) => ({ ...f, topupFeePercent: e.target.value }))}
                  required
                />
                <span className="ws-hint">
                  Deducted from every deposit and kept as business revenue. The customer's net amount is credited to their account balance.
                </span>
              </div>

              <div>
                <label className="form-label ws-label">
                  <DollarSign size={15} style={{ color: 'var(--color-primary)' }} /> Minimum Top-up (USD)
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  step="0.01"
                  value={form.minTopupUSD}
                  onChange={(e) => setForm((f) => ({ ...f, minTopupUSD: e.target.value }))}
                  required
                />
                <span className="ws-hint">
                  Smallest amount a customer can deposit in a single top-up (minimum $1).
                </span>
              </div>

              <div className="ws-example">
                <Info size={15} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                <div>
                  Example: a $100 top-up at {form.topupFeePercent || 0}% fee credits the customer{' '}
                  <strong>
                    ${(100 - (100 * (Number(form.topupFeePercent) || 0)) / 100).toFixed(2)}
                  </strong>{' '}
                  and retains ${(((100 * (Number(form.topupFeePercent) || 0)) / 100)).toFixed(2)} as revenue.
                </div>
              </div>

              <button className="btn btn-primary ws-save" type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 size={15} className="spin" /> Saving...</> : <><Save size={15} /> Save Settings</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ws-card { max-width: 560px; }
        .ws-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .ws-label {
          display: flex; align-items: center; gap: 0.4rem;
          margin-bottom: 0.4rem; font-weight: 600; font-size: var(--text-sm);
        }
        .ws-hint {
          font-size: var(--text-xs); color: var(--color-text-muted);
          margin-top: 0.3rem; display: block; line-height: 1.45;
        }
        .ws-example {
          display: flex; gap: 0.5rem; align-items: flex-start;
          padding: 0.75rem 0.9rem; border-radius: 10px;
          background: var(--color-primary-muted); font-size: var(--text-xs);
          color: var(--color-text-secondary); line-height: 1.5;
        }
        .ws-save { align-self: flex-start; }
        @media (max-width: 480px) {
          .ws-save { width: 100%; justify-content: center; align-self: stretch; }
        }
      `}</style>
    </>
  );
}
