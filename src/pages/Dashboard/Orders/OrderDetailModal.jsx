// ============================================
// BIT SOFTWARE — GMB Order Detail Modal
// ============================================
// সম্পূর্ণ GMB Order details দেখানোর modal component

import { motion, AnimatePresence } from 'motion/react';
import {
  X, Building2, Phone, Mail, Globe, MapPin,
  CreditCard, Clock, CheckCircle2, AlertCircle,
  Hash, User, Calendar, FileText, Shield, Image
} from 'lucide-react';

const SERVICE_LABELS = {
  new: 'New Profile Setup',
  recovery: 'Profile Recovery',
  regular: 'Profile Management',
};

const PAYMENT_STATUS_MAP = {
  paid: { label: 'Paid', color: '#10B981', icon: CheckCircle2 },
  pending_verification: { label: 'Pending Verification', color: '#F59E0B', icon: Clock },
  due: { label: 'Due', color: '#8B5CF6', icon: AlertCircle },
  failed: { label: 'Failed', color: '#EF4444', icon: AlertCircle },
};

const ORDER_STATUS_MAP = {
  pending_review: { label: 'Pending Review', color: '#3B82F6' },
  in_progress: { label: 'In Progress', color: '#F59E0B' },
  completed: { label: 'Completed', color: '#10B981' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
};

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.pending_verification;
  const orderStatusInfo = ORDER_STATUS_MAP[order.orderStatus] || ORDER_STATUS_MAP.pending_review;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="gmb-modal__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="gmb-modal__content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="gmb-modal__header">
            <div className="gmb-modal__title">
              <FileText size={20} />
              Order #{order.orderId || order._id?.slice(-6)}
            </div>
            <button className="gmb-modal__close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="gmb-modal__body">

            {/* ── Status Overview ── */}
            <div className="gmb-modal__section">
              <div className="gmb-modal__section-title"><Shield size={14} /> Status Overview</div>
              <div className="gmb-modal__field-grid">
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Order Status</span>
                  <span className={`gmb-orders__status gmb-orders__status--${order.orderStatus}`}>
                    {orderStatusInfo.label}
                  </span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Payment Status</span>
                  <span className={`gmb-orders__status gmb-orders__status--${order.paymentStatus}`}>
                    {paymentInfo.label}
                  </span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Service Type</span>
                  <span className={`gmb-orders__service-badge gmb-orders__service-badge--${order.serviceType}`}>
                    {SERVICE_LABELS[order.serviceType] || order.serviceType}
                  </span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Order Date</span>
                  <span className="gmb-modal__field-value">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* ── Business Info ── */}
            <div className="gmb-modal__section">
              <div className="gmb-modal__section-title"><Building2 size={14} /> Business Information</div>
              <div className="gmb-modal__field-grid">
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Business Name</span>
                  <span className="gmb-modal__field-value">{order.businessName}</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Category</span>
                  <span className="gmb-modal__field-value">{order.category || '—'}</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Physical Location</span>
                  <span className="gmb-modal__field-value">{order.hasPhysicalLocation === 'yes' ? 'Yes' : 'No'}</span>
                </div>
                {order.hasPhysicalLocation === 'yes' && (
                  <>
                    <div className="gmb-modal__field--full gmb-modal__field">
                      <span className="gmb-modal__field-label">Address</span>
                      <span className="gmb-modal__field-value">
                        {[order.streetAddress, order.city, order.state, order.postalCode, order.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>
                    {(order.latitude || order.longitude) && (
                      <div className="gmb-modal__field--full gmb-modal__field">
                        <span className="gmb-modal__field-label">Coordinates</span>
                        <span className="gmb-modal__field-value--mono">{order.latitude}, {order.longitude}</span>
                      </div>
                    )}
                  </>
                )}
                {order.serviceAreas && (
                  <div className="gmb-modal__field--full gmb-modal__field">
                    <span className="gmb-modal__field-label">Service Areas</span>
                    <span className="gmb-modal__field-value">{order.serviceAreas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Contact Info ── */}
            <div className="gmb-modal__section">
              <div className="gmb-modal__section-title"><Phone size={14} /> Contact Information</div>
              <div className="gmb-modal__field-grid">
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Phone</span>
                  <span className="gmb-modal__field-value">{order.phone}</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">WhatsApp</span>
                  <span className="gmb-modal__field-value">{order.whatsapp || '—'}</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Email</span>
                  <span className="gmb-modal__field-value">{order.email}</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Website</span>
                  <span className="gmb-modal__field-value">
                    {order.website ? (
                      <a href={order.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{order.website}</a>
                    ) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Business Details ── */}
            {(order.description || order.servicesList) && (
              <div className="gmb-modal__section">
                <div className="gmb-modal__section-title"><FileText size={14} /> Business Details</div>
                <div className="gmb-modal__field-grid">
                  {order.description && (
                    <div className="gmb-modal__field--full gmb-modal__field">
                      <span className="gmb-modal__field-label">Description</span>
                      <span className="gmb-modal__field-value">{order.description}</span>
                    </div>
                  )}
                  {order.servicesList && (
                    <div className="gmb-modal__field--full gmb-modal__field">
                      <span className="gmb-modal__field-label">Services List</span>
                      <span className="gmb-modal__field-value">{order.servicesList}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Recovery Info ── */}
            {order.serviceType === 'recovery' && (
              <div className="gmb-modal__section">
                <div className="gmb-modal__section-title"><AlertCircle size={14} /> Recovery Details</div>
                <div className="gmb-modal__field-grid">
                  <div className="gmb-modal__field">
                    <span className="gmb-modal__field-label">Has Existing Profile</span>
                    <span className="gmb-modal__field-value">{order.hasExistingProfile ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="gmb-modal__field">
                    <span className="gmb-modal__field-label">Profile Has Issues</span>
                    <span className="gmb-modal__field-value">{order.profileHasIssues ? 'Yes' : 'No'}</span>
                  </div>
                  {order.recoveryEmail && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Recovery Email</span>
                      <span className="gmb-modal__field-value">{order.recoveryEmail}</span>
                    </div>
                  )}
                  {order.recoveryPhone && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Recovery Phone</span>
                      <span className="gmb-modal__field-value">{order.recoveryPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Pricing ── */}
            <div className="gmb-modal__section">
              <div className="gmb-modal__section-title"><CreditCard size={14} /> Pricing & Payment</div>
              <div className="gmb-modal__field-grid">
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Original Price</span>
                  <span className="gmb-modal__field-value">{order.originalPrice} SAR</span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Discount</span>
                  <span className="gmb-modal__field-value" style={{ color: order.discountAmount > 0 ? '#10B981' : undefined }}>
                    {order.discountAmount > 0 ? `-${order.discountAmount} SAR` : 'None'}
                  </span>
                </div>
                {order.couponCode && (
                  <div className="gmb-modal__field">
                    <span className="gmb-modal__field-label">Coupon Code</span>
                    <span className="gmb-modal__field-value--mono">{order.couponCode}</span>
                  </div>
                )}
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Final Amount</span>
                  <span className="gmb-modal__field-value" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    {order.finalAmount} SAR
                  </span>
                </div>
                <div className="gmb-modal__field">
                  <span className="gmb-modal__field-label">Payment Method</span>
                  <span className="gmb-modal__field-value">
                    {order.paymentMethod === 'paypal' ? '💳 PayPal' : '🏦 Bank Transfer (Manual)'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── PayPal Details ── */}
            {order.paymentMethod === 'paypal' && (order.paypalOrderId || order.payerName) && (
              <div className="gmb-modal__section">
                <div className="gmb-modal__section-title"><Hash size={14} /> PayPal Details</div>
                <div className="gmb-modal__field-grid">
                  {order.paypalOrderId && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">PayPal Order ID</span>
                      <span className="gmb-modal__field-value--mono">{order.paypalOrderId}</span>
                    </div>
                  )}
                  {order.payerName && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Payer Name</span>
                      <span className="gmb-modal__field-value">{order.payerName}</span>
                    </div>
                  )}
                  {order.payerEmail && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Payer Email</span>
                      <span className="gmb-modal__field-value">{order.payerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Manual Payment Details ── */}
            {order.paymentMethod === 'manual' && (
              <div className="gmb-modal__section">
                <div className="gmb-modal__section-title"><CreditCard size={14} /> Manual Payment Details</div>
                <div className="gmb-modal__field-grid">
                  {order.transactionDetails?.transactionId && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Transaction ID</span>
                      <span className="gmb-modal__field-value--mono">{order.transactionDetails.transactionId}</span>
                    </div>
                  )}
                  {order.transactionDetails?.paymentMethodDetail && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Method Detail</span>
                      <span className="gmb-modal__field-value">{order.transactionDetails.paymentMethodDetail}</span>
                    </div>
                  )}
                  {order.transactionDetails?.senderName && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Sender Name</span>
                      <span className="gmb-modal__field-value">{order.transactionDetails.senderName}</span>
                    </div>
                  )}
                  {order.transactionDetails?.paymentDate && (
                    <div className="gmb-modal__field">
                      <span className="gmb-modal__field-label">Payment Date</span>
                      <span className="gmb-modal__field-value">{order.transactionDetails.paymentDate}</span>
                    </div>
                  )}
                </div>

                {/* Payment Screenshot */}
                {order.paymentScreenshot && (
                  <div style={{ marginTop: '1rem' }}>
                    <span className="gmb-modal__field-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Image size={12} /> Payment Screenshot
                    </span>
                    <img
                      src={order.paymentScreenshot}
                      alt="Payment Screenshot"
                      className="gmb-modal__screenshot"
                      onClick={() => window.open(order.paymentScreenshot, '_blank')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="gmb-modal__footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
