// ============================================
// BIT SOFTWARE — GMB Step 5: Service Selection & Payment
// ============================================

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Upload, CheckCircle2, AlertCircle, Tag, Shield,
  FileText, ArrowLeft, Send, Loader2, X, Image as ImageIcon,
  ShieldAlert, Banknote, Receipt
} from 'lucide-react';
import './Step5Payment.css';

// Pricing constants
const PRICING = {
  NEW_PROFILE: 399,
  RECOVERY_SERVICE: 500,
};

export default function Step5Payment({ form, onBack, onSubmit, isSubmitting }) {
  // ─── LOCAL STATE ───
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [profileHasIssues, setProfileHasIssues] = useState(null);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethodDetail, setPaymentMethodDetail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation error
  const [validationError, setValidationError] = useState('');

  // ─── COMPUTED VALUES ───
  const getServiceType = () => {
    if (!hasExistingProfile) return 'new';
    if (profileHasIssues === 'yes') return 'recovery';
    return 'regular';
  };

  const serviceType = getServiceType();

  const getBasePrice = () => {
    if (serviceType === 'new') return PRICING.NEW_PROFILE;
    if (serviceType === 'recovery') return PRICING.RECOVERY_SERVICE;
    return PRICING.NEW_PROFILE;
  };

  const basePrice = getBasePrice();
  const showCoupon = serviceType !== 'recovery';
  const finalPrice = showCoupon ? Math.max(0, basePrice - couponDiscount) : basePrice;

  // ─── COUPON HANDLER ───
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMessage('');

    try {
      // TODO: Replace with actual API call when backend is ready
      // const res = await validateCoupon(couponCode);
      // Simulated validation — will connect to Express backend
      await new Promise(resolve => setTimeout(resolve, 800));

      // Demo coupon codes for testing
      const testCoupons = {
        'BIT50': 50,
        'WELCOME100': 100,
        'SAVE25': 25,
      };

      const discount = testCoupons[couponCode.toUpperCase()];
      if (discount) {
        setCouponDiscount(discount);
        setCouponApplied(true);
        setCouponMessage(`Coupon applied! You save ${discount} SAR.`);
      } else {
        setCouponDiscount(0);
        setCouponApplied(false);
        setCouponMessage('Invalid coupon code. Please try again.');
      }
    } catch {
      setCouponMessage('Failed to validate coupon. Please try again.');
      setCouponApplied(false);
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode]);

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponMessage('');
  };

  // ─── FILE UPLOAD ───
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setValidationError('Only JPEG, PNG, WebP, GIF, or PDF files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('File size must be under 5MB.');
        return;
      }
      setPaymentScreenshot(file);
      setValidationError('');
    }
  };

  const handleRemoveFile = () => {
    setPaymentScreenshot(null);
  };

  // ─── FORM VALIDATION ───
  const validateAndSubmit = () => {
    setValidationError('');

    // Recovery-specific validation
    if (serviceType === 'recovery') {
      if (!recoveryEmail.trim() || !recoveryPhone.trim()) {
        setValidationError('Please provide the registered email and phone number for recovery.');
        return;
      }
    }

    // Payment method required
    if (!paymentMethod) {
      setValidationError('Please select a payment method.');
      return;
    }

    // Manual payment validation: must provide screenshot OR transaction details
    if (paymentMethod === 'manual') {
      const hasScreenshot = !!paymentScreenshot;
      const hasTransactionDetails = transactionId.trim() && paymentMethodDetail.trim() && senderName.trim() && paymentDate.trim();

      if (!hasScreenshot && !hasTransactionDetails) {
        setValidationError('Please upload your payment proof or provide transaction details.');
        return;
      }
    }

    // Terms must be accepted
    if (!termsAccepted) {
      setValidationError('You must accept the Terms of Service and Refund Policy to continue.');
      return;
    }

    // Build order payload
    const orderPayload = {
      // From parent form
      businessName: form.businessName,
      category: form.category,
      hasPhysicalLocation: form.hasPhysicalLocation,
      streetAddress: form.streetAddress,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      latitude: form.latitude,
      longitude: form.longitude,
      serviceAreas: form.serviceAreas,
      phone: `${form.phoneCode} ${form.phone}`,
      whatsapp: form.whatsapp,
      email: form.email,
      website: form.website,
      description: form.description,
      servicesList: form.servicesList,

      // Step 5 data
      serviceType,
      hasExistingProfile,
      profileHasIssues: profileHasIssues === 'yes',
      recoveryEmail: serviceType === 'recovery' ? recoveryEmail : undefined,
      recoveryPhone: serviceType === 'recovery' ? recoveryPhone : undefined,
      originalPrice: basePrice,
      couponCode: couponApplied ? couponCode : undefined,
      discountAmount: couponDiscount,
      finalAmount: finalPrice,
      paymentMethod,
      termsAccepted: true,

      // Manual payment details
      paymentScreenshot: paymentMethod === 'manual' ? paymentScreenshot : undefined,
      transactionDetails: paymentMethod === 'manual' ? {
        transactionId: transactionId || undefined,
        paymentMethodDetail: paymentMethodDetail || undefined,
        senderName: senderName || undefined,
        paymentDate: paymentDate || undefined,
      } : undefined,

      // Status defaults
      paymentStatus: paymentMethod === 'paypal' ? 'paid' : 'pending_verification',
      orderStatus: 'pending_review',
    };

    onSubmit(orderPayload);
  };

  // Check if submit should be enabled
  const isFormValid = (() => {
    if (!paymentMethod) return false;
    if (!termsAccepted) return false;
    if (serviceType === 'recovery' && (!recoveryEmail.trim() || !recoveryPhone.trim())) return false;
    if (paymentMethod === 'manual') {
      const hasScreenshot = !!paymentScreenshot;
      const hasDetails = transactionId.trim() && paymentMethodDetail.trim() && senderName.trim() && paymentDate.trim();
      if (!hasScreenshot && !hasDetails) return false;
    }
    return true;
  })();

  return (
    <div className="form-step-content">
      <h3 className="form-step-title">Service Selection & Payment</h3>
      <p className="form-step-subtitle">
        Choose your service type, apply any coupon codes, and select your preferred payment method.
      </p>

      {/* ─── EXISTING PROFILE CHECKBOX ─── */}
      <label className={`gmb-existing-check ${hasExistingProfile ? 'checked' : ''}`}>
        <input
          type="checkbox"
          checked={hasExistingProfile}
          onChange={(e) => {
            setHasExistingProfile(e.target.checked);
            if (!e.target.checked) {
              setProfileHasIssues(null);
              setRecoveryEmail('');
              setRecoveryPhone('');
            }
            // Reset coupon when switching
            handleRemoveCoupon();
          }}
        />
        <div className="gmb-existing-check-text">
          <strong>Have you previously created a Google Business Profile?</strong>
          <span>Check this if you already have a Google Business Profile that needs management or recovery.</span>
        </div>
      </label>

      {/* ─── PROFILE ISSUES SECTION (Scenario B) ─── */}
      {hasExistingProfile && (
        <div className="gmb-issue-section">
          <div className="gmb-issue-question">
            <ShieldAlert size={18} />
            Is your Google Business Profile suspended, disabled, restricted, or experiencing any issues?
          </div>

          <div className="gmb-issue-options">
            <label className={`gmb-issue-option ${profileHasIssues === 'yes' ? 'active' : ''}`}>
              <input
                type="radio"
                name="profileIssues"
                value="yes"
                checked={profileHasIssues === 'yes'}
                onChange={() => {
                  setProfileHasIssues('yes');
                  handleRemoveCoupon();
                }}
              />
              Yes, it has issues
            </label>
            <label className={`gmb-issue-option ${profileHasIssues === 'no' ? 'active' : ''}`}>
              <input
                type="radio"
                name="profileIssues"
                value="no"
                checked={profileHasIssues === 'no'}
                onChange={() => setProfileHasIssues('no')}
              />
              No, it's working fine
            </label>
          </div>

          {/* Recovery Email & Phone */}
          {profileHasIssues === 'yes' && (
            <div className="gmb-recovery-fields">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Registered Email Address *</label>
                <input
                  type="email"
                  className="input"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your-gmb@gmail.com"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Registered Phone Number *</label>
                <input
                  type="tel"
                  className="input"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  required
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SERVICE & PRICING CARD ─── */}
      <div className="gmb-service-card">
        <div className={`gmb-service-badge ${serviceType === 'new' ? 'new-profile' : serviceType === 'recovery' ? 'recovery' : 'regular'}`}>
          {serviceType === 'new' && <><CheckCircle2 size={12} /> New Profile</>}
          {serviceType === 'recovery' && <><ShieldAlert size={12} /> Recovery Service</>}
          {serviceType === 'regular' && <><Shield size={12} /> Profile Management</>}
        </div>

        <div className="gmb-service-name">
          {serviceType === 'new' && 'New Google Business Profile Creation'}
          {serviceType === 'recovery' && 'GMB Recovery / Issue Resolution Service'}
          {serviceType === 'regular' && 'Google Business Profile Management'}
        </div>

        <div className="gmb-price-display">
          {couponDiscount > 0 && showCoupon ? (
            <>
              <span className="gmb-price-original has-discount">{basePrice} SAR</span>
              <span className="gmb-price-final">{finalPrice} SAR</span>
            </>
          ) : (
            <span className="gmb-price-original">{basePrice} SAR</span>
          )}
        </div>

        {couponApplied && showCoupon && (
          <div className="gmb-discount-badge">
            <Tag size={12} /> You save {couponDiscount} SAR with coupon
          </div>
        )}
      </div>

      {/* ─── COUPON SECTION (NOT for recovery services) ─── */}
      {showCoupon && (
        <div className="gmb-coupon-section">
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            <Tag size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.35rem' }} />
            Have a coupon code?
          </label>

          <div className="gmb-coupon-input-wrap">
            <input
              type="text"
              className="gmb-coupon-input"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={couponApplied}
            />
            {couponApplied ? (
              <button
                type="button"
                className="gmb-coupon-apply-btn"
                onClick={handleRemoveCoupon}
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
              >
                <X size={14} /> Remove
              </button>
            ) : (
              <button
                type="button"
                className="gmb-coupon-apply-btn"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? <Loader2 size={14} className="gmb-btn-spinner" /> : <Tag size={14} />}
                {couponLoading ? 'Validating...' : 'Apply Coupon'}
              </button>
            )}
          </div>

          {couponMessage && (
            <div className={`gmb-coupon-message ${couponApplied ? 'success' : 'error'}`}>
              {couponApplied ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {couponMessage}
            </div>
          )}
        </div>
      )}

      {/* ─── PAYMENT METHOD SELECTION ─── */}
      <div className="gmb-payment-methods">
        <div className="gmb-payment-label">
          <CreditCard size={16} /> Choose Payment Method
        </div>

        {/* Option 1: PayPal */}
        <label className={`gmb-payment-card ${paymentMethod === 'paypal' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={() => setPaymentMethod('paypal')}
          />
          <div className="gmb-payment-card-body">
            <div className="gmb-payment-card-title">
              Pay with PayPal
              <span className="paypal-badge">PayPal</span>
            </div>
            <span className="gmb-payment-card-desc">
              Secure online payment via PayPal. You'll be redirected to complete the transaction.
            </span>
          </div>
        </label>

        {/* Option 2: Manual Payment */}
        <label className={`gmb-payment-card ${paymentMethod === 'manual' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="manual"
            checked={paymentMethod === 'manual'}
            onChange={() => setPaymentMethod('manual')}
          />
          <div className="gmb-payment-card-body">
            <div className="gmb-payment-card-title">
              <Banknote size={16} /> Manual Payment
            </div>
            <span className="gmb-payment-card-desc">
              I have already completed payment through bank transfer, mobile banking, or another approved payment method.
            </span>
          </div>
        </label>
      </div>

      {/* ─── MANUAL PAYMENT VERIFICATION ─── */}
      {paymentMethod === 'manual' && (
        <div className="gmb-manual-payment">
          <h4 className="form-step-title" style={{ fontSize: 'var(--text-base)', marginBottom: '0.25rem' }}>
            Payment Verification
          </h4>
          <p className="form-step-subtitle" style={{ marginBottom: '1.25rem' }}>
            Please provide your payment proof. Upload a screenshot <strong>OR</strong> fill in the transaction details below.
          </p>

          {/* Option A: Screenshot Upload */}
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label">
              <ImageIcon size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.35rem' }} />
              Payment Screenshot
            </label>
            <div className={`gmb-upload-area ${paymentScreenshot ? 'has-file' : ''}`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleFileChange}
              />
              {!paymentScreenshot ? (
                <>
                  <Upload size={32} className="gmb-upload-icon" />
                  <div className="gmb-upload-text">Click or drag to upload screenshot</div>
                  <div className="gmb-upload-hint">JPEG, PNG, WebP, GIF, or PDF — Max 5MB</div>
                </>
              ) : (
                <>
                  <div className="gmb-upload-file-info">
                    <CheckCircle2 size={18} />
                    <span>{paymentScreenshot.name}</span>
                  </div>
                  <button
                    type="button"
                    className="gmb-upload-remove"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  >
                    Remove file
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="gmb-manual-divider">
            <span>OR</span>
          </div>

          {/* Option B: Transaction Details */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">
              <Receipt size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.35rem' }} />
              Transaction Details
            </label>
          </div>

          <div className="gmb-transaction-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction ID</label>
              <input
                type="text"
                className="input"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-20260622-1234"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Method</label>
              <input
                type="text"
                className="input"
                value={paymentMethodDetail}
                onChange={(e) => setPaymentMethodDetail(e.target.value)}
                placeholder="e.g. Bank Transfer, bKash, STC Pay"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sender Name</label>
              <input
                type="text"
                className="input"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Mohammad Al-Farsi"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                className="input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TERMS & CONDITIONS ─── */}
      <div className={`gmb-terms-wrap ${termsAccepted ? 'checked' : ''}`}>
        <input
          type="checkbox"
          id="gmb-terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <label htmlFor="gmb-terms" className="gmb-terms-text">
          I have read and agree to the{' '}
          <Link to="/terms-and-conditions" target="_blank">
            Terms of Service and Refund Policy
          </Link>.
          By proceeding, I understand that refunds are only available if the requested service
          cannot be delivered.
        </label>
      </div>

      {/* ─── ORDER SUMMARY ─── */}
      <div className="gmb-order-summary">
        <h4>
          <FileText size={16} /> Order Summary
        </h4>

        <div className="gmb-summary-row">
          <span className="gmb-summary-label">Service Type</span>
          <span className="gmb-summary-value">
            {serviceType === 'new' && 'New Profile Creation'}
            {serviceType === 'recovery' && 'GMB Recovery / Issue Resolution'}
            {serviceType === 'regular' && 'Profile Management'}
          </span>
        </div>

        <div className="gmb-summary-row">
          <span className="gmb-summary-label">Business Name</span>
          <span className="gmb-summary-value">{form.businessName || '—'}</span>
        </div>

        <div className="gmb-summary-row">
          <span className="gmb-summary-label">Original Price</span>
          <span className="gmb-summary-value">{basePrice} SAR</span>
        </div>

        {couponDiscount > 0 && showCoupon && (
          <div className="gmb-summary-row">
            <span className="gmb-summary-label">Coupon Discount</span>
            <span className="gmb-summary-value discount">−{couponDiscount} SAR</span>
          </div>
        )}

        <hr className="gmb-summary-divider" />

        <div className="gmb-summary-row gmb-summary-total">
          <span className="gmb-summary-label">Final Amount</span>
          <span className="gmb-summary-value">{finalPrice} SAR</span>
        </div>

        <hr className="gmb-summary-divider" />

        <div className="gmb-summary-row">
          <span className="gmb-summary-label">Payment Method</span>
          <span className="gmb-summary-value">
            {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'manual' ? 'Manual Payment' : '— Not selected'}
          </span>
        </div>

        <div className="gmb-summary-row">
          <span className="gmb-summary-label">Terms Accepted</span>
          <span className={`gmb-summary-value ${termsAccepted ? 'status-ok' : ''}`}>
            {termsAccepted ? <><CheckCircle2 size={13} /> Yes</> : '— Not yet'}
          </span>
        </div>
      </div>

      {/* ─── VALIDATION ERROR ─── */}
      {validationError && (
        <div className="gmb-validation-error">
          <AlertCircle size={16} />
          {validationError}
        </div>
      )}

      {/* ─── ACTION BUTTONS ─── */}
      <div className="form-actions row-gap">
        <button type="button" onClick={onBack} className="btn btn-secondary btn-lg">
          <ArrowLeft size={18} /> Back
        </button>

        <button
          type="button"
          className={`gmb-submit-btn ${isSubmitting ? 'loading' : isFormValid ? 'enabled' : 'disabled'}`}
          onClick={validateAndSubmit}
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? (
            <>
              <span className="gmb-btn-spinner" />
              Processing Order...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Order — {finalPrice} SAR
            </>
          )}
        </button>
      </div>
    </div>
  );
}
