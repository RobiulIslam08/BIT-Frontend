import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3, Loader2 } from 'lucide-react';
import { updateGMBOrderInfo } from '@/api/gmbOrderApi';

const SERVICE_OPTIONS = [
  { value: 'new', label: 'New Profile Setup' },
  { value: 'recovery', label: 'Profile Recovery' },
  { value: 'regular', label: 'Profile Management' },
];

export default function EditOrderModal({ order, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    category: '',
    serviceType: 'new',
    finalAmount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order) {
      setFormData({
        businessName: order.businessName || '',
        email: order.email || '',
        phone: order.phone || '',
        category: order.category || '',
        serviceType: order.serviceType || 'new',
        finalAmount: order.finalAmount || 0,
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'finalAmount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await updateGMBOrderInfo(order._id, formData);
      if (response.success) {
        onUpdate(order._id, formData);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order info');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

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
          className="gmb-modal__content gmb-modal__content--edit"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gmb-modal__header">
            <div className="gmb-modal__title">
              <Edit3 size={20} />
              Edit Order #{order.orderId || order._id?.slice(-6)}
            </div>
            <button className="gmb-modal__close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="gmb-modal__form">
            <div className="gmb-modal__body">
              {error && (
                <div className="gmb-orders__toast gmb-orders__toast--error" style={{ position: 'relative', marginBottom: '1rem', transform: 'none' }}>
                  {error}
                </div>
              )}

              <div className="gmb-modal__field-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="gmb-modal__field gmb-modal__field--full">
                  <label className="gmb-modal__field-label" htmlFor="businessName">Business Name *</label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    className="gmb-orders__input"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="gmb-modal__field">
                  <label className="gmb-modal__field-label" htmlFor="email">Customer Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="gmb-orders__input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="gmb-modal__field">
                  <label className="gmb-modal__field-label" htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    className="gmb-orders__input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="gmb-modal__field">
                  <label className="gmb-modal__field-label" htmlFor="category">Category</label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    className="gmb-orders__input"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                <div className="gmb-modal__field">
                  <label className="gmb-modal__field-label" htmlFor="serviceType">Service Type *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    className="gmb-orders__filter-select"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    style={{ width: '100%' }}
                  >
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="gmb-modal__field">
                  <label className="gmb-modal__field-label" htmlFor="finalAmount">Amount (SAR) *</label>
                  <input
                    id="finalAmount"
                    name="finalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="gmb-orders__input"
                    value={formData.finalAmount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="gmb-modal__footer" style={{ padding: '1.25rem', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSubmitting ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
