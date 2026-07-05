// ============================================
// BIT SOFTWARE — Dashboard Home (Dynamic GMB Data)
// ============================================
// Real-time KPI cards, recent orders table, service/payment breakdowns

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package, DollarSign, Clock, CheckCircle2,
  AlertCircle, ArrowRight, TrendingUp, CreditCard,
  Loader2, RefreshCw, ShoppingCart, XCircle,
  BarChart3, Layers
} from 'lucide-react';
import { Counter } from '@/components/animations/CounterAnimation';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllGMBOrders } from '@/api/gmbOrderApi';
import './Orders/GmbOrdersPage.css';

const SERVICE_LABELS = {
  new: 'New Profile',
  recovery: 'Recovery',
  regular: 'Management',
};

const SERVICE_COLORS = {
  new: '#3B82F6',
  recovery: '#F59E0B',
  regular: '#10B981',
};

const PAYMENT_METHOD_COLORS = {
  paypal: '#0070BA',
  manual: '#8B5CF6',
};

export default function DashboardHome() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all orders for computing dashboard stats
  const fetchAllOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch large batch for stats computation
      const response = await getAllGMBOrders({ limit: 100, page: 1 });
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // ─── Computed KPIs ───
  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
    const pendingReview = orders.filter(o => o.orderStatus === 'pending_review').length;
    const inProgress = orders.filter(o => o.orderStatus === 'in_progress').length;
    const completed = orders.filter(o => o.orderStatus === 'completed').length;
    const pendingPayments = orders.filter(o => o.paymentStatus === 'pending_verification').length;

    return { totalOrders, totalRevenue, pendingReview, inProgress, completed, pendingPayments };
  }, [orders]);

  // ─── Service Type Breakdown ───
  const serviceBreakdown = useMemo(() => {
    const counts = { new: 0, recovery: 0, regular: 0 };
    orders.forEach(o => { if (counts[o.serviceType] !== undefined) counts[o.serviceType]++; });
    return counts;
  }, [orders]);

  // ─── Payment Method Breakdown ───
  const paymentBreakdown = useMemo(() => {
    const counts = { paypal: 0, manual: 0 };
    orders.forEach(o => { if (counts[o.paymentMethod] !== undefined) counts[o.paymentMethod]++; });
    return counts;
  }, [orders]);

  // ─── Recent 5 Orders ───
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
  };

  const KPI_CARDS = [
    { label: 'Total Orders', value: kpis.totalOrders, icon: Package, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
    { label: 'Revenue (SAR)', value: kpis.totalRevenue, icon: DollarSign, color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Pending Review', value: kpis.pendingReview, icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'In Progress', value: kpis.inProgress, icon: TrendingUp, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'Completed', value: kpis.completed, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Pending Payments', value: kpis.pendingPayments, icon: AlertCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  ];

  return (
    <>
      <SEOHead title="Dashboard" />
      <div>
        {/* ─── Page Header ─── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>Welcome back! Here's your GMB business overview.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchAllOrders} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* ─── Error ─── */}
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
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        {/* ─── KPI Cards Grid ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {KPI_CARDS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card-elevated"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1rem', cursor: 'default' }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 'var(--radius-md)',
                background: kpi.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <kpi.icon size={22} style={{ color: kpi.color }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{kpi.label}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {isLoading ? (
                    <Loader2 size={20} className="spin" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Counter to={kpi.value} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Recent Orders Table ─── */}
        <motion.div
          className="card-elevated"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h3 className="h5" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
              Recent GMB Orders
            </h3>
            <Link
              to="/dashboard/orders"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Loader2 size={24} className="spin" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              No orders yet. New GMB orders will appear here.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="gmb-dashboard__recent-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Business</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.06 }}
                    >
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--text-xs)',
                          color: 'var(--color-primary)', background: 'var(--color-primary-muted)',
                          padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)',
                        }}>
                          #{order.orderId || order._id?.slice(-6)}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '180px' }}>
                          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.businessName}>
                            {order.businessName}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.2rem 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 600,
                          borderRadius: 'var(--radius-full)',
                          background: `${SERVICE_COLORS[order.serviceType]}18`,
                          color: SERVICE_COLORS[order.serviceType],
                        }}>
                          {SERVICE_LABELS[order.serviceType] || order.serviceType}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {order.finalAmount} SAR
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        {order.paymentMethod === 'paypal' ? '💳 PayPal' : '🏦 Manual'}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.2rem 0.5rem', fontSize: 'var(--text-xs)', fontWeight: 600,
                          borderRadius: 'var(--radius-full)',
                          background: order.orderStatus === 'completed' ? 'rgba(16,185,129,0.12)' :
                            order.orderStatus === 'cancelled' ? 'rgba(239,68,68,0.12)' :
                            order.orderStatus === 'in_progress' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                          color: order.orderStatus === 'completed' ? '#10B981' :
                            order.orderStatus === 'cancelled' ? '#EF4444' :
                            order.orderStatus === 'in_progress' ? '#F59E0B' : '#3B82F6',
                        }}>
                          {order.orderStatus === 'completed' ? '✅' : order.orderStatus === 'cancelled' ? '❌' : order.orderStatus === 'in_progress' ? '🔄' : '📋'}
                          {' '}{order.orderStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {formatDate(order.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ─── Breakdown Cards ─── */}
        {!isLoading && orders.length > 0 && (
          <div className="gmb-dashboard__breakdown">
            {/* Service Type Breakdown */}
            <motion.div
              className="gmb-dashboard__breakdown-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="gmb-dashboard__breakdown-title">
                <Layers size={16} style={{ color: 'var(--color-primary)' }} />
                Service Type Breakdown
              </div>
              {Object.entries(serviceBreakdown).map(([type, count]) => (
                <div className="gmb-dashboard__bar-item" key={type}>
                  <span className="gmb-dashboard__bar-label">{SERVICE_LABELS[type]}</span>
                  <div className="gmb-dashboard__bar-track">
                    <div
                      className="gmb-dashboard__bar-fill"
                      style={{
                        width: orders.length > 0 ? `${(count / orders.length) * 100}%` : '0%',
                        background: SERVICE_COLORS[type],
                      }}
                    />
                  </div>
                  <span className="gmb-dashboard__bar-count">{count}</span>
                </div>
              ))}
            </motion.div>

            {/* Payment Method Breakdown */}
            <motion.div
              className="gmb-dashboard__breakdown-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="gmb-dashboard__breakdown-title">
                <CreditCard size={16} style={{ color: 'var(--color-primary)' }} />
                Payment Method Breakdown
              </div>
              {Object.entries(paymentBreakdown).map(([method, count]) => (
                <div className="gmb-dashboard__bar-item" key={method}>
                  <span className="gmb-dashboard__bar-label">{method === 'paypal' ? 'PayPal' : 'Manual'}</span>
                  <div className="gmb-dashboard__bar-track">
                    <div
                      className="gmb-dashboard__bar-fill"
                      style={{
                        width: orders.length > 0 ? `${(count / orders.length) * 100}%` : '0%',
                        background: PAYMENT_METHOD_COLORS[method],
                      }}
                    />
                  </div>
                  <span className="gmb-dashboard__bar-count">{count}</span>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
