// ============================================
// BIT SOFTWARE — Admin Tabby Orders
// ============================================

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Package, Clock, CheckCircle2, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, Loader2, CreditCard, Eye, X, FileText,
  Trash2,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { Counter } from '@/components/animations/CounterAnimation';
import { toast } from '@/components/common/Toast/Toast';
import {
  getAllTabbyOrders,
  updateTabbyOrder,
  processTabbyRefund,
  deleteTabbyOrder,
  openTabbyFile,
} from '@/api/tabbyOrderApi';
import { TABBY_DOC_FIELDS } from '@/constants/tabbyService';
import '../Orders/GmbOrdersPage.css';
import './TabbyOrders.css';

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminTabbyOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending_review: 0, in_progress: 0, completed: 0, refund_requested: 0 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPage: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refundNote, setRefundNote] = useState('');
  const [notes, setNotes] = useState({ customerVisibleNotes: '', adminNotes: '', tabbyMerchantId: '', orderStatus: '' });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getAllTabbyOrders({
        page: p,
        limit: 15,
        search: search.trim() || undefined,
        orderStatus: orderStatus || undefined,
        refundStatus: refundStatus || undefined,
      });
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : payload?.orders || [];
      setOrders(list);
      if (payload?.stats) setStats(payload.stats);
      setMeta(res.meta || { total: list.length, page: p, limit: 15, totalPage: 1 });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load Tabby orders.');
    } finally {
      setLoading(false);
    }
  }, [search, orderStatus, refundStatus]);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const openOrder = (order) => {
    setSelected(order);
    setRefundNote('');
    setNotes({
      customerVisibleNotes: order.customerVisibleNotes || '',
      adminNotes: order.adminNotes || '',
      tabbyMerchantId: order.tabbyMerchantId || '',
      orderStatus: order.orderStatus,
    });
  };

  const saveOrder = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await updateTabbyOrder(selected._id, notes);
      setSelected(res.data);
      setOrders((prev) => prev.map((o) => (o._id === selected._id ? { ...o, ...res.data } : o)));
      toast.success('Order updated.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (action) => {
    if (!selected) return;
    if (action === 'reject' && !refundNote.trim()) {
      toast.warning('Add a short reason before rejecting the refund.');
      return;
    }
    const adminNote = refundNote.trim();
    setSaving(true);
    try {
      const res = await processTabbyRefund(selected._id, { action, adminNote });
      setSelected(res.data);
      setOrders((prev) => prev.map((o) => (o._id === selected._id ? { ...o, ...res.data } : o)));
      toast.success(action === 'reject' ? 'Refund rejected.' : 'Refund processed.');
      fetchOrders(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Refund action failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Tabby order and its documents?')) return;
    try {
      await deleteTabbyOrder(id);
      toast.success('Order deleted.');
      setSelected(null);
      fetchOrders(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    }
  };

  const openFile = async (orderId, file) => {
    try {
      await openTabbyFile(orderId, file);
    } catch {
      toast.error('Could not open document.');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

  return (
    <>
      <SEOHead title="Tabby Orders" />
      <div>
        <div className="gmb-orders__header">
          <div className="gmb-orders__header-left">
            <h1 className="h3">Tabby Orders</h1>
            <p>Review KYC documents, activate merchant accounts, and process refunds.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchOrders(page)} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="gmb-orders__stats">
          {[
            { label: 'Total', value: stats.total || meta.total, icon: Package, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
            { label: 'Pending review', value: stats.pending_review || 0, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
            { label: 'In progress', value: stats.in_progress || 0, icon: Loader2, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
            { label: 'Completed', value: stats.completed || 0, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Refund requests', value: stats.refund_requested || 0, icon: AlertCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
          ].map((s) => (
            <div key={s.label} className="gmb-orders__stat-card">
              <div className="gmb-orders__stat-icon" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="gmb-orders__stat-value"><Counter to={s.value} /></div>
                <div className="gmb-orders__stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gmb-orders__toolbar">
          <div className="gmb-orders__search">
            <Search size={16} className="gmb-orders__search-icon" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search company, CR, email, order ID..."
            />
          </div>
          <select className="gmb-orders__filter-select" value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}>
            {ORDER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="gmb-orders__filter-select" value={refundStatus} onChange={(e) => { setRefundStatus(e.target.value); setPage(1); }}>
            <option value="">All refunds</option>
            <option value="requested">Requested</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="gmb-orders__table-wrap">
          <div className="gmb-orders__table-scroll">
            <table className="gmb-orders__table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Refund</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No Tabby orders found.</td></tr>
              ) : orders.map((o) => (
                <tr key={o._id}>
                  <td><strong>#{o.orderId}</strong><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(o.createdAt)}</div></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{o.legalCompanyName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>CR {o.crNumber} · {o.city}</div>
                  </td>
                  <td>
                    <div>{o.ownerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{o.email}</div>
                  </td>
                  <td>{o.amountSAR} SAR<br /><span style={{ fontSize: 12 }}>{o.paymentMethod}</span></td>
                  <td>{o.orderStatus?.replace('_', ' ')}<br /><span style={{ fontSize: 12 }}>{o.paymentStatus}</span></td>
                  <td>{o.refundStatus === 'none' ? '—' : o.refundStatus}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openOrder(o)}><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <div className="gmb-orders__pagination">
          <span>Page {meta.page} of {meta.totalPage} · {meta.total} orders</span>
          <div className="gmb-orders__pagination-controls">
            <button className="gmb-orders__page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></button>
            <button className="gmb-orders__page-btn" disabled={page >= (meta.totalPage || 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="gmb-modal__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="gmb-modal__content tabby-admin-modal" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} onClick={(e) => e.stopPropagation()}>
              <div className="gmb-modal__header">
                <div className="gmb-modal__title"><CreditCard size={18} /> Tabby #{selected.orderId}</div>
                <button className="gmb-modal__close" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
              <div className="gmb-modal__body">
                <div className="tabby-admin-grid">
                  <div><b>Company</b><div>{selected.legalCompanyName}</div></div>
                  <div><b>CR</b><div>{selected.crNumber}</div></div>
                  <div><b>VAT</b><div>{selected.vatRegistered ? selected.vatNumber : 'Not registered'}</div></div>
                  <div><b>City / Wasel</b><div>{selected.city} · {selected.nationalAddressCode}</div></div>
                  <div><b>Owner</b><div>{selected.ownerName} ({selected.ownerRole?.replace('_', ' ')})</div></div>
                  <div><b>ID</b><div>{selected.ownerNationalId}</div></div>
                  <div><b>Phone</b><div>{selected.phone}</div></div>
                  <div><b>Email</b><div>{selected.email}</div></div>
                  <div><b>Integration</b><div>{selected.integrationType?.replace('_', ' ')}</div></div>
                  <div><b>Website</b><div>{selected.website || '—'}</div></div>
                  <div><b>IBAN</b><div>{selected.iban}</div></div>
                  <div><b>Bank</b><div>{selected.bankName}</div></div>
                </div>

                <h4 className="h5" style={{ marginTop: '1.25rem' }}>Documents</h4>
                <div className="tabby-files">
                  {(selected.files || []).map((file) => {
                    const metaDoc = TABBY_DOC_FIELDS.find((d) => d.key === file.key);
                    return (
                      <button key={file._id} type="button" className="tabby-file-chip" onClick={() => openFile(selected._id, file)}>
                        <FileText size={14} /> {metaDoc?.label || file.key}
                      </button>
                    );
                  })}
                </div>

                {(selected.refundStatus === 'requested' || (selected.paymentStatus === 'paid' && selected.refundStatus !== 'processed')) && (
                  <div className="tabby-refund-banner">
                    <AlertCircle size={16} />
                    {selected.refundStatus === 'requested'
                      ? <>Customer requested a refund: {selected.refundReason}</>
                      : <>Issue a refund to PayPal or account balance if Tabby cannot be activated.</>}
                    <label className="tabby-admin-label">
                      Refund note
                      <textarea rows={2} value={refundNote} onChange={(e) => setRefundNote(e.target.value)} placeholder="Visible in admin history / reject reason" />
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleRefund('approve')}>
                        {selected.refundStatus === 'requested' ? 'Approve refund' : 'Issue refund'}
                      </button>
                      {selected.refundStatus === 'requested' && (
                        <button className="btn btn-secondary btn-sm" disabled={saving} onClick={() => handleRefund('reject')}>Reject</button>
                      )}
                    </div>
                  </div>
                )}

                <label className="tabby-admin-label">Order status
                  <select value={notes.orderStatus} onChange={(e) => setNotes((n) => ({ ...n, orderStatus: e.target.value }))}>
                    <option value="pending_review">Pending review</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed (activated)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="tabby-admin-label">Tabby merchant ID
                  <input value={notes.tabbyMerchantId} onChange={(e) => setNotes((n) => ({ ...n, tabbyMerchantId: e.target.value }))} />
                </label>
                <label className="tabby-admin-label">Note visible to customer
                  <textarea rows={3} value={notes.customerVisibleNotes} onChange={(e) => setNotes((n) => ({ ...n, customerVisibleNotes: e.target.value }))} />
                </label>
                <label className="tabby-admin-label">Internal admin notes
                  <textarea rows={3} value={notes.adminNotes} onChange={(e) => setNotes((n) => ({ ...n, adminNotes: e.target.value }))} />
                </label>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button className="btn btn-primary" disabled={saving} onClick={saveOrder}>{saving ? 'Saving...' : 'Save updates'}</button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(selected._id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
