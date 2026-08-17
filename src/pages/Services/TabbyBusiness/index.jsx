// ============================================
// BIT SOFTWARE — Tabby Business Account Setup
// ============================================

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, Clock, Shield, Upload, ArrowRight, ArrowLeft,
  FileText, Sparkles, BadgeCheck, RefreshCw, X,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { toast } from '@/components/common/Toast/Toast';
import { submitTabbyOrder, payTabbyWithWallet } from '@/api/tabbyOrderApi';
import { useCurrency } from '@/context/CurrencyContext';
import { trackPurchase } from '@/utils/analytics';
import {
  TABBY_PRICE_SAR,
  TABBY_SAUDI_CITIES,
  TABBY_DOC_FIELDS,
} from '@/constants/tabbyService';
import StepPayment from './StepPayment';
import './TabbyBusiness.css';

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Documents' },
  { id: 3, label: 'Pay' },
];

const emptyForm = {
  legalCompanyName: '',
  crNumber: '',
  vatRegistered: false,
  vatNumber: '',
  city: 'Riyadh',
  nationalAddressCode: '',
  ownerName: '',
  ownerNationalId: '',
  email: '',
  phone: '',
  website: '',
  iban: '',
};

const emptyFiles = {
  crCopy: null,
  nationalAddressPdf: null,
  vatCertificate: null,
  ibanCertificate: null,
  ownerIdCopy: null,
};

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 4 * 1024 * 1024;
const DRAFT_KEY = 'bit_tabby_order_draft';
const SAUDI_IBAN = /^SA[0-9]{22}$/;

const loadDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.form || typeof parsed.form !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

