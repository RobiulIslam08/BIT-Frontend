// ============================================
// BIT SOFTWARE — Admin Domain Pricing
// ============================================
// Admin maintains REGISTER (sell) prices only.
// Renew prices always come live from the registrar (Namecheap) per TLD.

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, Plus, RefreshCw, Loader2, AlertCircle, Edit3,
  Trash2, Check, X, Search, ToggleLeft,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllDomainPricing, createDomainPricing, updateDomainPricing, deleteDomainPricing,
} from '@/api/domainPricingApi';
import { toast } from '@/components/common/Toast/Toast';
import './DomainPricing.css';

const emptyForm = {
  tld: '',
  registerPriceUSD: '',
  isActive: true,
  notes: '',
};

function PricingFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => {
    if (!initial?._id) return emptyForm;
    return {
      tld: initial.tld || '',
      registerPriceUSD: initial.registerPriceUSD ?? '',
      isActive: initial.isActive !== false,
      notes: initial.notes || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const tld = form.tld.trim().replace(/^\./, '').toLowerCase();
    const registerPriceUSD = Number(form.registerPriceUSD);
    if (!isEdit && !tld) { setError('TLD is required (e.g. com).'); return; }
    if (!Number.isFinite(registerPriceUSD) || registerPriceUSD < 0) {
      setError('Register price must be a valid number ≥ 0.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateDomainPricing(initial._id, {
          registerPriceUSD,
          isActive: form.isActive,
          notes: form.notes.trim() || null,
        });
        toast.success(`.${initial.tld} register price updated.`);
      } else {
        await createDomainPricing({
          tld,
          registerPriceUSD,
          isActive: form.isActive,
          notes: form.notes.trim() || undefined,
        });
        toast.success(`.${tld} pricing added.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save pricing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dp__modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="dp__modal"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>{isEdit ? `Edit .${initial.tld}` : 'Add TLD Pricing'}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="dp__form-grid">
            <div className="dp__field">
              <label>TLD *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>.</span>
                <input
                  className="input"
                  placeholder="com"
                  value={form.tld}
                  disabled={isEdit}
                  onChange={(e) => set('tld', e.target.value)}
                  style={isEdit ? { opacity: 0.7 } : undefined}
                />
              </div>
            </div>

            <div className="dp__field">
              <label>Status</label>
              <select className="input" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => set('isActive', e.target.value === 'active')}>
                <option value="active">Active (shown on site)</option>
                <option value="inactive">Inactive (hidden)</option>
              </select>
            </div>

            <div className="dp__field dp__field--full">
              <label>Register Price (USD) *</label>
              <input type="number" min="0" step="0.01" className="input" placeholder="15.00" value={form.registerPriceUSD} onChange={(e) => set('registerPriceUSD', e.target.value)} />
              <span className="dp__hint">What the customer pays for a new domain. Renew price is loaded live from the registrar — you do not set it here.</span>
            </div>

            {isEdit && typeof initial.renewPriceUSD === 'number' && (
              <div className="dp__field dp__field--full">
                <label>Current Renew Price (live)</label>
                <div className="dp__live-box">
                  <strong>${Number(initial.renewPriceUSD).toFixed(2)} USD</strong>
                  <span>
                    {initial.renewPriceSource === 'provider'
                      ? 'From registrar API'
                      : 'Fallback (registrar temporarily unavailable)'}
                  </span>
                </div>
              </div>
            )}

            <div className="dp__field dp__field--full">
              <label>Notes (internal)</label>
              <input className="input" placeholder="Optional note for your team" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? <><Loader2 size={15} className="spin" /> Saving…</> : <><Check size={15} /> {isEdit ? 'Save Changes' : 'Add Pricing'}</>}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDomainPricing() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchPricing = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getAllDomainPricing(search ? { search } : {});
      if (res.success) setRows(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pricing.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  const handleDelete = async (row) => {
    if (!window.confirm(`Remove pricing for .${row.tld}? Customers will fall back to the default register price.`)) return;
    try {
      await deleteDomainPricing(row._id);
      toast.success(`.${row.tld} pricing removed.`);
      fetchPricing();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  const handleToggleActive = async (row) => {
    try {
      await updateDomainPricing(row._id, { isActive: !row.isActive });
      toast.success(`.${row.tld} is now ${!row.isActive ? 'active' : 'inactive'}.`);
      fetchPricing();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    }
  };

  const visible = rows.filter((r) => showInactive || r.isActive);

  return (
    <>
      <SEOHead title="Domain Pricing" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={22} style={{ color: 'var(--color-primary)' }} /> Domain Pricing
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>
              Set register (sell) prices — renew prices come live from the registrar for each TLD
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchPricing} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>
              <Plus size={14} /> Add TLD
            </button>
          </div>
        </div>

        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              placeholder="Search TLD…"
              style={{ width: '180px', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem 0.4rem 1.9rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`btn btn-ghost btn-sm${showInactive ? '' : ' dp__filter-active'}`}
            onClick={() => setShowInactive((v) => !v)}
          >
            <ToggleLeft size={14} /> {showInactive ? 'Showing all' : 'Active only'}
          </button>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {visible.length} TLD{visible.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={28} className="spin" /></div>
          ) : visible.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No pricing entries found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dp__table">
                <thead>
                  <tr>
                    <th>TLD</th>
                    <th>Register (USD)</th>
                    <th>Renew (live)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, idx) => (
                    <motion.tr key={row._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}>
                      <td style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>.{row.tld}</td>
                      <td style={{ fontWeight: 700 }}>${Number(row.registerPriceUSD).toFixed(2)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>${Number(row.renewPriceUSD ?? 0).toFixed(2)}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {row.renewPriceSource === 'provider' ? 'Registrar API' : 'Fallback'}
                        </div>
                      </td>
                      <td>
                        <span className={`dp__badge ${row.isActive ? 'dp__badge--on' : 'dp__badge--off'}`}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(row)} style={{ padding: '0.35rem 0.5rem' }} title={row.isActive ? 'Deactivate' : 'Activate'}>
                          {row.isActive ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(row)} style={{ padding: '0.35rem 0.5rem' }} title="Edit"><Edit3 size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row)} style={{ padding: '0.35rem 0.5rem', color: '#dc2626' }} title="Delete"><Trash2 size={14} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ marginTop: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Register = your sell price for new purchases (you set this). Renew = live registrar price for each TLD / domain — customers pay this on renewal.
        </p>
      </div>

      {modal !== null && (
        <PricingFormModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={fetchPricing}
        />
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
