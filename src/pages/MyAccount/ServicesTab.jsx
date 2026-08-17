// ============================================
// BIT SOFTWARE — My Account → Services Tab
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package, RefreshCw, Loader2, AlertCircle, CheckCircle2,
  Clock, XCircle, AlertTriangle, ExternalLink, ArrowRight, CreditCard,
} from 'lucide-react';
import { getMyDigitalServices } from '@/api/digitalServiceApi';
import { getMyTabbyOrders } from '@/api/tabbyOrderApi';
import { DIGITAL_SERVICES } from '@/constants/digitalServices';
import './ServicesTab.css';

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  pending_review: { label: 'Pending review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  in_progress: { label: 'In progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Clock },
  completed: { label: 'Activated', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  refunded: { label: 'Refunded', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: XCircle },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const landingFor = (serviceKey) =>
  DIGITAL_SERVICES[serviceKey]?.landingPath || '/services/web-development/supply-company';

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className="acct-services__status" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

export default function ServicesTab() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [tabbyOrders, setTabbyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [digitalRes, tabbyRes] = await Promise.all([
        getMyDigitalServices().catch(() => ({ success: false, data: [] })),
        getMyTabbyOrders().catch(() => ({ success: false, data: [] })),
      ]);
      if (digitalRes.success) setServices(digitalRes.data || []);
      else if (digitalRes.message) setError(digitalRes.message);
      if (tabbyRes.success) setTabbyOrders(tabbyRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const tabbyRows = tabbyOrders
    .filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'refunded')
    .map((o) => ({
      _id: o._id,
      serviceName: 'Tabby Business Account Setup',
      packageLabel: 'One-time · 500 SAR',
      status: o.paymentStatus === 'refunded' ? 'refunded' : o.orderStatus,
      startsAt: o.createdAt,
      expiresAt: o.promisedBy,
      amountSAR: o.amountSAR,
      company: o.legalCompanyName,
      orderId: o.orderId,
      notes: o.customerVisibleNotes,
      merchantId: o.tabbyMerchantId,
    }));

  const hasAny = services.length > 0 || tabbyRows.length > 0;

  return (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="acct-services"
    >
      <div className="myaccount__section-header">
        <div>
          <h2 className="h4">My Services</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Digital subscriptions and purchased packages such as Tabby Business
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={fetchServices} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <Link to="/services/web-development/supply-company" className="btn btn-primary btn-sm">
            <Package size={14} /> Browse Services
          </Link>
        </div>
      </div>

      {error && (
        <div className="acct-services__error">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}

      {loading ? (
        <div className="acct-services__loading">
          <Loader2 size={32} className="spin" />
          <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading your services...</p>
        </div>
      ) : !hasAny ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-elevated acct-services__empty"
        >
          <Package size={48} />
          <h3 className="h5">No Services Yet</h3>
          <p>Purchased packages such as Tabby Business Account Setup will appear here.</p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/services/tabby-business" className="btn btn-primary">
              Tabby Business <ArrowRight size={16} />
            </Link>
            <Link to="/services/web-development/supply-company" className="btn btn-secondary">
              Supply Portals
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="card-elevated acct-services__table-wrap">
            <div className="acct-services__table-scroll">
              <table className="acct-services__table">
                <thead>
                  <tr>
                    {['Service', 'Package', 'Status', 'Starts', 'Expires', 'Amount', 'Actions'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabbyRows.map((item) => {
                    const open = expandedId === `tabby-${item._id}`;
                    return (
                      <tr key={`tabby-${item._id}`}>
                        <td>
                          <div className="acct-services__name">{item.serviceName}</div>
                          <div className="acct-services__portal-link" style={{ color: 'var(--color-text-muted)' }}>
                            {item.company} · #{item.orderId}
                          </div>
                        </td>
                        <td className="acct-services__package">{item.packageLabel}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{formatDate(item.startsAt)}</td>
                        <td>{item.status === 'completed' ? '—' : formatDate(item.expiresAt)}</td>
                        <td>{item.amountSAR != null ? `${item.amountSAR} SAR` : '—'}</td>
                        <td>
                          <div className="acct-services__actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setExpandedId(open ? null : `tabby-${item._id}`)}
                            >
                              {open ? 'Hide' : 'Details'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/my-account/tabby/${item._id}`)}
                            >
                              Open
                            </button>
                          </div>
                          {open && (
                            <div className="acct-services__details">
                              <p><strong>Company:</strong> {item.company}</p>
                              {item.merchantId && <p><strong>Tabby merchant ID:</strong> {item.merchantId}</p>}
                              {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                              {!item.merchantId && !item.notes && (
                                <p>Our team is processing this Tabby setup. Typical activation is within 3 working days.</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {services.map((item) => {
                    const open = expandedId === item._id;
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="acct-services__name">{item.serviceName}</div>
                          {item.portalUrl && (
                            <a
                              href={item.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="acct-services__portal-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open portal <ExternalLink size={11} />
                            </a>
                          )}
                        </td>
                        <td className="acct-services__package">{item.packageLabel || item.packageType}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{formatDate(item.startsAt)}</td>
                        <td>{formatDate(item.expiresAt)}</td>
                        <td>{item.amountSAR != null ? `${item.amountSAR} SAR` : '—'}</td>
                        <td>
                          <div className="acct-services__actions">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setExpandedId(open ? null : item._id)}
                            >
                              {open ? 'Hide' : 'Details'}
                            </button>
                            {(item.status === 'expired' || item.status === 'cancelled') && (
                              <Link to={landingFor(item.serviceKey)} className="btn btn-primary btn-sm">
                                Renew
                              </Link>
                            )}
                          </div>
                          {open && (
                            <div className="acct-services__details">
                              {item.accessNotes && (
                                <p><strong>Access notes:</strong> {item.accessNotes}</p>
                              )}
                              {!item.portalUrl && !item.accessNotes && (
                                <p>Portal access will appear here once provisioned by our team.</p>
                              )}
                              {item.portalUrl && (
                                <p>
                                  <strong>Portal:</strong>{' '}
                                  <a href={item.portalUrl} target="_blank" rel="noopener noreferrer">
                                    {item.portalUrl}
                                  </a>
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="acct-services__mobile">
            {tabbyRows.map((item, i) => (
              <motion.div
                key={`tabby-m-${item._id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated acct-services__card"
              >
                <div className="acct-services__card-top">
                  <strong>{item.serviceName}</strong>
                  <StatusBadge status={item.status} />
                </div>
                <p className="acct-services__meta">
                  {item.packageLabel} · {item.company}
                </p>
                <p className="acct-services__dates">Ordered {formatDate(item.startsAt)}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/my-account/tabby/${item._id}`)}
                >
                  View Tabby order <CreditCard size={14} />
                </button>
              </motion.div>
            ))}
            {services.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated acct-services__card"
              >
                <div className="acct-services__card-top">
                  <strong>{item.serviceName}</strong>
                  <StatusBadge status={item.status} />
                </div>
                <p className="acct-services__meta">
                  {item.packageLabel} · {item.amountSAR != null ? `${item.amountSAR} SAR` : '—'}
                </p>
                <p className="acct-services__dates">
                  {formatDate(item.startsAt)} → {formatDate(item.expiresAt)}
                </p>
                {item.portalUrl && (
                  <a
                    href={item.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    Open portal <ExternalLink size={14} />
                  </a>
                )}
                {item.accessNotes && <p className="acct-services__notes">{item.accessNotes}</p>}
                {(item.status === 'expired' || item.status === 'cancelled') && (
                  <Link to={landingFor(item.serviceKey)} className="btn btn-primary btn-sm">
                    Renew / Buy again
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
