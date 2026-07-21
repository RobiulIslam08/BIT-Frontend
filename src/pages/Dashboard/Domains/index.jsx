// ============================================
// BIT SOFTWARE — Admin Domains Management
// ============================================
// Admin adds legacy/other domains and assigns them to users, edits details,
// toggles auto-renew, and can run the auto-renew engine on demand.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Filter, RefreshCw, Loader2, AlertCircle, Plus,
  ChevronLeft, ChevronRight, Edit3, Trash2, Search, X, Zap, Check,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllDomains, createDomain, updateDomain, deleteDomain,
  searchUsers, runRenewalEngine,
} from '@/api/domainsApi';
import { toast } from '@/components/common/Toast/Toast';
import './Domains.css';

const STATUS_OPTIONS = ['active', 'expired', 'pending', 'cancelled', 'transferred_out'];
const SOURCE_OPTIONS = ['purchase', 'admin_assigned'];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  transferred_out: { label: 'Transferred', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
};

function Badge({ status }) {
  const s = statusConfig[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <label className="domains__switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="domains__switch-track" />
      {label && <span style={{ fontSize: 'var(--text-sm)' }}>{label}</span>}
    </label>
  );
}

// ─── Settings-style toggle row (label + description left, switch right) ───
function ToggleRow({ checked, onChange, label, desc }) {
  return (
    <label className={`domains__toggle-row${checked ? ' is-on' : ''}`}>
      <span className="domains__toggle-text">
        <span className="domains__toggle-label">{label}</span>
        {desc && <span className="domains__toggle-desc">{desc}</span>}
      </span>
      <span className="domains__switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="domains__switch-track" />
      </span>
    </label>
  );
}

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const emptyForm = {
  userId: '',
  userLabel: '',
  domainName: '',
  registrar: '',
  managedByNamecheap: false,
  status: 'active',
  registeredAt: '',
  expiresAt: '',
  registrationYears: 1,
  renewPriceUSD: '',
  autoRenew: false,
  whoisPrivacy: true,
  nameservers: '',
  notes: '',
};

