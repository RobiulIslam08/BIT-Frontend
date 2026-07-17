// ============================================
// BIT SOFTWARE — GMB Orders Management Page
// ============================================
// Admin: GMB orders list, filter, search, status update, order detail modal

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Package, DollarSign, Clock, CheckCircle2,
  AlertCircle, XCircle, Eye, RefreshCw, Filter,
  ChevronLeft, ChevronRight, Loader2, ShoppingCart,
  Edit3, Trash2
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { Counter } from '@/components/animations/CounterAnimation';
import { getAllGMBOrders, updateGMBOrderStatus, deleteGMBOrder } from '@/api/gmbOrderApi';
import OrderDetailModal from './OrderDetailModal';
import EditOrderModal from './EditOrderModal';
import './GmbOrdersPage.css';

const SERVICE_LABELS = {
  new: 'New Profile',
  recovery: 'Recovery',
  regular: 'Management',
};

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending_verification', label: 'Pending' },
  { value: 'due', label: 'Due' },
  { value: 'failed', label: 'Failed' },
];

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'All Methods' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'manual', label: 'Manual' },
];

const PAYMENT_STATUS_LABELS = {
  paid: 'Paid',
  pending_verification: 'Pending',
  due: 'Due',
  failed: 'Failed',
};

const ORDER_STATUS_LABELS = {
  pending_review: 'Pending Review',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function DashboardOrders() {
  // ─── State ───
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // ─── Fetch Orders ───
  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { page, limit: meta.limit };
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      if (orderStatusFilter) params.orderStatus = orderStatusFilter;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;

      const response = await getAllGMBOrders(params);

      if (response.success) {
        setOrders(response.data || []);
        setMeta(response.meta || { total: 0, page: 1, limit: 15, totalPage: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [paymentStatusFilter, orderStatusFilter, paymentMethodFilter, meta.limit]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, paymentStatusFilter, orderStatusFilter, paymentMethodFilter]);

  // ─── Computed Stats ───
  const stats = useMemo(() => {
    return {
      total: meta.total || 0,
      // We'll compute from current page data as a quick indicator;
      // for accurate totals across all pages, backend stats endpoint is ideal
    };
  }, [meta]);

  // ─── Client-side search filter ───
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase().trim();
    return orders.filter(o =>
      (o.orderId && o.orderId.includes(term)) ||
      (o.businessName && o.businessName.toLowerCase().includes(term)) ||
      (o.email && o.email.toLowerCase().includes(term))
    );
  }, [orders, searchTerm]);

  // ─── Status Update Handler ───
  const handleStatusUpdate = async (orderId, field, value) => {
    try {
      const updateData = { [field]: value };
      const response = await updateGMBOrderStatus(orderId, updateData);

      if (response.success) {
        // Update local state
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, ...updateData } : o))
        );
        showToast('success', `${field === 'orderStatus' ? 'Order' : 'Payment'} status updated!`);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  // ─── Delete Order Handler ───
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setIsDeleting(true);
      const res = await deleteGMBOrder(orderToDelete);
      if (res.success) {
        showToast('success', 'Order deleted successfully');
        setOrders(prev => prev.filter(o => o._id !== orderToDelete));
        setMeta(prev => ({ ...prev, total: prev.total - 1 }));
        setOrderToDelete(null);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Toast ───
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Clear Filters ───
  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatusFilter('');
    setOrderStatusFilter('');
    setPaymentMethodFilter('');
    setCurrentPage(1);
  };

  const hasFilters = searchTerm || paymentStatusFilter || orderStatusFilter || paymentMethodFilter;

  // ─── Date Format ───
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // ─── Pagination ───
  const renderPagination = () => {
    const pages = [];
    const total = meta.totalPage || 1;
    const current = meta.page || 1;

    // Show max 5 page buttons
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="gmb-orders__pagination">
        <span className="gmb-orders__pagination-info">
          Showing {filteredOrders.length} of {meta.total} orders — Page {current} of {total}
        </span>
        <div className="gmb-orders__pagination-controls">
          <button
            className="gmb-orders__page-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={current <= 1}
          >
            <ChevronLeft size={14} />
          </button>
          {pages.map(p => (
            <button
              key={p}
              className={`gmb-orders__page-btn ${p === current ? 'gmb-orders__page-btn--active' : ''}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="gmb-orders__page-btn"
            onClick={() => setCurrentPage(prev => Math.min(total, prev + 1))}
            disabled={current >= total}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ─── Skeleton Loader ───
  const renderSkeleton = () => (
    Array.from({ length: 6 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: 8 }).map((_, j) => (
          <td key={j}>
            <div
              className="gmb-orders__skeleton-cell"
              style={{ width: j === 1 ? '140px' : j === 7 ? '80px' : '80px', height: '14px' }}
            />
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <>
      <SEOHead title="GMB Orders" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`gmb-orders__toast gmb-orders__toast--${toast.type}`}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Header */}
        <div className="gmb-orders__header">
          <div className="gmb-orders__header-left">
            <h1 className="h3">GMB Orders</h1>
            <p>Manage Google My Business profile orders and payment verifications.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchOrders(currentPage)} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Quick Stats */}
        <motion.div
          className="gmb-orders__stats"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: 'Total Orders', value: meta.total, icon: Package, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
            { label: 'Page Results', value: filteredOrders.length, icon: ShoppingCart, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="gmb-orders__stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="gmb-orders__stat-icon" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="gmb-orders__stat-value">
                  <Counter to={s.value} />
                </div>
                <div className="gmb-orders__stat-label">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div
          className="gmb-orders__toolbar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="gmb-orders__search">
            <Search size={16} className="gmb-orders__search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, Business Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="gmb-orders__filter-select"
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            {PAYMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="gmb-orders__filter-select"
            value={orderStatusFilter}
            onChange={(e) => { setOrderStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            {ORDER_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="gmb-orders__filter-select"
            value={paymentMethodFilter}
            onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
          >
            {PAYMENT_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {hasFilters && (
            <button className="gmb-orders__clear-btn" onClick={clearFilters}>
              <XCircle size={12} /> Clear
            </button>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          className="gmb-orders__table-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="gmb-orders__table-scroll">
            <table className="gmb-orders__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Business</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? renderSkeleton() : (
                  filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="gmb-orders__empty">
                          <div className="gmb-orders__empty-icon">📦</div>
                          <div className="gmb-orders__empty-title">
                            {hasFilters ? 'No orders match your filters' : 'No orders yet'}
                          </div>
                          <div className="gmb-orders__empty-desc">
                            {hasFilters ? 'Try adjusting your search or filter criteria.' : 'New GMB orders will appear here.'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, idx) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <td>
                          <span className="gmb-orders__order-id">#{order.orderId || order._id?.slice(-6)}</span>
                        </td>
                        <td>
                          <div className="gmb-orders__business-cell">
                            <span className="gmb-orders__business-name" title={order.businessName}>{order.businessName}</span>
                            <span className="gmb-orders__business-email" title={order.email}>{order.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`gmb-orders__service-badge gmb-orders__service-badge--${order.serviceType}`}>
                            {SERVICE_LABELS[order.serviceType] || order.serviceType}
                          </span>
                        </td>
                        <td>
                          <div className="gmb-orders__amount">
                            {order.discountAmount > 0 && (
                              <span className="gmb-orders__amount-discount">{order.originalPrice} SAR</span>
                            )}
                            {order.finalAmount} SAR
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            {order.paymentMethod === 'paypal' ? '💳 PayPal' : '🏦 Manual'}
                          </span>
                        </td>
                        <td>
                          <select
                            className="gmb-orders__status-select"
                            value={order.paymentStatus}
                            onChange={(e) => handleStatusUpdate(order._id, 'paymentStatus', e.target.value)}
                            style={{
                              color: order.paymentStatus === 'paid' ? '#10B981' : order.paymentStatus === 'failed' ? '#EF4444' : order.paymentStatus === 'due' ? '#8B5CF6' : '#F59E0B',
                              borderColor: order.paymentStatus === 'paid' ? 'rgba(16,185,129,0.3)' : order.paymentStatus === 'failed' ? 'rgba(239,68,68,0.3)' : order.paymentStatus === 'due' ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)',
                            }}
                          >
                            <option value="pending_verification">⏳ Pending</option>
                            <option value="paid">✅ Paid</option>
                            <option value="due">💸 Due</option>
                            <option value="failed">❌ Failed</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="gmb-orders__status-select"
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, 'orderStatus', e.target.value)}
                            style={{
                              color: order.orderStatus === 'completed' ? '#10B981' : order.orderStatus === 'cancelled' ? '#EF4444' : order.orderStatus === 'in_progress' ? '#F59E0B' : '#3B82F6',
                              borderColor: order.orderStatus === 'completed' ? 'rgba(16,185,129,0.3)' : order.orderStatus === 'cancelled' ? 'rgba(239,68,68,0.3)' : order.orderStatus === 'in_progress' ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)',
                            }}
                          >
                            <option value="pending_review">📋 Pending Review</option>
                            <option value="in_progress">🔄 In Progress</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <div className="gmb-orders__actions">
                            <button
                              className="gmb-orders__action-btn"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="gmb-orders__action-btn"
                              onClick={() => setOrderToEdit(order)}
                              title="Edit Order"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="gmb-orders__action-btn gmb-orders__action-btn--delete"
                              onClick={() => setOrderToDelete(order._id)}
                              title="Delete Order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredOrders.length > 0 && renderPagination()}
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Edit Order Modal */}
      {orderToEdit && (
        <EditOrderModal
          order={orderToEdit}
          onClose={() => setOrderToEdit(null)}
          onUpdate={(id, data) => {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, ...data } : o));
            showToast('success', 'Order information updated');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <motion.div
            className="gmb-modal__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && setOrderToDelete(null)}
          >
            <motion.div
              className="gmb-modal__content"
              style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 1.25rem auto' 
              }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Delete Order
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete this order? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setOrderToDelete(null)}
                  disabled={isDeleting}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={handleDeleteOrder}
                  disabled={isDeleting}
                  style={{ flex: 1, background: '#EF4444', borderColor: '#EF4444', color: 'white' }}
                >
                  {isDeleting ? <Loader2 size={18} className="spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
