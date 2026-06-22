// ============================================
// BIT SOFTWARE — Terms & Conditions Page
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, FileText, CreditCard, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, ChevronDown, ArrowLeft, Info,
  Clock, HelpCircle, Scale, Banknote, ShieldCheck,
  BookOpen, MessageCircle, Calendar
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { COMPANY } from '@/utils/constants';
import './TermsAndConditions.css';

const FAQS = [
  {
    q: 'How long does the service take to complete?',
    a: 'For new Google Business Profile creation, setup typically takes 3–7 business days including Google verification. For recovery/issue resolution, the timeline varies between 5–15 business days depending on the complexity of the suspension or restriction.',
  },
  {
    q: 'What happens if Google rejects my profile?',
    a: 'If Google rejects the initial profile submission, we will work on your behalf to resolve the issue at no additional cost. If we are ultimately unable to create or recover your profile, you are entitled to a full 100% refund.',
  },
  {
    q: 'Can I cancel my order after submission?',
    a: 'You can request cancellation before work has started. Once our team begins working on your profile setup or recovery, cancellation may not be possible. Please contact our support team immediately if you wish to cancel.',
  },
  {
    q: 'Do you guarantee placement in the Google Maps 3-Pack?',
    a: 'We optimize your profile to maximize your chances, but Google ranking depends on many factors including competition, location, and review count. We guarantee profile creation/recovery, not specific rankings.',
  },
  {
    q: 'How will I know my payment is confirmed?',
    a: 'For PayPal payments, confirmation is instant. For manual payments, our team verifies your transaction within 24 hours and sends a confirmation email to your registered address.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Yes. We use industry-standard encryption and security practices. Your personal and business data is never shared with third parties and is only used for the purpose of your service delivery.',
  },
];

