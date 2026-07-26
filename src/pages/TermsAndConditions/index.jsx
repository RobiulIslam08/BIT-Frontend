// ============================================
// BIT SOFTWARE — Terms of Service (Site-wide)
// ============================================

import { Link } from 'react-router-dom';
import {
  Shield, FileText, CreditCard, AlertTriangle,
  CheckCircle2, XCircle, ArrowLeft, Info, Clock, Scale, Banknote,
  ShieldCheck, BookOpen, MessageCircle, Calendar, User,
  Globe, Server, Wallet, Ban, Gavel,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { COMPANY } from '@/utils/constants';
import './TermsAndConditions.css';

const NAV_LINKS = [
  { href: '#overview', icon: BookOpen, label: 'Overview' },
  { href: '#account', icon: User, label: 'Account' },
  { href: '#services', icon: ShieldCheck, label: 'Services' },
  { href: '#domains', icon: Globe, label: 'Domains' },
  { href: '#hosting', icon: Server, label: 'Hosting' },
  { href: '#gmb', icon: Shield, label: 'GMB Services' },
  { href: '#payments', icon: Banknote, label: 'Payments' },
  { href: '#acceptable-use', icon: Ban, label: 'Acceptable Use' },
  { href: '#liability', icon: Gavel, label: 'Liability' },
  { href: '#contact', icon: MessageCircle, label: 'Contact' },
];

export default function TermsAndConditions() {
  return (
    <>
      <SEOHead
        title="Terms of Service — BIT Software"
        description="Terms of Service for BIT Software & IT Solution covering accounts, domains, hosting, wallet, payments, and Google Business Profile services."
      />

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
                Terms of <span className="text-gradient">Service</span>
              </h1>
              <p className="terms-hero__desc">
                These terms govern your use of {COMPANY.name} websites, accounts, and paid services.
                Please read them carefully before registering or placing an order.
              </p>
              <div className="terms-meta">
                <span><Calendar size={12} /> Last Updated: July 2026</span>
                <span><Clock size={12} /> ~8 min read</span>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="terms-content-section">
        <div className="container terms-layout">
          <aside className="terms-sidebar">
            <nav className="terms-nav">
              <div className="terms-nav-title">Quick Navigation</div>
              <ul className="terms-nav-links">
                {NAV_LINKS.map(({ href, icon: Icon, label }) => (
                  <li key={href}>
                    <a href={href} className="terms-nav-link"><Icon size={14} /> {label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="terms-body">
            <FadeInUp>
              <div id="overview" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><BookOpen size={20} /></div>
                  <h2 className="terms-section-title">Overview & Acceptance</h2>
                </div>
                <p className="terms-text">
                  These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and{' '}
                  <strong>{COMPANY.name}</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), based in {COMPANY.address}.
                  By creating an account, browsing our website, or purchasing any product or service,
                  you agree to these Terms and our{' '}
                  <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Our Policy</Link>{' '}
                  page (privacy, transactions, wallet, and refunds).
                </p>
                <p className="terms-text">
                  If you do not agree, do not use our services. We may update these Terms from time to time;
                  the &quot;Last Updated&quot; date above reflects the current version. Continued use after changes
                  constitutes acceptance of the revised Terms.
                </p>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    Detailed payment, wallet, refund, and data practices are described on Our Policy.
                    These Terms cover service eligibility, account rules, and service-specific conditions.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="account" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon purple"><User size={20} /></div>
                  <h2 className="terms-section-title">Account Registration</h2>
                </div>
                <p className="terms-text">
                  Certain features (domain/hosting checkout, wallet, My Account) require a registered account.
                  You agree to:
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Provide accurate, current registration and profile information.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Keep your login credentials confidential and notify us of unauthorized access.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Be responsible for all activity under your account.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#a855f7' }} />
                    <span>Use the platform only for lawful business or personal purposes.</span>
                  </li>
                </ul>
                <div className="terms-highlight warning">
                  <AlertTriangle size={18} />
                  <span>
                    We may suspend or terminate accounts that provide false information, abuse services,
                    or violate these Terms or applicable law.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="services" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon green"><ShieldCheck size={20} /></div>
                  <h2 className="terms-section-title">Services Covered</h2>
                </div>
                <p className="terms-text">
                  These Terms apply to services offered through our website and customer portal, including:
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>IT & software services</strong> — consulting, custom development, ERP, mobile apps, and related project work as described on each service page.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Design & marketing</strong> — logo, graphics, social media, and online marketing services.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Domain registration</strong> — search, register, renew, and transfer via our checkout and My Account area.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Web hosting</strong> — hosting plans, renewals, and panel access where provided.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Google Business Profile (GMB)</strong> — creation, recovery, and related local listing services.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span><strong>Wallet</strong> — account balance, promotional credit, top-ups, and withdrawals (subject to Our Policy).</span>
                  </li>
                </ul>
                <p className="terms-text">
                  Project-based IT and design work may also be governed by a separate quote, proposal, or
                  written statement of work. Where a written agreement conflicts with these Terms for a
                  specific project, that agreement controls for that project only.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="domains" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon cyan"><Globe size={20} /></div>
                  <h2 className="terms-section-title">Domain Registration Terms</h2>
                </div>
                <p className="terms-text">
                  Domain names are registered through our platform and upstream registries/registrars.
                  By ordering a domain you acknowledge that:
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Registration, renewal, and transfer are subject to registry rules and ICANN (or local equivalent) policies.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>You must provide accurate WHOIS / registrant contact data. False data may lead to suspension or loss of the domain.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>WHOIS privacy (where offered) hides public contact details but does not remove your obligation to keep valid contact information with us.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Auto-renew, if enabled, will attempt to charge your selected payment method or wallet before expiry. You remain responsible for ensuring successful renewal.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Once a domain is successfully registered or renewed with the registry, fees are generally non-refundable (see Our Policy).</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="hosting" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon yellow"><Server size={20} /></div>
                  <h2 className="terms-section-title">Hosting Terms</h2>
                </div>
                <p className="terms-text">
                  Hosting plans are provided according to the package you purchase (resources, term, and features shown at checkout).
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#FBBC05' }} />
                    <span>You are responsible for the content, software, and data you store or run on your hosting account.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#FBBC05' }} />
                    <span>cPanel or other control-panel credentials (when provided) must be kept secure. Misuse that compromises the server may result in suspension.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#FBBC05' }} />
                    <span>We may suspend or terminate hosting for non-payment, abuse, malware, spam, illegal content, or excessive resource usage that harms other customers.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#FBBC05' }} />
                    <span>Renewals must be completed before the end of the billing period to avoid interruption. Data after cancellation or long suspension may be removed.</span>
                  </li>
                </ul>
                <div className="terms-highlight warning">
                  <AlertTriangle size={18} />
                  <span>
                    Hosting is not a backup service unless explicitly purchased. Maintain your own backups
                    of critical websites and databases.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="gmb" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon green"><Shield size={20} /></div>
                  <h2 className="terms-section-title">Google Business Profile (GMB) Terms</h2>
                </div>
                <p className="terms-text">
                  GMB creation, optimization, and recovery services are performed in line with Google&apos;s
                  guidelines. Delivery depends in part on Google&apos;s verification and review processes,
                  which are outside our direct control.
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span>You must provide accurate business information and cooperate with verification (email, phone, postcard, or video as required).</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span>You must not request fake reviews, duplicate listings, or other policy violations.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span>We optimize for visibility but do not guarantee Google Maps 3-Pack ranking or specific search positions.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#34A853' }} />
                    <span>If we cannot create or recover a profile after reasonable effort, refund eligibility is described in Our Policy.</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="payments" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon yellow"><Banknote size={20} /></div>
                  <h2 className="terms-section-title">Payments & Billing</h2>
                </div>
                <p className="terms-text">
                  Prices are shown at checkout in the currency displayed for that product (for example SAR
                  for certain GMB packages, or USD for wallet-related amounts). Confirmed orders are honored
                  at the price displayed when you complete payment.
                </p>
                <ul className="terms-list">
                  <li>
                    <CreditCard size={16} style={{ color: '#4285F4' }} />
                    <span><strong>PayPal</strong> — Primary online payment method for many checkouts and wallet top-ups. Confirmation is typically instant after successful authorization.</span>
                  </li>
                  <li>
                    <Wallet size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Wallet balance</strong> — Where enabled, you may pay using Account Balance and/or Promotional Credit according to Our Policy.</span>
                  </li>
                  <li>
                    <Banknote size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Manual / offline payment</strong> — Where offered, orders may remain pending until our team verifies your transfer (typically within 24 hours).</span>
                  </li>
                </ul>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    We do not store full card numbers on our servers. Card and PayPal data are handled by
                    the payment provider. Transaction fees, promotional credit rules, and refunds are
                    detailed on the Our Policy page.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="acceptable-use" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon red"><Ban size={20} /></div>
                  <h2 className="terms-section-title">Intellectual Property & Acceptable Use</h2>
                </div>
                <p className="terms-text">
                  Our website content, branding, logos, and software interfaces are owned by {COMPANY.name}
                  or our licensors. You may not copy, scrape, reverse engineer, or resell our platform
                  without written permission.
                </p>
                <p className="terms-text">Deliverables you purchase (for example custom design or code) are licensed
                  or assigned as stated in the relevant proposal. Until full payment is received, we retain
                  all rights in unfinished work.
                </p>
                <p className="terms-text">You must not use our services to:</p>
                <ul className="terms-list">
                  <li>
                    <XCircle size={16} style={{ color: '#EA4335' }} />
                    <span>Host or distribute malware, phishing, spam, or illegal content.</span>
                  </li>
                  <li>
                    <XCircle size={16} style={{ color: '#EA4335' }} />
                    <span>Infringe intellectual property, privacy, or publicity rights of others.</span>
                  </li>
                  <li>
                    <XCircle size={16} style={{ color: '#EA4335' }} />
                    <span>Attack, overload, or probe our systems or other customers&apos; systems.</span>
                  </li>
                  <li>
                    <XCircle size={16} style={{ color: '#EA4335' }} />
                    <span>Circumvent billing, fraud checks, or account security controls.</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="liability" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon red"><Gavel size={20} /></div>
                  <h2 className="terms-section-title">Limitation of Liability & Termination</h2>
                </div>
                <p className="terms-text">
                  Services are provided on a commercially reasonable basis. To the maximum extent permitted
                  by applicable law in Saudi Arabia and other jurisdictions where we operate:
                </p>
                <ul className="terms-list">
                  <li>
                    <FileText size={16} style={{ color: '#EA4335' }} />
                    <span>We are not liable for indirect, incidental, special, or consequential damages (lost profits, data loss, business interruption) arising from use of our services.</span>
                  </li>
                  <li>
                    <FileText size={16} style={{ color: '#EA4335' }} />
                    <span>Our aggregate liability for a claim related to a paid order is limited to the fees you paid for that specific order.</span>
                  </li>
                  <li>
                    <FileText size={16} style={{ color: '#EA4335' }} />
                    <span>We are not responsible for third-party platforms (Google, PayPal, registries, DNS, or app stores) beyond our contracted scope of work.</span>
                  </li>
                </ul>
                <p className="terms-text">
                  Either party may terminate an ongoing service relationship for material breach if not
                  cured within a reasonable period after notice. We may immediately suspend service for
                  security risk, illegal use, or non-payment. Sections that by nature should survive
                  (IP, liability limits, accrued payment obligations) continue after termination.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="contact" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><MessageCircle size={20} /></div>
                  <h2 className="terms-section-title">Contact & Governing Context</h2>
                </div>
                <p className="terms-text">
                  {COMPANY.name} operates from {COMPANY.address}. For questions about these Terms,
                  disputes related to orders, or account issues, contact:
                </p>
                <ul className="terms-list">
                  <li>
                    <MessageCircle size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Email:</strong> {COMPANY.email}</span>
                  </li>
                  <li>
                    <MessageCircle size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Phone:</strong> {COMPANY.phone}</span>
                  </li>
                </ul>
                <div className="terms-highlight success">
                  <ShieldCheck size={18} />
                  <span>
                    For privacy, wallet rules, transaction flow, and refunds, please read{' '}
                    <Link to="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Our Policy</Link>.
                  </span>
                </div>

                <Link to="/contact" className="terms-back-link">
                  <ArrowLeft size={16} /> Contact Support
                </Link>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </>
  );
}
