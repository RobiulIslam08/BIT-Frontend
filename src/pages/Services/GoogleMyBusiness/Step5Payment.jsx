// ============================================
// BIT SOFTWARE — GMB Step 5: Service Selection & Payment
// ============================================

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  CreditCard, Upload, CheckCircle2, AlertCircle, Tag, Shield,
  FileText, ArrowLeft, Send, Loader2, X, Image as ImageIcon,
  ShieldAlert, Banknote, Receipt, Copy, Check, Landmark
} from 'lucide-react';
import './Step5Payment.css';
import { toast } from '@/components/common/Toast/Toast';
import { validateCoupon } from '@/api/gmbOrderApi';

// Pricing constants
const PRICING = {
  NEW_PROFILE: 4,
  RECOVERY_SERVICE: 5,
};

// ─── PayPal Buttons Inner Component ───
// Separated so it can use usePayPalScriptReducer inside PayPalScriptProvider context
function PayPalCheckoutButtons({ finalPrice, serviceType, form, hasExistingProfile, profileHasIssues, recoveryEmail, recoveryPhone, basePrice, couponApplied, couponCode, couponDiscount, termsAccepted, setValidationError, isSubmittingLocal, setIsSubmittingLocal, onSubmit, isSubmitting }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="paypal-loading-state">
        <Loader2 size={24} className="gmb-btn-spinner" style={{ color: 'var(--color-primary)' }} />
        <span>Loading PayPal checkout...</span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="paypal-error-state">
        <AlertCircle size={20} />
        <span>Failed to load PayPal. Please check your internet connection and refresh.</span>
      </div>
    );
  }

  if (isSubmittingLocal || isSubmitting) {
    return (
      <div className="paypal-processing-state">
        <Loader2 size={20} className="gmb-btn-spinner" />
        <span>Capturing payment and placing order...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
      disabled={isSubmittingLocal || isSubmitting}
      forceReRender={[finalPrice]}
      onClick={(data, actions) => {
        if (!termsAccepted) {
          const msg = 'You must accept the Terms of Service and Refund Policy to proceed with PayPal payment.';
          setValidationError(msg);
          toast.warning(msg);
          return actions.reject();
        }
        setValidationError('');
        return actions.resolve();
      }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: (finalPrice / 3.75).toFixed(2),
              },
              description: `BIT Software — GMB Service: ${serviceType === 'new' ? 'New Profile Setup' : serviceType === 'recovery' ? 'Profile Recovery' : 'Profile Management'}`,
            },
          ],
          application_context: {
            brand_name: 'BIT Software & IT Solution',
            user_action: 'PAY_NOW',
          },
        });
      }}
      onApprove={async (data, actions) => {
        setIsSubmittingLocal(true);
        try {
          const details = await actions.order.capture();
          const orderPayload = {
            // Business info from parent form
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
            paymentMethod: 'paypal',
            termsAccepted: true,
            // PayPal transaction details
            paypalOrderId: data.orderID,
            paypalTransactionId: details.id,
            transactionDetails: {
              transactionId: details.id,
              senderName: `${details.payer?.name?.given_name || ''} ${details.payer?.name?.surname || ''}`.trim(),
              paymentDate: details.create_time,
            },
            paymentStatus: 'paid',
            orderStatus: 'pending_review',
          };
          onSubmit(orderPayload);
        } catch (err) {
          console.error('PayPal capture error:', err);
          const msg = 'Failed to capture PayPal transaction. Please contact support.';
          setValidationError(msg);
          toast.error(msg);
        } finally {
          setIsSubmittingLocal(false);
        }
      }}
      onError={(err) => {
        console.error('PayPal SDK Error:', err);
        const msg = 'PayPal payment failed. Please try again or use manual payment.';
        setValidationError(msg);
        toast.error(msg);
      }}
      onCancel={() => {
        toast.info('PayPal payment cancelled.');
      }}
    />
  );
}

