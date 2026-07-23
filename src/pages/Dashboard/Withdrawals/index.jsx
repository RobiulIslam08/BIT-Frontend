// ============================================
// BIT SOFTWARE — Admin Withdrawals Management
// ============================================
// Review customer withdrawal requests. Funds are already held on the account
// when a request is created. "Complete" marks it paid; "Reject" returns the
// held funds to the customer's account balance.

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight, Filter, RefreshCw, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { listWithdrawals, processWithdrawal } from '@/api/walletApi';
import { toast } from '@/components/common/Toast/Toast';

const STATUS_OPTIONS = ['', 'pending', 'completed', 'rejected'];

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const METHOD_LABELS = { bank: 'Bank Transfer', bkash: 'bKash', nagad: 'Nagad', paypal: 'PayPal' };

function StatusBadge({ status }) {
  const s = statusConfig[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function DetailRow({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="wd-detail-row">
      <span className="wd-detail-row__label">{label}</span>
      <span className="wd-detail-row__value" style={{ fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</span>
    </div>
  );
}

function WithdrawalModal({ item, onClose, onDone }) {
  const [payoutRef, setPayoutRef] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [busy, setBusy] = useState('');
  const user = item.userId && typeof item.userId === 'object' ? item.userId : null;
  const d = item.details || {};

  const handleAction = async (action) => {
    if (action === 'reject' && !adminNote.trim()) {
      toast.warning('Please add a note explaining the rejection.');
      return;
    }
    setBusy(action);
    try {
      const res = await processWithdrawal(item._id, { action, payoutRef: payoutRef.trim() || undefined, adminNote: adminNote.trim() || undefined });
      if (res.success) {
        toast.success(action === 'complete' ? 'Withdrawal marked as paid.' : 'Withdrawal rejected and funds returned.');
        onDone();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="wd-modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="wd-modal">
        <div className="wd-modal__head">
          <h3 className="h5" style={{ margin: 0 }}>Withdrawal Request</h3>
          <button type="button" onClick={onClose} className="wd-modal__close" aria-label="Close">×</button>
        </div>

        <div className="wd-modal__body">
          <DetailRow label="Amount" value={`$${item.amountUSD} USD`} />
          <DetailRow label="Customer" value={user ? `${user.name || '—'} (${user.email || '—'})` : String(item.userId)} />
          <DetailRow label="Method" value={METHOD_LABELS[item.method] || item.method} />
          <DetailRow label="Status" value={statusConfig[item.status]?.label || item.status} />
          <DetailRow label="Requested" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'} />

          <div className="wd-modal__section-title">Payout Details</div>
          <DetailRow label="Bank Name" value={d.bankName} />
          <DetailRow label="Account Name" value={d.accountName} />
          <DetailRow label="Account Number" value={d.accountNumber} mono />
          <DetailRow label="Routing" value={d.routingNumber} mono />
          <DetailRow label="Branch" value={d.branch} />
          <DetailRow label="Wallet Number" value={d.walletNumber} mono />
          <DetailRow label="PayPal Email" value={d.paypalEmail} />

          {item.status !== 'pending' && (
            <>
              <DetailRow label="Payout Ref" value={item.payoutRef} mono />
              <DetailRow label="Admin Note" value={item.adminNote} />
              <DetailRow label="Processed" value={item.processedAt ? new Date(item.processedAt).toLocaleString() : '—'} />
            </>
          )}
        </div>

        {item.status === 'pending' && (
          <div className="wd-modal__actions">
            <label className="wd-field-label">Payout Reference (optional)</label>
            <input className="input" value={payoutRef} onChange={(e) => setPayoutRef(e.target.value)} placeholder="Transaction ID / reference" style={{ marginBottom: '0.75rem' }} />

            <label className="wd-field-label">Admin Note (required to reject)</label>
            <textarea className="input" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} placeholder="Reason / notes" style={{ marginBottom: '1rem', resize: 'vertical' }} />

            <div className="wd-modal__btns">
              <button className="btn btn-primary" onClick={() => handleAction('complete')} disabled={!!busy}>
                {busy === 'complete' ? <><Loader2 size={14} className="spin" /> Processing...</> : 'Mark as Paid'}
              </button>
              <button
                className="btn wd-btn-reject"
                onClick={() => handleAction('reject')}
                disabled={!!busy}
              >
                {busy === 'reject' ? <><Loader2 size={14} className="spin" /> Rejecting...</> : 'Reject & Refund'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminWithdrawals() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 20 });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await listWithdrawals(params);
      if (res.success) {
        setItems(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load withdrawals.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

  return (
    <>
      <SEOHead title="Withdrawals" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpRight size={22} style={{ color: 'var(--color-primary)' }} /> Withdrawals
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>Review and process customer withdrawal requests</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchItems} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <Filter size={15} /> Filters:
          </div>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {meta.total} total requests
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Loader2 size={28} className="spin" />
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              No withdrawal requests found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="wallet-admin__table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const user = item.userId && typeof item.userId === 'object' ? item.userId : null;
                    return (
                      <motion.tr key={item._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.name || '—'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user?.email || String(item.userId)}</div>
                        </td>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>${item.amountUSD}</td>
                        <td style={{ fontSize: 'var(--text-sm)' }}>{METHOD_LABELS[item.method] || item.method}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(item.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(item)} style={{ padding: '0.35rem 0.6rem' }}>
                            <Eye size={14} /> {item.status === 'pending' ? 'Review' : 'View'}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPage > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <span>Page {meta.page} of {meta.totalPage} ({meta.total})</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                  <ChevronLeft size={15} /> Prev
                </button>
                <button className="btn btn-ghost btn-sm" disabled={meta.page >= meta.totalPage} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <WithdrawalModal item={selected} onClose={() => setSelected(null)} onDone={fetchItems} />
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
        .wallet-admin__table { width: 100%; border-collapse: collapse; }
        .wallet-admin__table thead th { text-align: left; padding: 0.85rem 1rem; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
        .wallet-admin__table tbody td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .wallet-admin__table tbody tr:last-child td { border-bottom: none; }
        .wallet-admin__table tbody tr:hover { background: var(--color-bg-tertiary); }

        .wd-modal-overlay {
          position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end;
          justify-content: center; background: rgba(0,0,0,0.5); padding: 0;
        }
        @media (min-width: 560px) {
          .wd-modal-overlay { align-items: center; padding: 1rem; }
        }
        .wd-modal {
          background: var(--color-surface); border: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg); border-radius: 16px 16px 0 0;
          padding: 1.15rem; width: 100%; max-width: 520px;
          max-height: min(92vh, 100dvh); overflow-y: auto;
          padding-bottom: calc(1.15rem + env(safe-area-inset-bottom, 0));
        }
        @media (min-width: 560px) {
          .wd-modal { border-radius: 16px; padding: 1.5rem; max-height: 90vh; }
        }
        .wd-modal__head {
          display: flex; justify-content: space-between; align-items: center;
          gap: 0.75rem; margin-bottom: 1.1rem;
        }
        .wd-modal__close {
          background: var(--color-bg-secondary); border: none; border-radius: 8px;
          width: 32px; height: 32px; cursor: pointer; color: var(--color-text-muted);
          font-size: 1.25rem; line-height: 1; flex-shrink: 0;
        }
        .wd-modal__body {
          display: flex; flex-direction: column; gap: 0.6rem; font-size: var(--text-sm);
        }
        .wd-modal__section-title {
          margin-top: 0.4rem; padding-top: 0.6rem; border-top: 1px solid var(--color-border);
          font-weight: 700; color: var(--color-text-muted); font-size: var(--text-xs);
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .wd-detail-row {
          display: grid; grid-template-columns: minmax(100px, 130px) 1fr; gap: 0.5rem;
        }
        @media (max-width: 420px) {
          .wd-detail-row { grid-template-columns: 1fr; gap: 0.15rem; }
        }
        .wd-detail-row__label { color: var(--color-text-muted); }
        .wd-detail-row__label::after { content: ':'; }
        .wd-detail-row__value { font-weight: 600; word-break: break-word; }
        .wd-modal__actions {
          margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-border);
        }
        .wd-field-label {
          font-size: var(--text-sm); font-weight: 600; display: block; margin-bottom: 0.4rem;
        }
        .wd-modal__btns {
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        @media (min-width: 420px) {
          .wd-modal__btns { flex-direction: row; gap: 0.75rem; }
          .wd-modal__btns .btn { flex: 1; justify-content: center; }
        }
        .wd-btn-reject {
          background: rgba(239,68,68,0.1); color: #dc2626;
          border: 1px solid rgba(239,68,68,0.25); justify-content: center;
        }

        @media (max-width: 640px) {
          .wallet-admin__table thead th,
          .wallet-admin__table tbody td { padding: 0.7rem 0.75rem; }
        }
      `}</style>
    </>
  );
}