export default function TabbyBusiness() {
  const { formatFromSARWithCode } = useCurrency();
  const formTopRef = useRef(null);
  const draft = useRef(loadDraft()).current;
  const [step, setStep] = useState(() => {
    const saved = Number(draft?.step) || 1;
    return saved >= 2 ? 2 : 1;
  });
  const [form, setForm] = useState(() => {
    const restored = draft?.form && typeof draft.form === 'object' ? draft.form : {};
    const merged = { ...emptyForm };
    Object.keys(emptyForm).forEach((key) => {
      if (restored[key] !== undefined && restored[key] !== null) merged[key] = restored[key];
    });
    return merged;
  });
  const [files, setFiles] = useState(emptyFiles);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (Number(draft?.step) >= 2) {
      toast.info('Your details were restored. Please upload the documents again, then continue to pay.');
    }
  }, [draft]);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
    } catch { /* quota / private mode */ }
  }, [form, step]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const scrollToForm = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateFile = (file) => {
    if (!file) return 'This document is required.';
    if (!ACCEPTED.includes(file.type)) return 'Use PDF, JPG, PNG, or WebP.';
    if (file.size > MAX_BYTES) return 'Maximum size is 4MB.';
    return '';
  };

  const validateStep = (current) => {
    const next = {};
    if (current === 1) {
      if (!form.legalCompanyName.trim()) next.legalCompanyName = 'Company name is required.';
      if (!form.crNumber.trim()) next.crNumber = 'CR number is required.';
      if (!form.city) next.city = 'City is required.';
      if (!form.nationalAddressCode.trim()) next.nationalAddressCode = 'National Address code is required.';
      if (!form.ownerName.trim()) next.ownerName = 'Your name is required.';
      if (!form.ownerNationalId.trim()) next.ownerNationalId = 'National ID / Iqama is required.';
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Valid email is required.';
      if (!form.phone.trim()) next.phone = 'Phone number is required.';
      if (!form.iban.trim()) next.iban = 'IBAN is required.';
      else if (!SAUDI_IBAN.test(form.iban.replace(/\s+/g, ''))) {
        next.iban = 'Enter a valid Saudi IBAN (SA followed by 22 digits).';
      }
      if (form.vatRegistered && !form.vatNumber.trim()) next.vatNumber = 'VAT number is required.';
    }
    if (current === 2) {
      TABBY_DOC_FIELDS.forEach((doc) => {
        const required = doc.required || (doc.requiredIfVat && form.vatRegistered);
        if (!required) return;
        const msg = validateFile(files[doc.key]);
        if (msg) next[doc.key] = msg;
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      toast.warning('Please complete the highlighted fields.');
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    scrollToForm();
  };

  const handleFile = (key, file) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const msg = validateFile(file);
    if (msg) {
      setErrors((prev) => ({ ...prev, [key]: msg }));
      toast.error(msg);
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      const api = payload.paymentMethod === 'wallet' ? payTabbyWithWallet : submitTabbyOrder;
      const res = await api(payload);
      if (!res?.success) throw new Error(res?.message || 'Order failed.');
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setSubmitted(res.data);
      trackPurchase({
        transaction_id: res.data?.orderId,
        value: TABBY_PRICE_SAR,
        currency: 'SAR',
        items: [{ item_id: 'tabby_business', item_name: 'Tabby Business Account Setup', price: TABBY_PRICE_SAR, quantity: 1 }],
      });
      toast.success('Payment received. Setup will be completed within 3 working days.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Could not place the order.';
      toast.error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewRows = [
    ['Company', form.legalCompanyName],
    ['CR number', form.crNumber],
    ['City', form.city],
    ['National Address', form.nationalAddressCode],
    ['VAT', form.vatRegistered ? form.vatNumber : 'Not registered'],
    ['Your name', form.ownerName],
    ['Phone', form.phone],
    ['Email', form.email],
    ['IBAN', form.iban],
    ...(form.website.trim() ? [['Website', form.website]] : []),
  ];

  if (submitted) {
    return (
      <>
        <SEOHead title="Tabby order confirmed" description="Your Tabby Business Account setup order has been received." />
        <section className="tabby-hero">
          <div className="container">
            <div className="tabby-wizard tabby-success">
              <div className="tabby-success__icon"><CheckCircle2 size={36} /></div>
              <h1 className="h2">Payment received</h1>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 520, margin: '0.75rem auto 1.25rem' }}>
                Your Tabby Business account setup will be completed within <strong>3 working days</strong>.
                We will use the documents you uploaded to apply on your behalf.
              </p>
              <div className="tabby-review" style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto 1.5rem' }}>
                <div className="tabby-review__row"><span>Order ID</span><strong>#{submitted.orderId}</strong></div>
                <div className="tabby-review__row"><span>Company</span><strong>{submitted.legalCompanyName}</strong></div>
                <div className="tabby-review__row"><span>Amount</span><strong>{formatFromSARWithCode(TABBY_PRICE_SAR)}</strong></div>
                <div className="tabby-review__row"><span>Status</span><strong>Pending review</strong></div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Need to cancel before we start? You can request a refund from My Account. See our{' '}
                <Link to="/privacy#refund">refund policy</Link>.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/my-account?tab=tabby" className="btn btn-primary">View in My Account</Link>
                <Link to="/services" className="btn btn-secondary">All services</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Tabby Business Account Setup — Saudi Arabia"
        description="Open a Tabby merchant account for your Saudi business. CR, National Address, and KYC handled for 500 SAR. Live within 3 working days."
      />

      <section className="tabby-hero tabby-page">
        <div className="tabby-hero__bg">
          <div className="tabby-orb tabby-orb-a" />
          <div className="tabby-orb tabby-orb-b" />
        </div>
        <div className="container">
          <div className="tabby-hero__grid">
            <FadeInUp>
              <div className="tabby-badge"><Sparkles size={14} /> For Saudi businesses</div>
              <h1 className="tabby-hero__title">
                Create a <span className="text-gradient">Tabby</span> account for your business
              </h1>
              <p className="tabby-hero__desc">
                Let customers buy now and pay later — even when they do not have the full balance today.
                BIT prepares and submits your Tabby merchant application with the CR, National Address, and bank documents Tabby requires.
              </p>
              <div className="tabby-hero__cta">
                <button type="button" className="btn btn-primary btn-lg" onClick={scrollToForm}>
                  Start application <ArrowRight size={18} />
                </button>
                <a href="#tabby-faq" className="btn btn-secondary btn-lg">How it works</a>
              </div>
              <div className="tabby-pills">
                <span className="tabby-pill"><BadgeCheck size={13} /> {formatFromSARWithCode(TABBY_PRICE_SAR)} fixed fee</span>
                <span className="tabby-pill"><Clock size={13} /> Live in 3 working days</span>
                <span className="tabby-pill"><RefreshCw size={13} /> Refund before activation</span>
              </div>
            </FadeInUp>
            <FadeInUp>
              <div className="tabby-price-card">
                <div className="tabby-price-card__label">One-time setup</div>
                <div className="tabby-price-card__amount">{formatFromSARWithCode(TABBY_PRICE_SAR)}</div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: 0 }}>
                  PayPal checkout. Wallet balance also accepted.
                </p>
                <ul className="tabby-price-card__list">
                  <li><CheckCircle2 size={16} color="#0d9488" /> Application prepared for Tabby Business</li>
                  <li><CheckCircle2 size={16} color="#0d9488" /> CR, Wasel, IBAN & ID package reviewed</li>
                  <li><CheckCircle2 size={16} color="#0d9488" /> BIT applies on your behalf</li>
                  <li><CheckCircle2 size={16} color="#0d9488" /> Status tracked in My Account</li>
                </ul>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      <section className="section tabby-page">
        <div className="container">
          <div className="tabby-benefits" style={{ marginBottom: '2.5rem' }}>
            {[
              { icon: CreditCard, title: 'Sell without waiting for cash', text: 'Your shoppers split payments with Tabby. You still get paid through Tabby’s merchant settlement.' },
              { icon: FileText, title: 'We collect the right KSA files', text: 'CR copy, National Address (Wasel), IBAN letter, and owner ID — the documents Tabby typically asks for.' },
              { icon: Shield, title: 'Clear SLA and refunds', text: 'Setup within 3 working days. If work has not finished, you can request a refund from My Account.' },
            ].map((item) => (
              <div className="tabby-benefit" key={item.title}>
                <div className="tabby-benefit__icon"><item.icon size={20} /></div>
                <h3 className="h5">{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0.4rem 0 0' }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div ref={formTopRef} id="tabby-apply" />
          <div className="tabby-wizard">
            <div className="tabby-steps">
              {STEPS.map((s) => (
                <div key={s.id} className={`tabby-step ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}>
                  <span className="tabby-step__num">{step > s.id ? '✓' : s.id}</span>
                  {s.label}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="tabby-form-grid">
                <p className="tabby-form-intro">
                  Fill in what is on your CR and ID. We take bank name, activity, and CR dates from the documents you upload next.
                </p>
                <Field label="Company name" ar="الاسم الرسمي" error={errors.legalCompanyName} className="tabby-field--full">
                  <input value={form.legalCompanyName} onChange={(e) => setField('legalCompanyName', e.target.value)} placeholder="As written on the CR" />
                </Field>
                <Field label="CR number" ar="رقم السجل التجاري" error={errors.crNumber}>
                  <input value={form.crNumber} onChange={(e) => setField('crNumber', e.target.value)} placeholder="10-digit CR" />
                </Field>
                <Field label="City" ar="المدينة" error={errors.city}>
                  <select value={form.city} onChange={(e) => setField('city', e.target.value)}>
                    {TABBY_SAUDI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="National Address code" ar="الرمز الوطني" error={errors.nationalAddressCode} hint="Short National Address / Wasel code">
                  <input value={form.nationalAddressCode} onChange={(e) => setField('nationalAddressCode', e.target.value)} placeholder="e.g. RRRD2929" />
                </Field>
                <Field label="Your name" ar="الاسم" error={errors.ownerName}>
                  <input value={form.ownerName} onChange={(e) => setField('ownerName', e.target.value)} />
                </Field>
                <Field label="National ID / Iqama" ar="الهوية / الإقامة" error={errors.ownerNationalId}>
                  <input value={form.ownerNationalId} onChange={(e) => setField('ownerNationalId', e.target.value)} placeholder="10 digits" />
                </Field>
                <Field label="Mobile" ar="الجوال" error={errors.phone} hint="Saudi number, e.g. +9665XXXXXXXX">
                  <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+9665" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </Field>
                <Field label="IBAN" ar="الآيبان" error={errors.iban} className="tabby-field--full" hint="24 characters: SA + 22 digits, same as your IBAN letter">
                  <input
                    value={form.iban}
                    onChange={(e) => setField('iban', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="SAxxxxxxxxxxxxxxxxxxxxxx"
                    maxLength={24}
                  />
                </Field>
                <Field label="Website (optional)" className="tabby-field--full">
                  <input value={form.website} onChange={(e) => setField('website', e.target.value)} placeholder="https://" />
                </Field>
                <div className="tabby-field tabby-field--full">
                  <span>VAT registered? <span className="ar">ضريبة القيمة المضافة</span></span>
                  <div className="tabby-choice">
                    <label className={!form.vatRegistered ? 'is-on' : ''}>
                      <input type="radio" checked={!form.vatRegistered} onChange={() => setField('vatRegistered', false)} /> No
                    </label>
                    <label className={form.vatRegistered ? 'is-on' : ''}>
                      <input type="radio" checked={form.vatRegistered} onChange={() => setField('vatRegistered', true)} /> Yes
                    </label>
                  </div>
                </div>
                {form.vatRegistered && (
                  <Field label="VAT number" ar="الرقم الضريبي" error={errors.vatNumber} className="tabby-field--full">
                    <input value={form.vatNumber} onChange={(e) => setField('vatNumber', e.target.value)} placeholder="15-digit VAT number" />
                  </Field>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="tabby-docs">
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 0 }}>
                  Upload clear scans. PDF, JPG, or PNG. Max 4MB each. Download National Address from SPL / Wasel.
                </p>
                {TABBY_DOC_FIELDS.map((doc) => {
                  const required = doc.required || (doc.requiredIfVat && form.vatRegistered);
                  if (doc.requiredIfVat && !form.vatRegistered) return null;
                  const file = files[doc.key];
                  return (
                    <div key={doc.key} className={`tabby-doc ${file ? 'is-ready' : ''}`}>
                      <div className="tabby-doc__top">
                        <div>
                          <strong>{doc.label} {required && '*'}</strong>
                          {' '}<span className="ar">{doc.ar}</span>
                          <div className="hint">{doc.hint}</div>
                          {errors[doc.key] && <div className="tabby-error">{errors[doc.key]}</div>}
                        </div>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} /> {file ? 'Replace' : 'Upload'}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            hidden
                            onChange={(e) => handleFile(doc.key, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                      {file && (
                        <div className="tabby-doc__file">
                          <span>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleFile(doc.key, null)}>
                            <X size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <StepPayment
                form={form}
                files={files}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                reviewRows={reviewRows}
              />
            )}

            {step < 3 && (
              <div className="tabby-nav">
                {step > 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <span />}
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section tabby-page" id="tabby-faq" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="h3" style={{ marginBottom: '1rem' }}>Questions</h2>
          <div className="tabby-faq">
            <details open>
              <summary>What is Tabby for business?</summary>
              <p>Tabby lets your customers split purchases into installments. You receive settlement from Tabby; shoppers do not need the full amount on the day they buy.</p>
            </details>
            <details>
              <summary>Why is the form so short?</summary>
              <p>We only ask for details we cannot reliably copy from your files. CR dates, bank name, and business activity are taken from the documents you upload. BIT fills the Tabby application for you.</p>
            </details>
            <details>
              <summary>What documents do you need?</summary>
              <p>CR copy, National Address (Wasel) PDF, IBAN letter, owner ID, plus VAT certificate if you are VAT registered. These match Tabby’s typical KSA merchant checklist.</p>
            </details>
            <details>
              <summary>How long does activation take?</summary>
              <p>After the 500 SAR payment, BIT submits and follows up. We complete our setup work within 3 working days. Final Tabby approval remains subject to Tabby’s own review.</p>
            </details>
            <details>
              <summary>Can I get a refund?</summary>
              <p>Yes, from My Account, if we have not finished activation. After a successful Tabby merchant go-live the fee is generally non-refundable. If Tabby rejects the application, contact us or wait for admin review.</p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, ar, hint, error, className = '', children }) {
  return (
    <div className={`tabby-field ${className} ${error ? 'has-error' : ''}`}>
      <label>
        {label} {ar && <span className="ar">({ar})</span>}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="tabby-error">{error}</span>}
    </div>
  );
}
