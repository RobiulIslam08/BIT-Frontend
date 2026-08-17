// ============================================
// BIT SOFTWARE — Admin Business Emails (assets)
// ============================================
import { useCallback, useEffect, useState } from 'react';
import {
  Mail, RefreshCw, Loader2, AlertCircle, Plus, Edit3, Trash2, X, Search,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllEmails, createEmail, updateEmail, deleteEmail, searchEmailUsers,
} from '@/api/emailsApi';
import { getAllEmailPlans } from '@/api/emailPlanApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';

const emptyForm = {
  userId: '',
  userLabel: '',
  planSlug: '',
  planName: '',
  billingCycle: 'yearly',
  featuresText: '',
  businessName: '',
  country: '',
  domainName: '',
  adminFirstName: '',
  adminLastName: '',
  desiredEmailLocalPart: '',
  recoveryEmail: '',
  customerPhone: '',
  status: 'active',
  provisioningStatus: 'pending_setup',
  amountUSD: '',
  renewPriceUSD: '',
  primaryEmail: '',
  webmailUrl: '',
  webmailUsername: '',
  webmailPassword: '',
  notes: '',
  internalProvider: '',
  internalAccountNote: '',
};

function EmailModal({ initial, plans, onClose, onSaved }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => {
    if (!initial?._id) return emptyForm;
    return {
      ...emptyForm,
      userId: initial.userId?._id || initial.userId || '',
      userLabel: initial.userId?.email || '',
      planSlug: initial.planSlug || '',
      planName: initial.planName || '',
      billingCycle: initial.billingCycle || 'yearly',
      featuresText: (initial.features || []).join('\n'),
      businessName: initial.businessName || '',
      country: initial.country || '',
      domainName: initial.domainName || '',
      adminFirstName: initial.adminFirstName || '',
      adminLastName: initial.adminLastName || '',
      desiredEmailLocalPart: initial.desiredEmailLocalPart || '',
      recoveryEmail: initial.recoveryEmail || '',
      customerPhone: initial.customerPhone || '',
      status: initial.status || 'active',
      provisioningStatus: initial.provisioningStatus || 'pending_setup',
      amountUSD: initial.amountUSD ?? '',
      renewPriceUSD: initial.renewPriceUSD ?? '',
      primaryEmail: initial.primaryEmail || '',
      webmailUrl: initial.webmailUrl || '',
      webmailUsername: initial.webmailUsername || '',
      webmailPassword: '',
      notes: initial.notes || '',
      internalProvider: initial.internalProvider || '',
      internalAccountNote: initial.internalAccountNote || '',
    };
  });
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!userQuery.trim() || userQuery.trim().length < 2) {
      setUserResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await searchEmailUsers(userQuery.trim());
        if (res.success) setUserResults(res.data || []);
      } catch { setUserResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [userQuery]);

  const applyPlan = (slug) => {
    const p = plans.find((x) => x.slug === slug);
    if (!p) return;
    setForm((f) => ({
      ...f,
      planSlug: p.slug,
      planName: p.name,
      featuresText: (p.features || []).join('\n'),
      amountUSD: f.billingCycle === 'monthly' ? p.monthlyPriceUSD : p.yearlyPriceUSD,
      renewPriceUSD: f.billingCycle === 'monthly' ? p.monthlyPriceUSD : p.yearlyPriceUSD,
    }));
  };

  const onBillingChange = (cycle) => {
    setForm((f) => {
      const p = plans.find((x) => x.slug === f.planSlug);
      if (!p) return { ...f, billingCycle: cycle };
      return {
        ...f,
        billingCycle: cycle,
        amountUSD: cycle === 'monthly' ? p.monthlyPriceUSD : p.yearlyPriceUSD,
        renewPriceUSD: cycle === 'monthly' ? p.monthlyPriceUSD : p.yearlyPriceUSD,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.userId) {
      setError('Select a user.');
      return;
    }
    if (!form.planName.trim()) {
      setError('Plan name is required.');
      return;
    }
    const payload = {
      userId: form.userId,
      planSlug: form.planSlug || undefined,
      planName: form.planName.trim(),
      billingCycle: form.billingCycle,
      features: form.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
      businessName: form.businessName.trim() || undefined,
      country: form.country.trim() || undefined,
      domainName: form.domainName.trim() || undefined,
      adminFirstName: form.adminFirstName.trim() || undefined,
      adminLastName: form.adminLastName.trim() || undefined,
      desiredEmailLocalPart: form.desiredEmailLocalPart.trim() || undefined,
      recoveryEmail: form.recoveryEmail.trim() || undefined,
      customerPhone: form.customerPhone.trim() || undefined,
      status: form.status,
      provisioningStatus: form.provisioningStatus,
      amountUSD: form.amountUSD === '' ? undefined : Number(form.amountUSD),
      renewPriceUSD: form.renewPriceUSD === '' ? undefined : Number(form.renewPriceUSD),
      primaryEmail: form.primaryEmail.trim() || undefined,
      webmailUrl: form.webmailUrl.trim() || undefined,
      webmailUsername: form.webmailUsername.trim() || undefined,
      notes: form.notes.trim() || undefined,
      internalProvider: form.internalProvider.trim() || undefined,
      internalAccountNote: form.internalAccountNote.trim() || undefined,
    };
    if (form.webmailPassword.trim()) payload.webmailPassword = form.webmailPassword.trim();

    setSaving(true);
    try {
      if (isEdit) {
        await updateEmail(initial._id, payload);
        toast.success('Updated.');
      } else {
        await createEmail(payload);
        toast.success('Assigned.');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="domains__modal-overlay" onClick={onClose}>
      <div className="domains__modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>{isEdit ? 'Edit / Provision Email' : 'Assign Business Email'}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, display: 'flex', gap: 8 }}><AlertCircle size={16} />{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="domains__form-grid">
            {!isEdit && (
              <div className="domains__field domains__field--full">
                <label>User *</label>
                <input className="input" placeholder="Search name or email…" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                {form.userLabel && <small>Selected: {form.userLabel}</small>}
                {userResults.length > 0 && (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, marginTop: 6, maxHeight: 140, overflow: 'auto' }}>
                    {userResults.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', border: 0, background: 'transparent', cursor: 'pointer' }}
                        onClick={() => { set('userId', u._id); set('userLabel', `${u.name} <${u.email}>`); setUserQuery(''); setUserResults([]); }}
                      >
                        {u.name} — {u.email}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="domains__field">
              <label>Catalog plan</label>
              <select className="input" value={form.planSlug} onChange={(e) => applyPlan(e.target.value)}>
                <option value="">Custom</option>
                {plans.map((p) => <option key={p._id} value={p.slug}>{p.name}</option>)}
              </select>
            </div>
            <div className="domains__field"><label>Plan name *</label><input className="input" value={form.planName} onChange={(e) => set('planName', e.target.value)} required /></div>
            <div className="domains__field">
              <label>Billing</label>
              <select className="input" value={form.billingCycle} onChange={(e) => onBillingChange(e.target.value)}>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>
            </div>
            <div className="domains__field">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {['active', 'pending', 'expired', 'suspended', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="domains__field"><label>Business</label><input className="input" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} /></div>
            <div className="domains__field"><label>Domain</label><input className="input" value={form.domainName} onChange={(e) => set('domainName', e.target.value)} /></div>
            <div className="domains__field"><label>Desired local-part</label><input className="input" value={form.desiredEmailLocalPart} onChange={(e) => set('desiredEmailLocalPart', e.target.value)} /></div>
            <div className="domains__field"><label>Country</label><input className="input" value={form.country} onChange={(e) => set('country', e.target.value)} /></div>
            <div className="domains__field"><label>Admin first</label><input className="input" value={form.adminFirstName} onChange={(e) => set('adminFirstName', e.target.value)} /></div>
            <div className="domains__field"><label>Admin last</label><input className="input" value={form.adminLastName} onChange={(e) => set('adminLastName', e.target.value)} /></div>
            <div className="domains__field"><label>Recovery email</label><input className="input" value={form.recoveryEmail} onChange={(e) => set('recoveryEmail', e.target.value)} /></div>
            <div className="domains__field"><label>Phone</label><input className="input" value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} /></div>

            <div className="domains__field domains__field--full" style={{ marginTop: 8 }}>
              <strong>Handover credentials (customer-facing)</strong>
            </div>
            <div className="domains__field">
              <label>Provisioning</label>
              <select className="input" value={form.provisioningStatus} onChange={(e) => set('provisioningStatus', e.target.value)}>
                <option value="pending_setup">pending_setup</option>
                <option value="ready">ready</option>
              </select>
            </div>
            <div className="domains__field"><label>Primary email</label><input className="input" value={form.primaryEmail} onChange={(e) => set('primaryEmail', e.target.value)} /></div>
            <div className="domains__field"><label>Webmail URL</label><input className="input" value={form.webmailUrl} onChange={(e) => set('webmailUrl', e.target.value)} placeholder="https://…" /></div>
            <div className="domains__field"><label>Webmail username</label><input className="input" value={form.webmailUsername} onChange={(e) => set('webmailUsername', e.target.value)} /></div>
            <div className="domains__field"><label>Webmail password {isEdit ? '(leave blank to keep)' : ''}</label><input className="input" type="password" value={form.webmailPassword} onChange={(e) => set('webmailPassword', e.target.value)} /></div>
            <div className="domains__field"><label>Amount USD</label><input className="input" type="number" min="0" step="0.01" value={form.amountUSD} onChange={(e) => set('amountUSD', e.target.value)} /></div>
            <div className="domains__field"><label>Renew USD</label><input className="input" type="number" min="0" step="0.01" value={form.renewPriceUSD} onChange={(e) => set('renewPriceUSD', e.target.value)} /></div>
            <div className="domains__field domains__field--full"><label>Features (one per line)</label><textarea className="input" rows={3} value={form.featuresText} onChange={(e) => set('featuresText', e.target.value)} /></div>

            <div className="domains__field domains__field--full" style={{ marginTop: 8 }}>
              <strong>Internal only (never shown to customer)</strong>
            </div>
            <div className="domains__field"><label>Internal provider</label><input className="input" value={form.internalProvider} onChange={(e) => set('internalProvider', e.target.value)} /></div>
            <div className="domains__field domains__field--full"><label>Internal note</label><textarea className="input" rows={2} value={form.internalAccountNote} onChange={(e) => set('internalAccountNote', e.target.value)} /></div>
            <div className="domains__field domains__field--full"><label>Admin notes</label><textarea className="input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="spin" size={14} /> : null}
              {isEdit ? 'Save' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminEmails() {
  const [emails, setEmails] = useState([]);
  const [plans, setPlans] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPage: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllEmails({ page, limit: 20, search: search || undefined });
      if (res.success) {
        setEmails(res.data || []);
        setMeta(res.meta || { page: 1, totalPage: 1, total: 0 });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllEmailPlans({ isActive: true });
        if (res.success) setPlans(res.data || []);
      } catch { /* ignore */ }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Business Email subscription?')) return;
    try {
      await deleteEmail(id);
      toast.success('Deleted.');
      fetchList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <>
      <SEOHead title="Business Emails — Admin" />
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h1 className="h4" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={22} /> Business Emails</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Assign, provision, and hand over customer mailboxes
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={14} />
              <input className="input" style={{ width: 180 }} placeholder="Search…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fetchList}><RefreshCw size={14} /> Refresh</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal('create')}><Plus size={14} /> Assign</button>
          </div>
        </div>

        {error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{error}</div>}

        <div className="card-elevated" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spin" size={28} /></div>
          ) : emails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No Business Email subscriptions yet.</div>
          ) : (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan / Domain</th>
                  <th>Provision</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.userId?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{e.userId?.email}</div>
                    </td>
                    <td>
                      <div>{e.planName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {e.desiredEmailLocalPart && e.domainName
                          ? `${e.desiredEmailLocalPart}@${e.domainName}`
                          : (e.domainName || e.primaryEmail || '—')}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{e.provisioningStatus}</td>
                    <td style={{ fontSize: 12 }}>{e.status}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(e)}><Edit3 size={14} /></button>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(e._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
          <span>Total: {meta.total || 0}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {meta.page || page}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={(meta.page || page) >= (meta.totalPage || 1)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {modal && (
        <EmailModal
          initial={modal === 'create' ? null : modal}
          plans={plans}
          onClose={() => setModal(null)}
          onSaved={fetchList}
        />
      )}
    </>
  );
}
