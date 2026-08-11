// ============================================
// BIT SOFTWARE — Admin Digital Services Dashboard
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Package, ShoppingCart, RefreshCw, Loader2, AlertCircle,
  Filter, ChevronLeft, ChevronRight, X, Save,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  getAllDigitalServices,
  updateDigitalServiceAdmin,
  getAllDigitalServiceOrders,
  updateDigitalServiceOrder,
} from '@/api/digitalServiceApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';
import './Services.css';

const ASSET_STATUSES = ['active', 'pending', 'expired', 'suspended', 'cancelled'];
const ORDER_STATUSES = ['pending_payment', 'processing', 'active', 'failed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PACKAGE_TYPES = ['trial', 'monthly', 'yearly'];

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const customerName = (userId) => {
  if (!userId) return '—';
  if (typeof userId === 'object') return userId.name || userId.email || '—';
  return String(userId);
};

const customerEmail = (userId, fallback) => {
  if (userId && typeof userId === 'object') return userId.email || fallback || '';
  return fallback || '';
};

export default function DashboardServices() {
  const [tab, setTab] = useState('subscriptions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPage: 1, total: 0 });
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    orderStatus: '',
    paymentStatus: '',
    packageType: '',
    search: '',
  });
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'subscriptions') {
        const res = await getAllDigitalServices({
          page,
          limit: 20,
          status: filters.status || undefined,
          packageType: filters.packageType || undefined,
          search: filters.search || undefined,
        });
        if (res.success) {
          setRows(res.data || []);
          setMeta(res.meta || { page: 1, totalPage: 1, total: 0 });
        }
      } else {
        const res = await getAllDigitalServiceOrders({
          page,
          limit: 20,
          orderStatus: filters.orderStatus || undefined,
          paymentStatus: filters.paymentStatus || undefined,
          packageType: filters.packageType || undefined,
          search: filters.search || undefined,
        });
        if (res.success) {
          setRows(res.data || []);
          setMeta(res.meta || { page: 1, totalPage: 1, total: 0 });
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [tab, page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      status: item.status || 'active',
      portalUrl: item.portalUrl || '',
      accessNotes: item.accessNotes || '',
      notes: item.notes || '',
      startsAt: item.startsAt ? String(item.startsAt).slice(0, 10) : '',
      expiresAt: item.expiresAt ? String(item.expiresAt).slice(0, 10) : '',
    });
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDigitalServiceAdmin(editItem._id, {
        status: editForm.status,
        portalUrl: editForm.portalUrl,
        accessNotes: editForm.accessNotes,
        notes: editForm.notes,
        startsAt: editForm.startsAt || undefined,
        expiresAt: editForm.expiresAt || undefined,
      });
      toast.success('Service updated.');
      setEditItem(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const patchOrder = async (id, field, value) => {
    try {
      await updateDigitalServiceOrder(id, { [field]: value });
      toast.success('Order updated.');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    }
  };

  const switchTab = (next) => {
    setTab(next);
    setPage(1);
    setError('');
  };

  return (
    <>
      <SEOHead title="Services — Admin" />
      <div className="admin-services">
        <div className="admin-services__header">
          <div>
            <h1 className="h4">
              <Package size={22} /> Services
            </h1>
            <p>Manage digital service subscriptions &amp; orders (packages are fixed in code)</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="admin-services__tabs">
          <button
            type="button"
            className={`btn btn-sm ${tab === 'subscriptions' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => switchTab('subscriptions')}
          >
            <Package size={14} /> Subscriptions
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => switchTab('orders')}
          >
            <ShoppingCart size={14} /> Orders
          </button>
        </div>

        <div className="card-elevated admin-services__filters">
          <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
          {tab === 'subscriptions' ? (
            <select
              className="input"
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, status: e.target.value }));
              }}
            >
              <option value="">All status</option>
              {ASSET_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <>
              <select
                className="input"
                value={filters.orderStatus}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, orderStatus: e.target.value }));
                }}
              >
                <option value="">All order status</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="input"
                value={filters.paymentStatus}
                onChange={(e) => {
                  setPage(1);
                  setFilters((f) => ({ ...f, paymentStatus: e.target.value }));
                }}
              >
                <option value="">All payment</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}
          <select
            className="input"
            value={filters.packageType}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, packageType: e.target.value }));
            }}
          >
            <option value="">All packages</option>
            {PACKAGE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            className="input admin-services__search"
            placeholder="Search…"
            value={filters.search}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, search: e.target.value }));
            }}
          />
        </div>

        {error && (
          <div className="admin-services__error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="card-elevated admin-services__table-card">
          {loading ? (
            <div className="admin-services__loading">
              <Loader2 size={28} className="spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="admin-services__empty">
              No {tab === 'subscriptions' ? 'subscriptions' : 'orders'} yet.
            </div>
          ) : tab === 'subscriptions' ? (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Portal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="admin-services__customer-name">{customerName(item.userId)}</div>
                      <div className="admin-services__customer-email">{customerEmail(item.userId)}</div>
                    </td>
                    <td className="admin-services__strong">{item.serviceName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.packageLabel || item.packageType}</td>
                    <td>
                      <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="admin-services__period">
                      {formatDate(item.startsAt)} → {formatDate(item.expiresAt)}
                    </td>
                    <td>{item.amountSAR != null ? `${item.amountSAR} SAR` : '—'}</td>
                    <td className="admin-services__portal-cell" title={item.portalUrl || ''}>
                      {item.portalUrl || '—'}
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o._id}>
                    <td className="admin-services__order-id">{o.orderId}</td>
                    <td>
                      <div className="admin-services__customer-name">{o.customerName}</div>
                      <div className="admin-services__customer-email">{o.customerEmail}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{o.serviceName}</div>
                      <div className="admin-services__muted">
                        {o.packageLabel} · {o.paymentMethod}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{o.amountSAR} SAR</div>
                      <div className="admin-services__muted">${Number(o.amountUSD).toFixed(2)}</div>
                    </td>
                    <td>
                      <select
                        className="input admin-services__select-sm"
                        value={o.paymentStatus}
                        onChange={(e) => patchOrder(o._id, 'paymentStatus', e.target.value)}
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="input admin-services__select-sm"
                        value={o.orderStatus}
                        onChange={(e) => patchOrder(o._id, 'orderStatus', e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {meta.totalPage > 1 && (
          <div className="admin-services__pagination">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 'var(--text-sm)' }}>Page {meta.page} / {meta.totalPage}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={page >= meta.totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {editItem && (
        <div className="domains__modal-overlay" onClick={() => !saving && setEditItem(null)}>
          <div className="domains__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-services__modal-head">
              <h3 className="h5">Manage subscription</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditItem(null)} disabled={saving}>
                <X size={16} />
              </button>
            </div>
            <p className="admin-services__modal-meta">
              {editItem.serviceName} · {editItem.packageLabel} · {customerName(editItem.userId)}
            </p>

            <div className="admin-services__modal-form">
              <label>
                Status
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {ASSET_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Portal URL
                <input
                  className="input"
                  value={editForm.portalUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, portalUrl: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label>
                Access notes (visible to customer)
                <textarea
                  className="input"
                  rows={3}
                  value={editForm.accessNotes}
                  onChange={(e) => setEditForm((f) => ({ ...f, accessNotes: e.target.value }))}
                />
              </label>
              <label>
                Internal notes (admin only)
                <textarea
                  className="input"
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>
              <div className="admin-services__dates-grid">
                <label>
                  Starts
                  <input
                    className="input"
                    type="date"
                    value={editForm.startsAt}
                    onChange={(e) => setEditForm((f) => ({ ...f, startsAt: e.target.value }))}
                  />
                </label>
                <label>
                  Expires
                  <input
                    className="input"
                    type="date"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </label>
              </div>
              <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