// ─── User picker (search + select) ───
function UserPicker({ value, label, onSelect }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef();

  const doSearch = (q) => {
    setTerm(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUsers(q);
        if (res.success) setResults(res.data || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="domains__field domains__field--full">
      <label>Owner (User) *</label>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-bg-secondary)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{label}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSelect('', '')} style={{ padding: '0.2rem 0.4rem' }}>
            <X size={14} /> Change
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              placeholder="Search user by name or email"
              value={term}
              onChange={(e) => doSearch(e.target.value)}
              onFocus={() => term && setOpen(true)}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
          {open && (
            <div className="domains__user-results">
              {loading ? (
                <div className="domains__user-result" style={{ color: 'var(--color-text-muted)' }}>Searching…</div>
              ) : results.length === 0 ? (
                <div className="domains__user-result" style={{ color: 'var(--color-text-muted)' }}>No users found.</div>
              ) : (
                results.map((u) => (
                  <div
                    key={u._id}
                    className="domains__user-result"
                    onClick={() => { onSelect(u._id, `${u.name} · ${u.email}`); setOpen(false); setTerm(''); }}
                  >
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Add / Edit modal ───
function DomainFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => {
    if (!initial?._id) return emptyForm;
    const owner = initial.userId || {};
    return {
      userId: owner._id || '',
      userLabel: owner._id ? `${owner.name} · ${owner.email}` : '',
      domainName: initial.domainName || '',
      registrar: initial.registrar || '',
      managedByNamecheap: !!initial.managedByNamecheap,
      status: initial.status || 'active',
      registeredAt: toDateInput(initial.registeredAt),
      expiresAt: toDateInput(initial.expiresAt),
      registrationYears: initial.registrationYears || 1,
      renewPriceUSD: initial.renewPriceUSD ?? '',
      autoRenew: !!initial.autoRenew,
      whoisPrivacy: initial.whoisPrivacy ?? true,
      nameservers: (initial.nameservers || []).join(', '),
      notes: initial.notes || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.userId) { setError('Please select the owner (user).'); return; }
    if (!form.domainName.trim()) { setError('Domain name is required.'); return; }

    const payload = {
      userId: form.userId,
      domainName: form.domainName.trim().toLowerCase(),
      registrar: form.registrar.trim() || undefined,
      managedByNamecheap: form.managedByNamecheap,
      status: form.status,
      registrationYears: Number(form.registrationYears) || 1,
      autoRenew: form.autoRenew,
      whoisPrivacy: form.whoisPrivacy,
      notes: form.notes.trim() || undefined,
    };
    if (form.registeredAt) payload.registeredAt = form.registeredAt;
    if (form.expiresAt) payload.expiresAt = form.expiresAt;
    if (form.renewPriceUSD !== '' && form.renewPriceUSD !== null) {
      payload.renewPriceUSD = Number(form.renewPriceUSD);
    }
    const ns = form.nameservers
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    payload.nameservers = ns;

    setSaving(true);
    try {
      if (isEdit) {
        await updateDomain(initial._id, payload);
        toast.success('Domain updated.');
      } else {
        await createDomain(payload);
        toast.success('Domain added.');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save domain.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="domains__modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="domains__modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>{isEdit ? 'Edit Domain' : 'Add Domain'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="domains__form-grid">
            <UserPicker
              value={form.userId}
              label={form.userLabel}
              onSelect={(id, lbl) => setForm((f) => ({ ...f, userId: id, userLabel: lbl }))}
            />

            <div className="domains__field domains__field--full">
              <label>Domain Name *</label>
              <input className="input" placeholder="example.com" value={form.domainName} onChange={(e) => set('domainName', e.target.value)} />
            </div>

            <div className="domains__field">
              <label>Registrar</label>
              <input className="input" placeholder="e.g. GoDaddy, BIT" value={form.registrar} onChange={(e) => set('registrar', e.target.value)} />
            </div>

            <div className="domains__field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
              </select>
            </div>

            <div className="domains__field">
              <label>Registered Date</label>
              <input type="date" className="input" value={form.registeredAt} onChange={(e) => set('registeredAt', e.target.value)} />
            </div>

            <div className="domains__field">
              <label>Expiry Date</label>
              <input type="date" className="input" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
            </div>

            <div className="domains__field">
              <label>Registration Years</label>
              <input type="number" min="1" max="10" className="input" value={form.registrationYears} onChange={(e) => set('registrationYears', e.target.value)} />
            </div>

            <div className="domains__field">
              <label>Renewal Fee (USD)</label>
              <input
                type="number" min="0" step="0.01" className="input"
                placeholder={form.managedByNamecheap ? 'Auto (leave blank)' : 'e.g. 14.99'}
                value={form.renewPriceUSD}
                onChange={(e) => set('renewPriceUSD', e.target.value)}
              />
            </div>

            <div className="domains__field domains__field--full">
              <label>Nameservers (comma separated)</label>
              <input className="input" placeholder="ns1.example.com, ns2.example.com" value={form.nameservers} onChange={(e) => set('nameservers', e.target.value)} />
            </div>

            <div className="domains__field domains__field--full domains__toggles">
              <ToggleRow
                checked={form.managedByNamecheap}
                onChange={(v) => set('managedByNamecheap', v)}
                label="Managed by us"
                desc="Automatic pricing & renewal"
              />
              <ToggleRow
                checked={form.autoRenew}
                onChange={(v) => set('autoRenew', v)}
                label="Auto-renew"
                desc="Renew automatically before expiry"
              />
              <ToggleRow
                checked={form.whoisPrivacy}
                onChange={(v) => set('whoisPrivacy', v)}
                label="WHOIS privacy"
                desc="Hide personal contact info from public"
              />
            </div>

            <div className="domains__field domains__field--full">
              <label>Internal Notes (not shown to customer)</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? <><Loader2 size={15} className="spin" /> Saving…</> : <><Check size={15} /> {isEdit ? 'Save Changes' : 'Add Domain'}</>}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDomains() {
  const [domains, setDomains] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '', search: '', page: 1, limit: 20 });
  const [modal, setModal] = useState(null); // null | {} (new) | domain (edit)
  const [running, setRunning] = useState(false);

  const fetchDomains = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await getAllDomains(params);
      if (res.success) {
        setDomains(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load domains.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const handleDelete = async (domain) => {
    if (!window.confirm(`Remove "${domain.domainName}" from the system? This cannot be undone.`)) return;
    try {
      await deleteDomain(domain._id);
      toast.success('Domain removed.');
      fetchDomains();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  const handleRunEngine = async () => {
    setRunning(true);
    try {
      const res = await runRenewalEngine();
      const s = res.data || {};
      const cleaned = s.abandonedSwept ? `, cleaned ${s.abandonedSwept} abandoned` : '';
      toast.success(`Renewal engine done — renewed ${s.renewed || 0}, notified ${s.notified || 0}, failed ${s.failed || 0}${cleaned}.`);
      fetchDomains();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to run renewal engine.');
    } finally {
      setRunning(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

  return (
    <>
      <SEOHead title="Domains" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={22} style={{ color: 'var(--color-primary)' }} /> Domains
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>Add legacy domains, assign to users, and manage renewals</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleRunEngine} disabled={running} title="Process due auto-renewals now">
              <Zap size={14} className={running ? 'spin' : ''} /> Run Auto-Renew
            </button>
            <button className="btn btn-secondary btn-sm" onClick={fetchDomains} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({})}>
              <Plus size={14} /> Add Domain
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <Filter size={15} /> Filters:
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              placeholder="Search domain…"
              style={{ width: '200px', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem 0.4rem 1.9rem' }}
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value, page: 1 }))}>
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s === 'purchase' ? 'Purchased' : 'Admin Added'}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {meta.total} total
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
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={28} className="spin" /></div>
          ) : domains.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No domains found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="domains__table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Owner</th>
                    <th>Source</th>
                    <th>Registrar</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Auto-Renew</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d, idx) => (
                    <motion.tr key={d._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{d.domainName}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.userId?.name || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{d.userId?.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: d.source === 'purchase' ? '#16a34a' : '#6366f1' }}>
                          {d.source === 'purchase' ? 'Purchased' : 'Admin Added'}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)' }}>{d.registrar || '—'}</td>
                      <td><Badge status={d.status} /></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(d.expiresAt)}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: d.autoRenew ? '#16a34a' : '#9ca3af' }}>
                          {d.autoRenew ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(d)} style={{ padding: '0.35rem 0.5rem' }} title="Edit"><Edit3 size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(d)} style={{ padding: '0.35rem 0.5rem', color: '#dc2626' }} title="Delete"><Trash2 size={14} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPage > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <span>Page {meta.page} of {meta.totalPage} ({meta.total})</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}><ChevronLeft size={15} /> Prev</button>
                <button className="btn btn-ghost btn-sm" disabled={meta.page >= meta.totalPage} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next <ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <DomainFormModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={fetchDomains}
        />
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