export default function TermsAndConditions() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <SEOHead
        title="Terms of Service & Refund Policy — BIT Software"
        description="Read the terms of service, refund policy, and privacy information for BIT Software's Google Business Profile services."
      />

      {/* ─── HERO ─── */}
      <section className="terms-hero">
        <div className="terms-hero__bg">
          <div className="terms-orb terms-orb-1" />
          <div className="terms-orb terms-orb-2" />
        </div>
        <div className="container">
          <FadeInUp>
            <div className="terms-hero__content">
              <div className="terms-badge">
                <Scale size={14} /> Legal Documentation
              </div>
              <h1 className="h1 terms-hero__title">
                Terms of Service & <span className="text-gradient">Refund Policy</span>
              </h1>
              <p className="terms-hero__desc">
                Please review our terms carefully before purchasing any Google Business Profile services.
                We believe in full transparency and fair practices.
              </p>
              <div className="terms-meta">
                <span><Calendar size={12} /> Last Updated: June 2026</span>
                <span><Clock size={12} /> ~5 min read</span>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="terms-content-section">
        <div className="container terms-layout">
          {/* Sidebar Navigation */}
          <aside className="terms-sidebar">
            <nav className="terms-nav">
              <div className="terms-nav-title">Quick Navigation</div>
              <ul className="terms-nav-links">
                <li><a href="#overview" className="terms-nav-link"><BookOpen size={14} /> Overview</a></li>
                <li><a href="#services" className="terms-nav-link"><ShieldCheck size={14} /> Services</a></li>
                <li><a href="#pricing" className="terms-nav-link"><Banknote size={14} /> Pricing & Payment</a></li>
                <li><a href="#refund" className="terms-nav-link"><RefreshCw size={14} /> Refund Policy</a></li>
                <li><a href="#obligations" className="terms-nav-link"><FileText size={14} /> Client Obligations</a></li>
                <li><a href="#privacy" className="terms-nav-link"><Shield size={14} /> Privacy</a></li>
                <li><a href="#faq" className="terms-nav-link"><HelpCircle size={14} /> FAQ</a></li>
              </ul>
            </nav>
          </aside>

          {/* Content Body */}
          <div className="terms-body">

            {/* SECTION 1: Overview */}
            <FadeInUp>
              <div id="overview" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><BookOpen size={20} /></div>
                  <h2 className="terms-section-title">Overview</h2>
                </div>
                <p className="terms-text">
                  These Terms of Service ("Terms") govern your use of Google Business Profile services
                  provided by <strong>{COMPANY.name}</strong> ("Company", "we", "us"). By placing an order
                  for any service, you agree to be bound by these Terms.
                </p>
                <p className="terms-text">
                  Our services include but are not limited to: Google Business Profile creation,
                  optimization, recovery from suspension, and ongoing management. All services are
                  performed in compliance with Google's official guidelines and policies.
                </p>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    These terms apply specifically to Google Business Profile services. For other services,
                    please refer to our general terms available on the main website.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 2: Services Description */}
            <FadeInUp>
              <div id="services" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon green"><ShieldCheck size={20} /></div>
                  <h2 className="terms-section-title">Service Description</h2>
                </div>
                <p className="terms-text">We offer the following Google Business Profile services:</p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>New Profile Creation (399 SAR)</strong> — Complete setup of a new Google Business Profile including verification, optimization, and category configuration.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Recovery / Issue Resolution (500 SAR)</strong> — Resolution of suspended, disabled, or restricted Google Business Profiles including reinstatement requests and compliance corrections.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Profile Optimization</strong> — Enhancement of existing profiles with keyword targeting, review strategy, NAP consistency, and local SEO best practices.</span>
                  </li>
                </ul>
                <div className="terms-highlight warning">
                  <AlertTriangle size={18} />
                  <span>
                    Service delivery depends on Google's approval and verification processes, which are
                    outside our direct control. We commit to making every effort to ensure successful delivery.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 3: Pricing & Payment */}
            <FadeInUp>
              <div id="pricing" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon yellow"><Banknote size={20} /></div>
                  <h2 className="terms-section-title">Pricing & Payment</h2>
                </div>
                <p className="terms-text">
                  All prices are displayed in Saudi Riyal (SAR) and are final unless a valid coupon
                  code is applied at the time of checkout. Prices are subject to change without prior notice,
                  but confirmed orders will be honored at the price displayed at the time of purchase.
                </p>
                <ul className="terms-list">
                  <li>
                    <CreditCard size={16} style={{ color: '#4285F4' }} />
                    <span><strong>PayPal</strong> — Instant secure payment processed through PayPal's platform.</span>
                  </li>
                  <li>
                    <Banknote size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Manual Payment</strong> — Bank transfer, mobile banking, or other approved methods. Requires verification via payment screenshot or transaction details.</span>
                  </li>
                </ul>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    Coupon codes are only applicable to new profile creation services.
                    Recovery and issue resolution services are not eligible for coupon discounts.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 4: Refund Policy (HIGH VISIBILITY) */}
            <FadeInUp>
              <div id="refund" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon red"><RefreshCw size={20} /></div>
                  <h2 className="terms-section-title">Refund Policy</h2>
                </div>
                <p className="terms-text">
                  We stand behind our service quality. Our refund policy is designed to be fair and transparent.
                  Please review both scenarios carefully:
                </p>

                <div className="refund-cards">
                  {/* Eligible for Refund */}
                  <div className="refund-card eligible">
                    <div className="refund-card-header">
                      <div className="refund-card-badge">
                        <CheckCircle2 size={12} /> Eligible for Full Refund
                      </div>
                    </div>
                    <div className="refund-card-title">100% Refund Guaranteed</div>
                    <ul className="refund-card-list">
                      <li><CheckCircle2 size={14} /> We fail to create the Google Business Profile.</li>
                      <li><CheckCircle2 size={14} /> We fail to recover the suspended profile.</li>
                      <li><CheckCircle2 size={14} /> The requested service cannot be delivered.</li>
                      <li><CheckCircle2 size={14} /> The service remains incomplete due to our inability to fulfill the order.</li>
                    </ul>
                    <div className="refund-amount-badge">
                      Refund Amount: 100%
                    </div>
                  </div>

                  {/* Not Eligible for Refund */}
                  <div className="refund-card ineligible">
                    <div className="refund-card-header">
                      <div className="refund-card-badge">
                        <XCircle size={12} /> Non-Refundable
                      </div>
                    </div>
                    <div className="refund-card-title">After Successful Delivery</div>
                    <ul className="refund-card-list">
                      <li><XCircle size={14} /> New GMB Profile Created Successfully.</li>
                      <li><XCircle size={14} /> Suspended Profile Recovered Successfully.</li>
                      <li><XCircle size={14} /> Reported Issue Successfully Resolved.</li>
                    </ul>
                    <div className="refund-amount-badge">
                      Refund: Not Available
                    </div>
                  </div>
                </div>

                <div className="terms-highlight warning" style={{ marginTop: '1.5rem' }}>
                  <AlertTriangle size={18} />
                  <span>
                    By proceeding with payment, you acknowledge that you have read and understood this
                    refund policy. Once a service is delivered successfully, no refund will be processed.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 5: Client Obligations */}
            <FadeInUp>
              <div id="obligations" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon purple"><FileText size={20} /></div>
                  <h2 className="terms-section-title">Client Obligations</h2>
                </div>
                <p className="terms-text">
                  To ensure smooth and timely service delivery, clients are expected to:
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Provide accurate and truthful business information as required in the order form.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Respond to verification requests (email, phone, or postcard) from Google in a timely manner.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Grant necessary access to Google accounts when required for profile setup or recovery.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Comply with Google's Terms of Service and Business Profile guidelines.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Not attempt to manipulate reviews, create fake listings, or violate Google policies.</span>
                  </li>
                </ul>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    Failure to cooperate with verification processes may result in delays. We are not
                    responsible for delays caused by client non-responsiveness.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 6: Privacy & Security */}
            <FadeInUp>
              <div id="privacy" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon cyan"><Shield size={20} /></div>
                  <h2 className="terms-section-title">Privacy & Data Security</h2>
                </div>
                <p className="terms-text">
                  We take your privacy seriously. All personal and business information collected during
                  the order process is:
                </p>
                <ul className="terms-list">
                  <li>
                    <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Encrypted in transit and at rest using industry-standard protocols.</span>
                  </li>
                  <li>
                    <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Used exclusively for the purpose of delivering your requested service.</span>
                  </li>
                  <li>
                    <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Never sold, shared, or disclosed to unauthorized third parties.</span>
                  </li>
                  <li>
                    <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Retained only for as long as necessary to fulfill legal and operational requirements.</span>
                  </li>
                </ul>
                <div className="terms-highlight success">
                  <ShieldCheck size={18} />
                  <span>
                    Payment information is processed securely through PayPal or verified manually by our
                    finance team. We never store credit card details on our servers.
                  </span>
                </div>
              </div>
            </FadeInUp>

            {/* SECTION 7: FAQ */}
            <FadeInUp>
              <div id="faq" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><HelpCircle size={20} /></div>
                  <h2 className="terms-section-title">Frequently Asked Questions</h2>
                </div>
                <p className="terms-text">
                  Find answers to common questions about our services, payment, and refund process.
                </p>

                <div className="terms-faq-list">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="terms-faq-item">
                      <button
                        type="button"
                        className="terms-faq-btn"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span>{faq.q}</span>
                        <motion.div
                          animate={{ rotate: openFaq === i ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: openFaq === i ? 'auto' : 0,
                          opacity: openFaq === i ? 1 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="terms-faq-answer">{faq.a}</p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* ─── CONTACT & BACK LINK ─── */}
            <FadeInUp>
              <div className="terms-highlight info">
                <MessageCircle size={18} />
                <span>
                  Have questions about these terms? Contact us at <strong>{COMPANY.email}</strong> or
                  call <strong>{COMPANY.phone}</strong>. We're happy to help.
                </span>
              </div>

              <Link to="/services/google-my-business" className="terms-back-link">
                <ArrowLeft size={16} /> Back to Google Business Profile Service
              </Link>
            </FadeInUp>
          </div>
        </div>
      </section>
    </>
  );
}
