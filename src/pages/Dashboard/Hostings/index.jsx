// ============================================
// BIT SOFTWARE — Admin Hostings Management
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Server, Filter, RefreshCw, Loader2, AlertCircle, Plus,
  ChevronLeft, ChevronRight, Edit3, Trash2, Search, X,
  Upload, Download, FileArchive,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllHostings, createHosting, updateHosting, deleteHosting,
  searchHostingUsers, uploadHostingProject, removeHostingProject,
} from '@/api/hostingApi';
import { getAllHostingPlans } from '@/api/hostingPlanApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';

const STATUS_OPTIONS = ['active', 'pending', 'expired', 'suspended', 'cancelled'];
const SOURCE_OPTIONS = ['purchase', 'admin_assigned'];
const PLAN_TYPES = ['shared', 'vps'];
const BILLING = ['yearly', 'monthly'];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

function Badge({ status }) {
  const s = statusConfig[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const formatBytes = (n) => {
  if (!n && n !== 0) return '—';
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const emptyForm = {
  userId: '',
  userLabel: '',
  planSlug: '',
  planName: '',
  planType: 'shared',
  billingCycle: 'yearly',
  featuresText: '',
  websiteLabel: '',
  status: 'active',
  startsAt: '',
  expiresAt: '',
  amountUSD: '',
  renewPriceUSD: '',
  notes: '',
  internalProvider: '',
  internalServerNote: '',
};

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
        const res = await searchHostingUsers(q);
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

function HostingFormModal({ initial, catalog, onClose, onSaved }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => {
    if (!initial?._id) return emptyForm;
    const owner = initial.userId || {};
    return {
      userId: owner._id || '',
      userLabel: owner._id ? `${owner.name} · ${owner.email}` : '',
      planSlug: initial.planSlug || '',
      planName: initial.planName || '',
      planType: initial.planType || 'shared',
      billingCycle: initial.billingCycle || 'yearly',
      featuresText: (initial.features || []).join('\n'),
      websiteLabel: initial.websiteLabel || '',
      status: initial.status || 'active',
      startsAt: toDateInput(initial.startsAt),
      expiresAt: toDateInput(initial.expiresAt),
      amountUSD: initial.amountUSD ?? '',
      renewPriceUSD: initial.renewPriceUSD ?? '',
      notes: initial.notes || '',
      internalProvider: initial.internalProvider || '',
      internalServerNote: initial.internalServerNote || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { percent, loaded, total }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const applyCatalogPlan = (slug) => {
    const plan = catalog.find((p) => p.slug === slug);
    if (!plan) return;
    setForm((f) => ({
      ...f,
      planSlug: plan.slug,
      planName: plan.name,
      planType: plan.planType,
      featuresText: (plan.features || []).join('\n'),
      amountUSD: f.billingCycle === 'monthly' ? plan.monthlyPriceUSD : plan.yearlyPriceUSD,
      renewPriceUSD: f.billingCycle === 'monthly' ? plan.monthlyPriceUSD : plan.yearlyPriceUSD,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.userId) { setError('Please select the owner (user).'); return; }
    if (!form.planName.trim()) { setError('Plan name is required.'); return; }

    const features = form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      userId: form.userId,
      planSlug: form.planSlug.trim() || undefined,
      planName: form.planName.trim(),
      planType: form.planType,
      billingCycle: form.billingCycle,
      features,
      websiteLabel: form.websiteLabel.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
      internalProvider: form.internalProvider.trim() || undefined,
      internalServerNote: form.internalServerNote.trim() || undefined,
    };
    if (form.startsAt) payload.startsAt = form.startsAt;
    if (form.expiresAt) payload.expiresAt = form.expiresAt;
    if (form.amountUSD !== '' && form.amountUSD !== null) payload.amountUSD = Number(form.amountUSD);
    if (form.renewPriceUSD !== '' && form.renewPriceUSD !== null) payload.renewPriceUSD = Number(form.renewPriceUSD);

    setSaving(true);
    try {
      if (isEdit) {
        await updateHosting(initial._id, payload);
        toast.success('Hosting updated.');
      } else {
        await createHosting(payload);
        toast.success('Hosting assigned to customer.');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save hosting.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !initial?._id) return;

    const maxBytes = 500 * 1024 * 1024; // 500 MB
    if (file.size > maxBytes) {
      toast.error('File too large. Maximum project ZIP size is 500 MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress({ percent: 0, loaded: 0, total: file.size });
    try {
      await uploadHostingProject(initial._id, file, (p) => setUploadProgress(p));
      toast.success('Project ZIP uploaded.');
      setUploadProgress(null);
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Upload failed.');
      setUploadProgress(null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveProject = async () => {
    if (!initial?._id) return;
    if (!window.confirm('Remove the project file?')) return;
    try {
      await removeHostingProject(initial._id);
      toast.success('Project file removed.');
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove file.');
    }
  };

  return (
    <div className="domains__modal-overlay" onClick={onClose}>
      <motion.div
        className="domains__modal"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 720 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>{isEdit ? 'Edit Hosting' : 'Assign Hosting'}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Customer will see this as their purchased plan. Internal provider notes stay admin-only.
        </p>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
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
              <label>Catalog Plan (optional)</label>
              <select
                className="input"
                value={form.planSlug}
                onChange={(e) => {
                  set('planSlug', e.target.value);
                  if (e.target.value) applyCatalogPlan(e.target.value);
                }}
              >
                <option value="">Custom / pick below</option>
                {catalog.map((p) => (
                  <option key={p._id || p.slug} value={p.slug}>
                    {p.planType} · {p.name} (${p.monthlyPriceUSD}/mo · ${p.yearlyPriceUSD}/yr)
                  </option>
                ))}
              </select>
            </div>

            <div className="domains__field">
              <label>Plan Name *</label>
              <input className="input" value={form.planName} onChange={(e) => set('planName', e.target.value)} required />
            </div>
            <div className="domains__field">
              <label>Plan Type *</label>
              <select className="input" value={form.planType} onChange={(e) => set('planType', e.target.value)}>
                {PLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="domains__field">
              <label>Billing Cycle</label>
              <select className="input" value={form.billingCycle} onChange={(e) => set('billingCycle', e.target.value)}>
                {BILLING.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="domains__field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="domains__field">
              <label>Website / Project Label</label>
              <input className="input" value={form.websiteLabel} onChange={(e) => set('websiteLabel', e.target.value)} placeholder="example.com" />
            </div>
            <div className="domains__field">
              <label>Amount (USD)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amountUSD} onChange={(e) => set('amountUSD', e.target.value)} />
            </div>
            <div className="domains__field">
              <label>Starts At</label>
              <input className="input" type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            </div>
            <div className="domains__field">
              <label>Expires At</label>
              <input className="input" type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
            </div>
            <div className="domains__field domains__field--full">
              <label>Features (one per line — shown to customer)</label>
              <textarea className="input" rows={4} value={form.featuresText} onChange={(e) => set('featuresText', e.target.value)} />
            </div>
            <div className="domains__field domains__field--full">
              <label>Admin Notes (hidden from customer)</label>
              <textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
            <div className="domains__field">
              <label>Internal Provider (admin only)</label>
              <input className="input" value={form.internalProvider} onChange={(e) => set('internalProvider', e.target.value)} placeholder="Never shown to customer" />
            </div>
            <div className="domains__field">
              <label>Internal Server Note</label>
              <input className="input" value={form.internalServerNote} onChange={(e) => set('internalServerNote', e.target.value)} />
            </div>
          </div>

          {isEdit && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: 12, background: 'var(--color-bg-secondary)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileArchive size={15} /> Project ZIP
              </div>
              {initial.projectFile?.originalName ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    {initial.projectFile.originalName} ({formatBytes(initial.projectFile.size)})
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemoveProject}>Remove</button>
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>No project file uploaded yet.</p>
              )}
              <label className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem', cursor: uploading ? 'wait' : 'pointer' }}>
                {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                {uploading
                  ? `Uploading ${uploadProgress?.percent ?? 0}%…`
                  : 'Upload ZIP'}
                <input type="file" accept=".zip,.rar,.7z,.tar,.gz" hidden disabled={uploading} onChange={handleUpload} />
              </label>
              {uploading && uploadProgress && (
                <div style={{ marginTop: '0.65rem' }}>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress.percent}%`,
                        background: 'var(--color-primary)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    {formatBytes(uploadProgress.loaded)} / {formatBytes(uploadProgress.total)}
                    {' · '}
                    Do not close this tab — large ZIPs upload in small chunks (works behind Traefik).
                  </p>
                </div>
              )}
              {!uploading && (
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Max 500 MB · uploads in 5 MB chunks (stable on VPS / Dokploy)
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : null}
              {isEdit ? 'Save Changes' : 'Assign Hosting'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminHostings() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '', planType: '', search: '' });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | hosting obj
  const [catalog, setCatalog] = useState([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllHostings({
        page,
        limit: 20,
        status: filters.status || undefined,
        source: filters.source || undefined,
        planType: filters.planType || undefined,
        search: filters.search || undefined,
      });
      if (res.success) {
        setItems(res.data || []);
        setMeta(res.meta || { page: 1, limit: 20, total: 0, totalPage: 1 });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load hostings.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllHostingPlans({ isActive: true });
        if (res.success) setCatalog(res.data || []);
      } catch {
        setCatalog([]);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hosting record?')) return;
    try {
      await deleteHosting(id);
      toast.success('Hosting deleted.');
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <>
      <SEOHead title="Hostings — Admin" />
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h1 className="h4" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={22} /> Hostings
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Assign hosting to existing clients and manage project files
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fetchList} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
              <Plus size={14} /> Assign Hosting
            </button>
          </div>
        </div>

        <div className="card-elevated" style={{ padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
          <select className="input" style={{ width: 'auto', minWidth: 120 }} value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
            <option value="">All status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 120 }} value={filters.source} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, source: e.target.value })); }}>
            <option value="">All sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 120 }} value={filters.planType} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, planType: e.target.value })); }}>
            <option value="">All types</option>
            {PLAN_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="input"
            placeholder="Search plan / website…"
            value={filters.search}
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }}
            style={{ flex: 1, minWidth: 160 }}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#dc2626', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="card-elevated" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <Loader2 size={28} className="spin" />
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No hostings found.</div>
          ) : (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Project</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{h.userId?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{h.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{h.planName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {h.planType} · {h.billingCycle} · {h.source?.replace('_', ' ')}
                      </div>
                    </td>
                    <td>{h.websiteLabel || '—'}</td>
                    <td><Badge status={h.status} /></td>
                    <td>{formatDate(h.expiresAt)}</td>
                    <td>
                      {h.projectFile?.originalName ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a' }}>
                          <Download size={12} /> Yes
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(h)} title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(h._id)} title="Delete" style={{ color: '#ef4444' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {meta.totalPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 'var(--text-sm)' }}>Page {meta.page} / {meta.totalPage}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= meta.totalPage} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {modal && (
        <HostingFormModal
          initial={modal === 'create' ? null : modal}
          catalog={catalog}
          onClose={() => setModal(null)}
          onSaved={fetchList}
        />
      )}
    </>
  );
}
