// ============================================
// BIT SOFTWARE — Admin Hosting Orders
// ============================================
import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, RefreshCw, Loader2, AlertCircle, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllHostingOrders, updateHostingOrder } from '@/api/hostingOrderApi';
import { toast } from '@/components/common/Toast/Toast';
import '../Domains/Domains.css';

const ORDER_STATUSES = ['pending_payment', 'processing', 'active', 'failed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminHostingOrders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ orderStatus: '', paymentStatus: '', search: '' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllHostingOrders({
        page,
        limit: 20,
        orderStatus: filters.orderStatus || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        search: filters.search || undefined,
      });
      if (res.success) {
        setOrders(res.data || []);
        setMeta(res.meta || { page: 1, totalPage: 1, total: 0 });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const patchStatus = async (id, field, value) => {
    try {
      await updateHostingOrder(id, { [field]: value });
      toast.success('Order updated.');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <>
      <SEOHead title="Hosting Orders — Admin" />
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h1 className="h4" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={22} /> Hosting Orders
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              PayPal purchases — money lands in your PayPal account
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="card-elevated" style={{ padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
          <select className="input" style={{ width: 'auto' }} value={filters.orderStatus} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, orderStatus: e.target.value })); }}>
            <option value="">All order status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={filters.paymentStatus} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, paymentStatus: e.target.value })); }}>
            <option value="">All payment</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="input"
            placeholder="Search order / customer…"
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
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="spin" /></div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No hosting orders yet.</div>
          ) : (
            <table className="domains__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 700 }}>{o.orderId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{o.customerEmail}</div>
                    </td>
                    <td>
                      <div>{o.planName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {o.planType} · {o.billingCycle}
                      </div>
                    </td>
                    <td>${Number(o.sellPriceUSD).toFixed(2)}</td>
                    <td>
                      <select
                        className="input"
                        style={{ width: 'auto', fontSize: 12, padding: '0.25rem 0.4rem' }}
                        value={o.paymentStatus}
                        onChange={(e) => patchStatus(o._id, 'paymentStatus', e.target.value)}
                      >
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        className="input"
                        style={{ width: 'auto', fontSize: 12, padding: '0.25rem 0.4rem' }}
                        value={o.orderStatus}
                        onChange={(e) => patchStatus(o._id, 'orderStatus', e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
    </>
  );
}
