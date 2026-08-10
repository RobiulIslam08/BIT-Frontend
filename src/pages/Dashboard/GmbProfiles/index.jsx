// ============================================
// BIT SOFTWARE — Admin GMB Profiles Management
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  MapPin, RefreshCw, Loader2, AlertCircle, Plus,
  ChevronLeft, ChevronRight, Edit3, Trash2, Search, X,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllGmbProfiles,
  createGmbProfile,
  updateGmbProfile,
  deleteGmbProfile,
  searchGmbProfileUsers,
} from '@/api/gmbProfileApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';

const STATUS_OPTIONS = ['pending', 'in_progress', 'active', 'suspended', 'cancelled'];
const SERVICE_TYPES = ['new', 'recovery', 'regular'];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
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

const emptyForm = {
  userId: '',
  userLabel: '',
  businessName: '',
  category: '',
  hasPhysicalLocation: 'yes',
  streetAddress: '',
  city: '',
  country: '',
  serviceAreas: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  servicesList: '',
  serviceType: 'new',
  status: 'active',
  googleProfileUrl: '',
  placeId: '',
  amountSAR: '',
  notes: '',
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
    if (!q.trim()) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchGmbProfileUsers(q.trim());
        setResults(res?.data || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label className="form-label">Customer *</label>
      <input
        className="input"
        placeholder="Search by name or email..."
        value={term || label || ''}
        onChange={(e) => {
          doSearch(e.target.value);
          if (value) onSelect('', '');
        }}
        onFocus={() => results.length && setOpen(true)}
      />
      {value && label && !term && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Selected: {label}</div>
      )}
      {open && (
        <div style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%', background: 'var(--color-bg-elevated, #fff)', border: '1px solid var(--color-border)', borderRadius: 8, maxHeight: 200, overflow: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          {loading ? (
            <div style={{ padding: 12, fontSize: 13 }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>No users found</div>
          ) : (
            results.map((u) => (
              <button
                key={u._id}
                type="button"
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', border: 0, background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                onClick={() => {
                  onSelect(u._id, `${u.name} (${u.email})`);
                  setTerm('');
                  setOpen(false);
                }}
              >
                <strong>{u.name}</strong>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{u.email}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminGmbProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | profile
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllGmbProfiles({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setProfiles(res.data || []);
        setMeta(res.meta || { page: 1, limit: 20, total: 0, totalPage: 1 });
      } else {
        setError(res.message || 'Failed to load profiles.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load GMB profiles.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (p) => {
    const user = p.userId && typeof p.userId === 'object' ? p.userId : null;
    setForm({
      userId: user?._id || p.userId || '',
      userLabel: user ? `${user.name} (${user.email})` : '',
      businessName: p.businessName || '',
      category: p.category || '',
      hasPhysicalLocation: p.hasPhysicalLocation || 'yes',
      streetAddress: p.streetAddress || '',
      city: p.city || '',
      country: p.country || '',
      serviceAreas: p.serviceAreas || '',
      phone: p.phone || '',
      email: p.email || '',
      website: p.website || '',
      description: p.description || '',
      servicesList: p.servicesList || '',
      serviceType: p.serviceType || 'new',
      status: p.status || 'pending',
      googleProfileUrl: p.googleProfileUrl || '',
      placeId: p.placeId || '',
      amountSAR: p.amountSAR ?? '',
      notes: p.notes || '',
      _id: p._id,
    });
    setModal(p);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.category.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.warning('Business name, category, phone, and email are required.');
      return;
    }
    if (modal === 'create' && !form.userId) {
      toast.warning('Please select a customer.');
      return;
    }

    const payload = {
      businessName: form.businessName.trim(),
      category: form.category.trim(),
      hasPhysicalLocation: form.hasPhysicalLocation,
      streetAddress: form.streetAddress.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      serviceAreas: form.serviceAreas.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim() || undefined,
      description: form.description.trim() || undefined,
      servicesList: form.servicesList.trim() || undefined,
      serviceType: form.serviceType,
      status: form.status,
      googleProfileUrl: form.googleProfileUrl.trim() || undefined,
      placeId: form.placeId.trim() || undefined,
      amountSAR: form.amountSAR === '' ? undefined : Number(form.amountSAR),
      notes: form.notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (modal === 'create') {
        await createGmbProfile({ ...payload, userId: form.userId });
        toast.success('GMB profile assigned.');
      } else {
        const updatePayload = { ...payload };
        if (form.userId) updatePayload.userId = form.userId;
        await updateGmbProfile(form._id, updatePayload);
        toast.success('GMB profile updated.');
      }
      setModal(null);
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this GMB profile? This cannot be undone.')) return;
    try {
      await deleteGmbProfile(id);
      toast.success('Profile deleted.');
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <>
      <SEOHead title="GMB Profiles — Admin" description="Manage customer Google Business Profile assets." />
      <div className="admin-domains">
        <div className="admin-domains__header">
          <div>
            <h1 className="h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} /> GMB Profiles
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Owned customer profiles (separate from GMB Orders)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fetchList} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              <Plus size={14} /> Assign Profile
            </button>
          </div>
        </div>

        <div className="admin-domains__filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Search business, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#dc2626', marginBottom: '1rem', fontSize: 14 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spin" size={28} /></div>
        ) : profiles.length === 0 ? (
          <div className="card-elevated" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No GMB profiles found.
          </div>
        ) : (
          <div className="card-elevated" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Business</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Service</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Source</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const user = p.userId && typeof p.userId === 'object' ? p.userId : null;
                  return (
                    <tr key={p._id} style={{ borderTop: '1px solid var(--color-border, #eee)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700 }}>{p.businessName}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {user ? (
                          <>
                            <div>{user.name}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{user.email}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{p.serviceType}</td>
                      <td style={{ padding: '0.75rem' }}><Badge status={p.status} /></td>
                      <td style={{ padding: '0.75rem', fontSize: 12 }}>{p.source}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(p._id)} title="Delete" style={{ color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 13 }}>Page {meta.page} / {meta.totalPage}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= meta.totalPage} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        {modal && (
          <div className="admin-modal-overlay" onClick={() => !saving && setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.form
              className="card-elevated"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              style={{ width: 'min(640px, 100%)', maxHeight: '90vh', overflow: 'auto', padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="h5" style={{ margin: 0 }}>{modal === 'create' ? 'Assign GMB Profile' : 'Edit GMB Profile'}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)} disabled={saving}><X size={16} /></button>
              </div>

              {modal === 'create' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <UserPicker
                    value={form.userId}
                    label={form.userLabel}
                    onSelect={(id, label) => setForm((f) => ({ ...f, userId: id, userLabel: label }))}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Business name *</label>
                  <input className="input" value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <input className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Service type</label>
                  <select className="input" value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Physical location</label>
                  <select className="input" value={form.hasPhysicalLocation} onChange={(e) => setForm((f) => ({ ...f, hasPhysicalLocation: e.target.value }))}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Phone *</label>
                  <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Street address</label>
                  <input className="input" value={form.streetAddress} onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Service areas</label>
                  <input className="input" value={form.serviceAreas} onChange={(e) => setForm((f) => ({ ...f, serviceAreas: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Google profile URL</label>
                  <input className="input" value={form.googleProfileUrl} onChange={(e) => setForm((f) => ({ ...f, googleProfileUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="form-label">Place ID</label>
                  <input className="input" value={form.placeId} onChange={(e) => setForm((f) => ({ ...f, placeId: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Amount (SAR)</label>
                  <input className="input" type="number" min="0" value={form.amountSAR} onChange={(e) => setForm((f) => ({ ...f, amountSAR: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Website</label>
                  <input className="input" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Admin notes</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="spin" /> : null}
                  {modal === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </div>
    </>
  );
}
