// ============================================
// BIT SOFTWARE — Admin Domain Orders Page
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Search, Filter, RefreshCw, Loader2, AlertCircle,
  CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight,
  Eye, Edit3, RotateCcw,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllDomainOrders, updateDomainOrderStatus } from '@/api/domainOrderApi';
import { toast } from '@/components/common/Toast/Toast';
import './DomainOrders.css';

const STATUS_OPTIONS = ['', 'pending_payment', 'processing', 'active', 'failed', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['', 'pending', 'paid', 'failed', 'refunded'];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending_payment: { label: 'Pending Payment', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

const paymentStatusConfig = {
  paid: { label: 'Paid', color: '#22c55e' },
  pending: { label: 'Pending', color: '#f59e0b' },
  failed: { label: 'Failed', color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#6366f1' },
};

function StatusBadge({ status, config }) {
  const s = config[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function DetailModal({ order, onClose, onUpdate }) {
  const [editStatus, setEditStatus] = useState(order.orderStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editStatus === order.orderStatus) { onClose(); return; }
    setIsSaving(true);
    try {
      await updateDomainOrderStatus(order._id, { orderStatus: editStatus });
      toast.success('Order status updated.');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally { setIsSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>Order Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
          {[
            { label: 'Order ID', value: order.orderId },
            { label: 'Domain', value: order.domainName, bold: true },
            { label: 'Customer', value: `${order.customerName} (${order.customerEmail})` },
            { label: 'Sell Price', value: `$${order.sellPriceUSD} USD` },
            { label: 'Display', value: `${order.displayAmount} ${order.displayCurrency}` },
            { label: 'PayPal Order', value: order.paypalOrderId || '—', mono: true },
            { label: 'PayPal Capture', value: order.paypalCaptureId || '—', mono: true },
            { label: 'Refund ID', value: order.paypalRefundId || '—', mono: true },
            { label: 'Namecheap ID', value: order.namecheapOrderId || '—' },
            { label: 'Registered', value: order.registeredAt ? new Date(order.registeredAt).toLocaleDateString() : '—' },
            { label: 'Expires', value: order.expiresAt ? new Date(order.expiresAt).toLocaleDateString() : '—' },
            { label: 'Failure Reason', value: order.failureReason || '—', color: '#dc2626' },
          ].map(({ label, value, bold, mono, color }) => (
            <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)', minWidth: 130, flexShrink: 0 }}>{label}:</span>
              <span style={{ fontWeight: bold ? 700 : 500, fontFamily: mono ? 'var(--font-mono)' : undefined, color: color || 'var(--color-text-primary)', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Update Status</label>
          <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ marginBottom: '0.75rem' }}>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ flex: 1 }}>
              {isSaving ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Save Changes'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDomainOrders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filters, setFilters] = useState({ orderStatus: '', paymentStatus: '', page: 1, limit: 20 });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await getAllDomainOrders(params);
      if (res.success) {
        setOrders(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load domain orders.');
    } finally { setIsLoading(false); }
  }, [filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <>
      <SEOHead title="Domain Orders" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={22} style={{ color: 'var(--color-primary)' }} /> Domain Orders
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>Manage all domain registrations</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <Filter size={15} /> Filters:
          </div>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.orderStatus} onChange={(e) => setFilters(f => ({ ...f, orderStatus: e.target.value, page: 1 }))}>
            <option value="">All Order Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.paymentStatus} onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value, page: 1 }))}>
            <option value="">All Payment Status</option>
            {PAYMENT_STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{paymentStatusConfig[s]?.label || s}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {meta.total} total orders
          </div>
        </div>

        {/* Error */}
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
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              No domain orders found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="domain-orders__table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Domain</th>
                    <th>Customer</th>
                    <th>Price</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Expires</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <motion.tr key={order._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-muted)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                          {order.orderId || order._id?.slice(-6)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{order.domainName}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{order.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{order.customerEmail}</div>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>${order.sellPriceUSD}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: paymentStatusConfig[order.paymentStatus]?.color || '#9ca3af' }}>
                          {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                        </span>
                      </td>
                      <td><StatusBadge status={order.orderStatus} config={statusConfig} /></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(order.expiresAt)}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(order.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPage > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <span>Page {meta.page} of {meta.totalPage} ({meta.total} orders)</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                  <ChevronLeft size={15} /> Prev
                </button>
                <button className="btn btn-ghost btn-sm" disabled={meta.page >= meta.totalPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <DetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
