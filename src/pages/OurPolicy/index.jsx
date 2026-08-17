// ============================================
// BIT SOFTWARE — Our Policy (Privacy + Transactions)
// ============================================

import { Link } from 'react-router-dom';
import {
  Shield, FileText, CreditCard, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, ArrowLeft, Info, Clock, Scale,
  Banknote, ShieldCheck, BookOpen, MessageCircle, Calendar,
  Wallet, Gift, ArrowUpRight, Database, Bell,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { COMPANY } from '@/utils/constants';
import '../TermsAndConditions/TermsAndConditions.css';
import './OurPolicy.css';

const NAV_LINKS = [
  { href: '#privacy', icon: Shield, label: 'Privacy' },
  { href: '#transaction', icon: CreditCard, label: 'Transactions' },
  { href: '#wallet', icon: Wallet, label: 'Account Balance Rules' },
  { href: '#refund', icon: RefreshCw, label: 'Refunds' },
  { href: '#retention', icon: Database, label: 'Data Retention' },
  { href: '#notices', icon: Bell, label: 'Important Notices' },
  { href: '#contact', icon: MessageCircle, label: 'Contact' },
];

export default function OurPolicy() {
  return (
    <>
      <SEOHead
        title="Our Policy — Privacy & Transactions | BIT Software"
        description="Privacy policy, transaction rules, wallet business logic, and refund policy for BIT Software & IT Solution."
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
                <Scale size={14} /> Privacy & Transactions
              </div>
              <h1 className="h1 terms-hero__title">
                Our <span className="text-gradient">Policy</span>
              </h1>
              <p className="terms-hero__desc">
                How {COMPANY.name} handles your data, payments, account balances, and refunds.
                Read this together with our{' '}
                <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Terms of Service</Link>.
              </p>
              <div className="terms-meta">
                <span><Calendar size={12} /> Last Updated: July 2026</span>
                <span><Clock size={12} /> ~7 min read</span>
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
              <div id="privacy" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon cyan"><Shield size={20} /></div>
                  <h2 className="terms-section-title">Privacy Policy</h2>
                </div>
                <p className="terms-text">
                  We collect and process personal and business information only as needed to operate
                  our website, deliver services, process payments, and support your account.
                </p>
                <p className="terms-text"><strong>Information we may collect:</strong></p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span><strong>Account data</strong> — name, email, phone, password hash, and profile details you submit.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span><strong>Order & billing data</strong> — products purchased, domain/hosting records, invoices, and payment status (not full card numbers).</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span><strong>Service data</strong> — business details for GMB, technical contacts, and support tickets.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span><strong>Technical data</strong> — IP address, device/browser type, and basic usage logs for security and reliability.</span>
                  </li>
                </ul>
                <p className="terms-text"><strong>How we use it:</strong> to create and secure accounts, fulfill orders,
                  process account balance top-ups and withdrawals, communicate about services, prevent fraud, and
                  improve the platform.</p>
                <p className="terms-text"><strong>Sharing:</strong> We share data with processors only as needed —
                  for example PayPal for payments, domain registries/registrars, hosting infrastructure,
                  and email/SMS providers. We do not sell your personal information.</p>
                <div className="terms-highlight success">
                  <ShieldCheck size={18} />
                  <span>
                    We use industry-standard encryption in transit. Payment card details are handled by
                    PayPal or other payment partners — we do not store full card numbers on our servers.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="transaction" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon yellow"><CreditCard size={20} /></div>
                  <h2 className="terms-section-title">Transaction Policy</h2>
                </div>
                <p className="terms-text">
                  A typical paid order follows this flow:
                </p>
                <ul className="terms-list">
                  <li>
                    <BookOpen size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>1. Selection</strong> — You choose a domain, hosting plan, GMB package, or other service and proceed to checkout (login may be required).</span>
                  </li>
                  <li>
                    <Banknote size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>2. Payment</strong> — You pay via PayPal, account balance (where available), or an approved manual method.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>3. Confirmation</strong> — PayPal and account balance charges confirm instantly when successful. Manual payments are verified by our team (usually within 24 hours) before the order is marked paid.</span>
                  </li>
                  <li>
                    <FileText size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>4. Fulfillment</strong> — Domains are submitted to the registry; hosting is provisioned; GMB and project work enter our delivery queue.</span>
                  </li>
                </ul>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    An order is considered placed only after successful payment authorization or verified
                    manual confirmation. Abandoned checkouts without payment do not reserve inventory or domains.
                  </span>
                </div>
                <p className="terms-text">
                  Currency displayed at checkout (for example SAR or USD) is the amount you agree to pay
                  for that transaction. Exchange rates, PayPal conversion, and bank fees charged by your
                  provider are outside our control.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="wallet" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon purple"><Wallet size={20} /></div>
                  <h2 className="terms-section-title">Account Balance Rules</h2>
                </div>
                <p className="terms-text">
                  Your My Account balance may show two amounts that work differently:
                </p>
                <ul className="terms-list">
                  <li>
                    <Wallet size={16} style={{ color: '#a855f7' }} />
                    <span><strong>Account Balance</strong> — Funds you add (for example via PayPal top-up). Can be used to pay for eligible services and may be withdrawn subject to fees and minimums.</span>
                  </li>
                  <li>
                    <Gift size={16} style={{ color: '#a855f7' }} />
                    <span><strong>Promotional Credit</strong> — Gift or bonus credit granted by us. It is spent first when paying, is <strong>not withdrawable</strong>, and may be subject to campaign rules.</span>
                  </li>
                </ul>
                <p className="terms-text"><strong>Top-up:</strong> You create a top-up order and complete payment
                  with PayPal. After PayPal returns a successful authorization, we credit your Account Balance.
                  If return completion fails, you may retry completing the same PayPal order from the Account Balance screen.</p>
                <p className="terms-text"><strong>Withdrawal:</strong> You may request a payout from Account Balance
                  only. Promotional Credit cannot be withdrawn. A withdrawal fee may apply, and you typically
                  need enough balance to cover at least a $1 payout plus the fee. Requests are reviewed and
                  may show statuses such as pending, approved, paid, or rejected. Reversed withdrawals may
                  return funds to your balance.</p>
                <div className="terms-highlight warning">
                  <AlertTriangle size={18} />
                  <span>
                    Total spendable balance = Account Balance + Promotional Credit. Only Account Balance
                    (after fees and whole-dollar payout rules) is withdrawable.
                  </span>
                </div>
                <ul className="terms-list">
                  <li>
                    <ArrowUpRight size={16} style={{ color: '#a855f7' }} />
                    <span>Transaction history may include top-ups, purchases, refunds, promotional grants, withdrawals, reversals, and admin adjustments.</span>
                  </li>
                  <li>
                    <ShieldCheck size={16} style={{ color: '#a855f7' }} />
                    <span>Administrators may grant promotional credit or adjust balances to correct errors, resolve disputes, or apply promotions — with a record in your history where applicable.</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="refund" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon red"><RefreshCw size={20} /></div>
                  <h2 className="terms-section-title">Refund & Cancellation Rules</h2>
                </div>
                <p className="terms-text">
                  Refund eligibility depends on the product. Contact support promptly if you need to cancel
                  before work or provisioning has started.
                </p>

                <div className="refund-cards">
                  <div className="refund-card eligible">
                    <div className="refund-card-header">
                      <div className="refund-card-badge">
                        <CheckCircle2 size={12} /> Often Refundable
                      </div>
                    </div>
                    <div className="refund-card-title">When We May Refund</div>
                    <ul className="refund-card-list">
                      <li><CheckCircle2 size={14} /> Duplicate or failed charges with no service delivered.</li>
                      <li><CheckCircle2 size={14} /> GMB creation/recovery cannot be completed after reasonable effort.</li>
                      <li><CheckCircle2 size={14} /> Tabby Business setup cancelled before activation, or Tabby rejects the merchant application after reasonable effort.</li>
                      <li><CheckCircle2 size={14} /> Cancellation requested before work or provisioning starts (case-by-case).</li>
                      <li><CheckCircle2 size={14} /> Clear billing error attributable to us.</li>
                    </ul>
                    <div className="refund-amount-badge">
                      Method: original payment or wallet credit
                    </div>
                  </div>

                  <div className="refund-card ineligible">
                    <div className="refund-card-header">
                      <div className="refund-card-badge">
                        <XCircle size={12} /> Generally Non-Refundable
                      </div>
                    </div>
                    <div className="refund-card-title">After Successful Delivery</div>
                    <ul className="refund-card-list">
                      <li><XCircle size={14} /> Domain successfully registered, renewed, or transferred at the registry.</li>
                      <li><XCircle size={14} /> Hosting period already provisioned and usable (unused time may be reviewed case-by-case).</li>
                      <li><XCircle size={14} /> GMB profile created or recovered successfully.</li>
                      <li><XCircle size={14} /> Tabby merchant account successfully activated.</li>
                      <li><XCircle size={14} /> Promotional Credit (not cash; not withdrawable).</li>
                      <li><XCircle size={14} /> Completed custom project milestones already accepted.</li>
                    </ul>
                    <div className="refund-amount-badge">
                      Refund: Not available in these cases
                    </div>
                  </div>
                </div>

                <div className="terms-highlight warning" style={{ marginTop: '1.5rem' }}>
                  <AlertTriangle size={18} />
                  <span>
                    Approved refunds may return to your original PayPal method or as Account Balance credit,
                    depending on how you paid and the nature of the correction. Processing time depends on
                    PayPal and banks.
                  </span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="retention" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><Database size={20} /></div>
                  <h2 className="terms-section-title">Data Retention & User Rights</h2>
                </div>
                <p className="terms-text">
                  We retain account, order, and balance records for as long as needed to provide services,
                  meet accounting/legal obligations, and resolve disputes. Support tickets and logs may be
                  kept for a limited operational period.
                </p>
                <ul className="terms-list">
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Access & correction</strong> — Update profile details in My Account, or contact us for help.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Deletion requests</strong> — You may request account closure. We may retain records required by law or for legitimate business needs (for example paid invoices).</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Marketing</strong> — You can opt out of non-essential marketing messages; transactional emails about orders and security will still be sent.</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="notices" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon yellow"><Bell size={20} /></div>
                  <h2 className="terms-section-title">Important Notices</h2>
                </div>
                <ul className="terms-list">
                  <li>
                    <Info size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>Fees</strong> — PayPal, bank, or withdrawal fees may reduce the net amount you receive or increase the total charged. Displayed checkout totals are before third-party conversion fees unless stated otherwise.</span>
                  </li>
                  <li>
                    <Info size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>Currency display</strong> — The UI may show different currencies by product (for example USD wallet amounts and SAR GMB pricing). Always confirm the amount on the payment screen before approving.</span>
                  </li>
                  <li>
                    <Info size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>Admin adjustments</strong> — Balance corrections, promotional grants, and dispute resolutions may appear as adjustments in your account history.</span>
                  </li>
                  <li>
                    <Info size={16} style={{ color: '#FBBC05' }} />
                    <span><strong>Third parties</strong> — Google, registries, hosting vendors, and PayPal have their own terms. Your use of those platforms is also subject to their policies.</span>
                  </li>
                </ul>
              </div>
            </FadeInUp>

            <FadeInUp>
              <div id="contact" className="terms-section">
                <div className="terms-section-header">
                  <div className="terms-section-icon blue"><MessageCircle size={20} /></div>
                  <h2 className="terms-section-title">Contact for Policy Questions</h2>
                </div>
                <p className="terms-text">
                  Questions about privacy, a specific transaction, account balance, or a refund request:
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
                  <li>
                    <MessageCircle size={16} style={{ color: '#4285F4' }} />
                    <span><strong>Address:</strong> {COMPANY.address}</span>
                  </li>
                </ul>
                <div className="terms-highlight info">
                  <Info size={18} />
                  <span>
                    Service eligibility and account rules are in our{' '}
                    <Link to="/terms" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Terms of Service</Link>.
                    This page focuses on privacy, payments, account balance rules, and refunds.
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