// ─── MAIN COMPONENT ───
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
  const [copiedField, setCopiedField] = useState('');

  const handleCopy = useCallback((text, fieldId, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedField('');
    }, 2000);
  }, []);

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation error
  const [validationError, setValidationError] = useState('');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // ─── COMPUTED VALUES ───
  const serviceType = (() => {
    if (!hasExistingProfile) return 'new';
    if (profileHasIssues === 'yes') return 'recovery';
    return 'regular';
  })();

  const basePrice = (() => {
    if (serviceType === 'recovery') return PRICING.RECOVERY_SERVICE;
    return PRICING.NEW_PROFILE;
  })();

  const showCoupon = serviceType !== 'recovery';
  const finalPrice = showCoupon ? Math.max(0, basePrice - couponDiscount) : basePrice;

  // ─── PayPal Client ID ───
  // Uses real client ID from env if provided, otherwise falls back to 'sb' (sandbox mode)
  const paypalClientId = (() => {
    const envId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!envId || envId === 'YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE' || envId.trim() === '') {
      return 'sb'; // PayPal sandbox test mode
    }
    return envId;
  })();

  // ─── COUPON HANDLER ───
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMessage('');

    try {
      const result = await validateCoupon(couponCode);
      const discount = result?.data?.discount;

      if (discount) {
        setCouponDiscount(discount);
        setCouponApplied(true);
        const msg = `Coupon applied! You save ${discount} SAR.`;
        setCouponMessage(msg);
        toast.success(msg);
      } else {
        setCouponDiscount(0);
        setCouponApplied(false);
        const msg = 'Invalid coupon code. Please try again.';
        setCouponMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponApplied(false);
      const msg =
        err?.response?.data?.message ||
        'Invalid coupon code. Please try again.';
      setCouponMessage(msg);
      toast.error(msg);
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode]);

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponMessage('');
    toast.info('Coupon code removed.');
  };

  // ─── FILE UPLOAD ───
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        const msg = 'Only JPEG, PNG, WebP, GIF, or PDF files are allowed.';
        setValidationError(msg);
        toast.error(msg);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        const msg = 'File size must be under 5MB.';
        setValidationError(msg);
        toast.error(msg);
        return;
      }
      setPaymentScreenshot(file);
      setValidationError('');
      toast.success(`Proof of payment loaded: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setPaymentScreenshot(null);
    toast.info('Payment proof removed.');
  };

  // ─── FORM VALIDATION (Manual payment only) ───
  const validateAndSubmit = () => {
    setValidationError('');

    if (serviceType === 'recovery') {
      if (!recoveryEmail.trim() || !recoveryPhone.trim()) {
        const msg = 'Please provide the registered email and phone number for recovery.';
        setValidationError(msg);
        toast.warning(msg);
        return;
      }
    }

    if (!paymentMethod) {
      const msg = 'Please select a payment method.';
      setValidationError(msg);
      toast.warning(msg);
      return;
    }

    if (paymentMethod === 'manual') {
      const hasScreenshot = !!paymentScreenshot;
      const hasTransactionDetails =
        transactionId.trim() && paymentMethodDetail.trim() && senderName.trim() && paymentDate.trim();

      if (!hasScreenshot && !hasTransactionDetails) {
        const msg = 'Please upload your payment proof or provide transaction details.';
        setValidationError(msg);
        toast.warning(msg);
        return;
      }
    }

    if (!termsAccepted) {
      const msg = 'You must accept the Terms of Service and Refund Policy to continue.';
      setValidationError(msg);
      toast.warning(msg);
      return;
    }

    const orderPayload = {
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
      paymentScreenshot: paymentMethod === 'manual' ? paymentScreenshot : undefined,
      transactionDetails:
        paymentMethod === 'manual'
          ? {
              transactionId: transactionId || undefined,
              paymentMethodDetail: paymentMethodDetail || undefined,
              senderName: senderName || undefined,
              paymentDate: paymentDate || undefined,
            }
          : undefined,
      paymentStatus: 'pending_verification',
      orderStatus: 'pending_review',
    };

    onSubmit(orderPayload);
  };

  // Check if submit button should be enabled (manual payment only)
  const isFormValid = (() => {
    if (!paymentMethod || paymentMethod === 'paypal') return false;
    if (!termsAccepted) return false;
    if (serviceType === 'recovery' && (!recoveryEmail.trim() || !recoveryPhone.trim())) return false;
    if (paymentMethod === 'manual') {
      const hasScreenshot = !!paymentScreenshot;
      const hasDetails =
        transactionId.trim() && paymentMethodDetail.trim() && senderName.trim() && paymentDate.trim();
      if (!hasScreenshot && !hasDetails) return false;
    }
    return true;
  })();

  return (
    <div className="form-step-content">
      <h3 className="form-step-title">Service Selection &amp; Payment</h3>
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
            handleRemoveCoupon();
          }}
        />
        <div className="gmb-existing-check-text">
          <strong>Have you previously created a Google Business Profile?</strong>
          <span>Check this if you already have a Google Business Profile that needs management or recovery.</span>
        </div>
      </label>

      {/* ─── PROFILE ISSUES SECTION ─── */}
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
              No, it&apos;s working fine
            </label>
          </div>

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

      {/* ─── COUPON SECTION ─── */}
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
              Pay with Credit / Debit Card
              <span className="paypal-badge">PayPal</span>
            </div>
            <span className="gmb-payment-card-desc">
              Secure online payment via PayPal. Pay instantly with your PayPal account or credit/debit card.
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
          <div className="gmb-bank-info-header">
            <Landmark size={18} className="gmb-bank-info-icon" />
            <h4 className="gmb-bank-info-title">Our Bank Transfer Details</h4>
          </div>
          <p className="gmb-bank-info-subtitle">
            Transfer the amount to any of the banks below, copy the information, and then upload your receipt or enter transfer details.
          </p>

          <div className="gmb-bank-grid">
            {/* Saudi National Bank Card */}
            <div
              className={`gmb-bank-card snb ${paymentMethodDetail === 'SNB' ? 'active' : ''}`}
              onClick={() => setPaymentMethodDetail('SNB')}
            >
              <div className="gmb-bank-badge-wrap">
                <span className="gmb-bank-card-badge snb">SNB</span>
                <span className="gmb-bank-card-select-hint">Click to Select</span>
              </div>
              <div className="gmb-bank-card-name">The Saudi National Bank</div>

              <div className="gmb-bank-fields">
                <div className="gmb-bank-field-row">
                  <span className="field-label">Name</span>
                  <div className="field-value-copy">
                    <span className="field-value text-bold">MD JAKIR HOSSEN</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('MD JAKIR HOSSEN', 'snb-name', 'Account Name'); }}
                    >
                      {copiedField === 'snb-name' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">Account No.</span>
                  <div className="field-value-copy">
                    <span className="field-value">42100001258506</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('42100001258506', 'snb-acc', 'Account Number'); }}
                    >
                      {copiedField === 'snb-acc' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">IBAN</span>
                  <div className="field-value-copy">
                    <span className="field-value font-mono">SA6310000042100001258506</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('SA6310000042100001258506', 'snb-iban', 'IBAN'); }}
                    >
                      {copiedField === 'snb-iban' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">Swift Code</span>
                  <div className="field-value-copy">
                    <span className="field-value">NCBKSAJE</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('NCBKSAJE', 'snb-swift', 'Swift Code'); }}
                    >
                      {copiedField === 'snb-swift' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STC Bank Card */}
            <div
              className={`gmb-bank-card stc ${paymentMethodDetail === 'STC' ? 'active' : ''}`}
              onClick={() => setPaymentMethodDetail('STC')}
            >
              <div className="gmb-bank-badge-wrap">
                <span className="gmb-bank-card-badge stc">STC Bank</span>
                <span className="gmb-bank-card-select-hint">Click to Select</span>
              </div>
              <div className="gmb-bank-card-name">STC Bank / Pay</div>

              <div className="gmb-bank-fields">
                <div className="gmb-bank-field-row">
                  <span className="field-label">Name</span>
                  <div className="field-value-copy">
                    <span className="field-value text-bold">MD JAKIR HOSSEN</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('MD JAKIR HOSSEN', 'stc-name', 'Account Name'); }}
                    >
                      {copiedField === 'stc-name' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">Account No.</span>
                  <div className="field-value-copy">
                    <span className="field-value">1281187925</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('1281187925', 'stc-acc', 'Account Number'); }}
                    >
                      {copiedField === 'stc-acc' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">IBAN</span>
                  <div className="field-value-copy">
                    <span className="field-value font-mono">SA4578000000001281187925</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('SA4578000000001281187925', 'stc-iban', 'IBAN'); }}
                    >
                      {copiedField === 'stc-iban' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="gmb-bank-field-row">
                  <span className="field-label">STC Pay</span>
                  <div className="field-value-copy">
                    <span className="field-value font-mono text-bold">0597516519</span>
                    <button
                      type="button"
                      className="gmb-bank-copy-btn"
                      onClick={(e) => { e.stopPropagation(); handleCopy('0597516519', 'stc-pay', 'STC Pay Number'); }}
                    >
                      {copiedField === 'stc-pay' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="gmb-manual-bank-divider" />

          <h4 className="form-step-title" style={{ fontSize: 'var(--text-base)', marginBottom: '0.25rem' }}>
            Payment Verification
          </h4>
          <p className="form-step-subtitle" style={{ marginBottom: '1.25rem' }}>
            Please provide your payment proof. Upload a screenshot <strong>OR</strong> fill in the transaction details below.
          </p>

          {/* Screenshot Upload */}
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

          {/* Transaction Details */}
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
              <label className="form-label">Payment Method *</label>
              <select
                className="input"
                value={paymentMethodDetail}
                onChange={(e) => setPaymentMethodDetail(e.target.value)}
                required
              >
                <option value="">Select Bank</option>
                <option value="STC">STC</option>
                <option value="SNB">SNB</option>
              </select>
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
          </Link>
          . By proceeding, I understand that refunds are only available if the requested service cannot be delivered.
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
      <div className="form-actions row-gap" style={{ flexDirection: paymentMethod === 'paypal' ? 'column' : 'row', gap: '1rem' }}>
        {paymentMethod !== 'paypal' ? (
          <>
            {/* Back + Submit (Manual / No selection) */}
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
          </>
        ) : (
          /* PayPal Payment Section */
          <div className="paypal-section-wrapper">
            <button type="button" onClick={onBack} className="btn btn-secondary btn-lg paypal-back-btn">
              <ArrowLeft size={18} /> Back
            </button>

            <div className="paypal-checkout-box">
              <div className="paypal-amount-info">
                <span>Amount for PayPal checkout:</span>
                <strong>${(finalPrice / 3.75).toFixed(2)} USD</strong>
                <span className="paypal-sar-note">(= {finalPrice} SAR)</span>
              </div>

              {!termsAccepted && (
                <div className="paypal-terms-warning">
                  <AlertCircle size={15} />
                  Please accept the Terms of Service above before paying with PayPal.
                </div>
              )}

              <PayPalScriptProvider
                options={{
                  'client-id': paypalClientId,
                  currency: 'USD',
                  intent: 'capture',
                  components: 'buttons',
                }}
              >
                <PayPalCheckoutButtons
                  finalPrice={finalPrice}
                  serviceType={serviceType}
                  form={form}
                  hasExistingProfile={hasExistingProfile}
                  profileHasIssues={profileHasIssues}
                  recoveryEmail={recoveryEmail}
                  recoveryPhone={recoveryPhone}
                  basePrice={basePrice}
                  couponApplied={couponApplied}
                  couponCode={couponCode}
                  couponDiscount={couponDiscount}
                  termsAccepted={termsAccepted}
                  setValidationError={setValidationError}
                  isSubmittingLocal={isSubmittingLocal}
                  setIsSubmittingLocal={setIsSubmittingLocal}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}