// ============================================
// BIT SOFTWARE — Admin Hosting Plans (catalog)
// ============================================
import { useState, useEffect, useCallback } from 'react';
import {
  Tag, RefreshCw, Loader2, AlertCircle, Plus, Edit3, Trash2, X,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllHostingPlans, createHostingPlan, updateHostingPlan, deleteHostingPlan,
} from '@/api/hostingPlanApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';

const emptyForm = {
  slug: '',
  name: '',
  planType: 'shared',
  monthlyPriceUSD: '',
  yearlyPriceUSD: '',
  featuresText: '',
  popular: false,
  isActive: true,
  sortOrder: 0,
  notes: '',
};

function PlanModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => {
    if (!initial?._id) return emptyForm;
    return {
      slug: initial.slug || '',
      name: initial.name || '',
      planType: initial.planType || 'shared',
      monthlyPriceUSD: initial.monthlyPriceUSD ?? '',
      yearlyPriceUSD: initial.yearlyPriceUSD ?? '',
      featuresText: (initial.features || []).join('\n'),
      popular: !!initial.popular,
      isActive: initial.isActive !== false,
      sortOrder: initial.sortOrder ?? 0,
      notes: initial.notes || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      planType: form.planType,
      monthlyPriceUSD: Number(form.monthlyPriceUSD),
      yearlyPriceUSD: Number(form.yearlyPriceUSD),
      features: form.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
      popular: form.popular,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
      notes: form.notes.trim() || undefined,
    };
    if (!payload.slug || !payload.name) {
      setError('Slug and name are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateHostingPlan(initial._id, payload);
        toast.success('Plan updated.');
      } else {
        await createHostingPlan(payload);
        toast.success('Plan created.');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="domains__modal-overlay" onClick={onClose}>
      <div className="domains__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>{isEdit ? 'Edit Plan' : 'Add Plan'}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="domains__form-grid">
            <div className="domains__field">
              <label>Slug *</label>
              <input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="shared-starter" required disabled={isEdit} />
            </div>
            <div className="domains__field">
              <label>Name *</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="domains__field">
              <label>Type</label>
              <select className="input" value={form.planType} onChange={(e) => set('planType', e.target.value)}>
                <option value="shared">shared</option>
                <option value="vps">vps</option>
              </select>
            </div>
            <div className="domains__field">
              <label>Sort Order</label>
              <input className="input" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
            </div>
            <div className="domains__field">
              <label>Monthly USD *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.monthlyPriceUSD} onChange={(e) => set('monthlyPriceUSD', e.target.value)} required />
            </div>
            <div className="domains__field">
              <label>Yearly USD *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.yearlyPriceUSD} onChange={(e) => set('yearlyPriceUSD', e.target.value)} required />
            </div>
            <div className="domains__field domains__field--full">
              <label>Features (one per line)</label>
              <textarea className="input" rows={4} value={form.featuresText} onChange={(e) => set('featuresText', e.target.value)} />
            </div>
            <div className="domains__field">
              <label><input type="checkbox" checked={form.popular} onChange={(e) => set('popular', e.target.checked)} /> Popular</label>
            </div>
            <div className="domains__field">
              <label><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : null}
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminHostingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllHostingPlans();
      if (res.success) setPlans(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deleteHostingPlan(id);
      toast.success('Plan deleted.');
      fetchPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <>
      <SEOHead title="Hosting Plans — Admin" />
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h1 className="h4" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={22} /> Hosting Plans
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Catalog prices shown on the website and used at checkout
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={fetchPlans} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
              <Plus size={14} /> Add Plan
            </button>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', color: '#dc2626', marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="card-elevated" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="spin" /></div>
          ) : (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Monthly</th>
                  <th>Yearly</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.slug}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.planType}</td>
                    <td>${Number(p.monthlyPriceUSD).toFixed(2)}</td>
                    <td>${Number(p.yearlyPriceUSD).toFixed(2)}</td>
                    <td>
                      {p.isActive ? (
                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>Active</span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>Inactive</span>
                      )}
                      {p.popular && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--color-primary)' }}>Popular</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(p)}><Edit3 size={14} /></button>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <PlanModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchPlans}
        />
      )}
    </>
  );
}
