// ============================================
// BIT SOFTWARE — Tabby Order Details (Customer)
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock, XCircle,
  RefreshCw, FileText, Building2, Phone, Mail, MapPin,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { toast } from '@/components/common/Toast/Toast';
import { getMyTabbyOrderById, requestTabbyRefund, openTabbyFile } from '@/api/tabbyOrderApi';
import { TABBY_DOC_FIELDS } from '@/constants/tabbyService';
import { useCurrency } from '@/context/CurrencyContext';
import '../MyAccount/MyAccount.css';
import './TabbyOrderDetails.css';

const statusConfig = {
  pending_review: { label: 'Pending review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  in_progress: { label: 'In progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Clock },
  completed: { label: 'Activated', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
};

const canRequestRefund = (order) =>
  order?.paymentStatus === 'paid' &&
  order?.orderStatus !== 'completed' &&
  order?.refundStatus !== 'requested' &&
  order?.refundStatus !== 'processed';

export default function TabbyOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { formatFromSARWithCode } = useCurrency();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [refundBusy, setRefundBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated, navigate]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyTabbyOrderById(id);
      if (res.success) setOrder(res.data);
      else setError(res.message || 'Failed to load order.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Tabby order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openFile = async (file) => {
    try {
      await openTabbyFile(order._id, file);
    } catch {
      toast.error('Could not open this document.');
    }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 8) {
      toast.warning('Please explain the refund in at least 8 characters.');
      return;
    }
    setRefundBusy(true);
    try {
      const res = await requestTabbyRefund(order._id, reason.trim());
      setOrder(res.data);
      setReason('');
      toast.success('Refund request submitted.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit refund request.');
    } finally {
      setRefundBusy(false);
    }
  };

  if (!isAuthenticated) return null;

  const status = statusConfig[order?.orderStatus] || statusConfig.pending_review;
  const StatusIcon = status.icon;
  const promised = order?.promisedBy
    ? new Date(order.promisedBy).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      <SEOHead title={order ? `Tabby #${order.orderId}` : 'Tabby order'} description="Track your Tabby Business Account setup." />
      <div className="myaccount tabby-details" style={{ maxWidth: 900 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/my-account?tab=tabby')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Tabby
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="spin" />
          </div>
        ) : error ? (
          <div className="card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={28} color="#dc2626" />
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={fetchOrder}>Retry</button>
          </div>
        ) : (
          <>
            <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>TABBY BUSINESS ACCOUNT SETUP · ORDER #{order.orderId}</div>
                  <h1 className="h4" style={{ margin: '0.25rem 0' }}>{order.legalCompanyName}</h1>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.2rem 0.55rem', borderRadius: 999, background: status.bg, color: status.color, fontSize: 12, fontWeight: 700 }}>
                    <StatusIcon size={12} /> {status.label}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0d9488' }}>{formatFromSARWithCode(order.amountSAR || 500)}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{order.paymentMethod === 'wallet' ? 'Wallet' : 'PayPal'} · {order.paymentStatus}</div>
                  {promised && order.orderStatus !== 'completed' && (
                    <div style={{ fontSize: 12, marginTop: 4 }}>Promised by {promised}</div>
                  )}
                </div>
              </div>
              {order.customerVisibleNotes && (
                <p style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 12, background: 'rgba(13,148,136,0.08)', fontSize: 14 }}>
                  {order.customerVisibleNotes}
                </p>
              )}
              {order.tabbyMerchantId && (
                <p style={{ marginTop: '0.75rem', fontSize: 14 }}><strong>Tabby merchant ID:</strong> {order.tabbyMerchantId}</p>
              )}
            </div>

            <div className="tabby-timeline">
              {['pending_review', 'in_progress', 'completed'].map((key, i) => {
                const done = ['pending_review', 'in_progress', 'completed'].indexOf(order.orderStatus) >= i || order.orderStatus === 'completed';
                const labels = ['Paid — under review', 'Application in progress', 'Tabby account activated'];
                return (
                  <div key={key} className={`tabby-timeline__item ${done ? 'is-done' : ''}`}>
                    <span />
                    {labels[i]}
                  </div>
                );
              })}
            </div>

            <div className="card-elevated" style={{ padding: '1.25rem', margin: '1rem 0' }}>
              <h3 className="h5">Business details</h3>
              <div className="tabby-dl">
                <div><Building2 size={14} /> CR {order.crNumber}</div>
                <div><MapPin size={14} /> {order.city} · {order.nationalAddressCode}</div>
                <div><Phone size={14} /> {order.phone}</div>
                <div><Mail size={14} /> {order.email}</div>
              </div>
            </div>

            <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 className="h5">Documents submitted</h3>
              <div className="tabby-files">
                {(order.files || []).map((file) => {
                  const meta = TABBY_DOC_FIELDS.find((d) => d.key === file.key);
                  return (
                    <button key={file._id} type="button" className="tabby-file-chip" onClick={() => openFile(file)}>
                      <FileText size={14} /> {meta?.label || file.key} · {file.originalName}
                    </button>
                  );
                })}
                {!(order.files || []).length && <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No files listed.</p>}
              </div>
            </div>

            {order.refundStatus === 'requested' && (
              <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem', borderColor: 'rgba(245,158,11,0.4)' }}>
                Refund request is pending admin review.
              </div>
            )}
            {order.refundStatus === 'processed' && (
              <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem', borderColor: 'rgba(34,197,94,0.4)' }}>
                This order was refunded.
              </div>
            )}
            {order.refundStatus === 'rejected' && (
              <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                Refund request was declined{order.refundRejectedReason ? `: ${order.refundRejectedReason}` : '.'}
              </div>
            )}

            {canRequestRefund(order) && (
              <form className="card-elevated" style={{ padding: '1.25rem' }} onSubmit={submitRefund}>
                <h3 className="h5">Request a refund</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                  Available while setup is not yet completed. After Tabby activation, refunds are case-by-case.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Tell us why you need a refund..."
                  style={{ width: '100%', borderRadius: 12, padding: '0.75rem', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'inherit' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} disabled={refundBusy}>
                  {refundBusy ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Submit refund request
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
}
