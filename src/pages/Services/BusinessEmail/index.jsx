// ============================================
// BIT SOFTWARE — Business Email (public plans)
// ============================================
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Check, Loader2, Star, ArrowRight, Shield, HardDrive, Video,
  Settings2, BadgeCheck, Clock, Headphones, ChevronDown,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import { getPublicEmailPlans } from '@/api/emailPlanApi';
import { useCurrency } from '@/context/CurrencyContext';
import './BusinessEmail.css';

const FALLBACK_PLANS = [
  {
    slug: 'email-starter',
    name: 'Starter',
    monthlyPriceUSD: 7,
    yearlyPriceUSD: 70,
    popular: false,
    features: [
      'Secure custom business email',
      '30 GB cloud storage',
      'Video meetings up to 100 participants',
      'Team chat & shared calendar',
      'Basic security & admin controls',
    ],
  },
  {
    slug: 'email-standard',
    name: 'Standard',
    monthlyPriceUSD: 14,
    yearlyPriceUSD: 140,
    popular: true,
    features: [
      'Everything in Starter',
      '2 TB cloud storage',
      'Meetings up to 150 with recording',
      'Mail merge & custom layouts',
      'Appointment booking pages',
    ],
  },
  {
    slug: 'email-plus',
    name: 'Plus',
    monthlyPriceUSD: 22,
    yearlyPriceUSD: 221,
    popular: false,
    features: [
      'Everything in Standard',
      '5 TB cloud storage',
      'Meetings up to 500 participants',
      'Data archive & advanced security',
      'Enhanced admin controls',
    ],
  },
];

const PLAN_BLURBS = {
  'email-starter': 'Solo founders & small teams',
  'email-standard': 'Growing companies — most popular',
  'email-plus': 'Larger teams that need more power',
};

const BENEFITS = [
  {
    icon: Mail,
    title: 'Your company address',
    desc: 'Send from you@your-company.com so customers trust every message.',
  },
  {
    icon: HardDrive,
    title: 'Cloud storage included',
    desc: 'Keep mail, files, and calendars in one place — no extra apps to buy.',
  },
  {
    icon: Video,
    title: 'Meetings & chat',
    desc: 'Video calls, team chat, and shared calendars come with every plan.',
  },
  {
    icon: Settings2,
    title: 'Simple admin tools',
    desc: 'Add mailboxes, reset access, and manage your team from one dashboard.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Pick a plan',
    desc: 'Choose monthly or yearly. Yearly billing saves about two months.',
  },
  {
    n: '02',
    title: 'Tell us your domain',
    desc: 'Use a domain you already own, or we will help you set one up after payment.',
  },
  {
    n: '03',
    title: 'Start sending',
    desc: 'We provision your mailbox and send access details to My Account.',
  },
];

const FAQS = [
  {
    q: 'Do I need my own domain?',
    a: 'A custom domain (like yourcompany.com) is required for a professional address. If you already have one, we connect email to it. If not, choose “I need help with a domain” at checkout and our team will assist.',
  },
  {
    q: 'How long until my email is ready?',
    a: 'Most mailboxes are prepared shortly after payment. You will see status in My Account, and we send webmail access when provisioning is complete.',
  },
  {
    q: 'Can I switch between monthly and yearly later?',
    a: 'Yes. Pick the cycle that fits now. When it is time to renew, you can choose the other cycle from your account or by contacting support.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Pay securely with PayPal (card) or use your BIT Software account balance. Charges are processed in USD.',
  },
  {
    q: 'Need more than one mailbox?',
    a: 'Start with one plan per mailbox, or contact us for a team package. Enterprise pricing is available for larger organizations.',
  },
];

function yearlySavePct(monthly, yearly) {
  const full = Number(monthly) * 12;
  const y = Number(yearly);
  if (!full || !y || full <= y) return 0;
  return Math.round(((full - y) / full) * 100);
}

function sanitizeLocal(value) {
  return value.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 32);
}

function sanitizeDomain(value) {
  return value.toLowerCase().replace(/[^a-z0-9.-]/g, '').slice(0, 48);
}

export default function BusinessEmail() {
  const { formatPriceWithCode } = useCurrency();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);
  const [localPart, setLocalPart] = useState('info');
  const [domainPart, setDomainPart] = useState('your-company.com');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicEmailPlans();
        if (!cancelled && res.success && res.data?.length) {
          setPlans(res.data);
        }
      } catch {
        /* keep fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const previewEmail = useMemo(() => {
    const local = localPart.trim() || 'you';
    const domain = domainPart.trim() || 'your-company.com';
    return `${local}@${domain}`;
  }, [localPart, domainPart]);

  const maxSave = useMemo(() => {
    const pcts = plans.map((p) => yearlySavePct(p.monthlyPriceUSD, p.yearlyPriceUSD));
    return Math.max(0, ...pcts);
  }, [plans]);

  const popularPlan = plans.find((p) => p.popular) || plans[1] || plans[0];

  return (
    <div className="be-page">
      <SEOHead
        title="Business Email — BIT Software"
        description="Professional business email for your company. Secure custom addresses, cloud storage, meetings, and admin controls."
      />

      <section className="be-hero">
        <div className="be-hero__bg" aria-hidden="true">
          <span className="be-orb be-orb-a" />
          <span className="be-orb be-orb-b" />
        </div>
        <div className="container">
          <div className="be-hero__grid">
            <FadeInUp>
              <span className="be-hero__badge"><Mail size={14} /> Business Email</span>
              <h1 className="be-hero__title">
                Look professional with <span className="text-gradient">you@your-company.com</span>
              </h1>
              <p className="be-hero__sub">
                Custom business email with storage, meetings, chat, and admin tools —
                set up and managed by BIT Software.
              </p>
              <div className="be-hero__cta">
                <a href="#be-plans" className="btn btn-primary btn-lg">
                  View plans <ArrowRight size={18} />
                </a>
                <a href="#be-how" className="btn btn-secondary btn-lg">How it works</a>
              </div>
              <div className="be-pills">
                <span className="be-pill"><BadgeCheck size={13} /> Custom domain email</span>
                <span className="be-pill"><Shield size={13} /> Secure & encrypted</span>
                <span className="be-pill"><Clock size={13} /> Fast setup</span>
                <span className="be-pill"><Headphones size={13} /> Local support</span>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.08}>
              <div className="be-preview" aria-label="Preview your business email address">
                <div className="be-preview__bar">
                  <span className="be-preview__dots" aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  <span className="be-preview__bar-label">Inbox preview</span>
                </div>
                <div className="be-preview__inbox">
                  <div className="be-preview__mail">
                    <div className="be-preview__avatar" aria-hidden="true">
                      {(localPart || 'I').charAt(0).toUpperCase()}
                    </div>
                    <div className="be-preview__mail-body">
                      <div className="be-preview__from">{previewEmail}</div>
                      <div className="be-preview__subject">Welcome to your business mailbox</div>
                      <div className="be-preview__snippet">
                        Customers will see this address on every email you send.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="be-preview__builder">
                  <p className="be-preview__hint">Try your address</p>
                  <div className="be-preview__inputs">
                    <label className="be-preview__field">
                      <span>Username</span>
                      <input
                        type="text"
                        inputMode="email"
                        autoComplete="off"
                        spellCheck="false"
                        value={localPart}
                        onChange={(e) => setLocalPart(sanitizeLocal(e.target.value))}
                        aria-label="Email username"
                      />
                    </label>
                    <span className="be-preview__at" aria-hidden="true">@</span>
                    <label className="be-preview__field be-preview__field--grow">
                      <span>Your domain</span>
                      <input
                        type="text"
                        inputMode="url"
                        autoComplete="off"
                        spellCheck="false"
                        value={domainPart}
                        onChange={(e) => setDomainPart(sanitizeDomain(e.target.value))}
                        aria-label="Company domain"
                      />
                    </label>
                  </div>
                  <a href="#be-plans" className="btn btn-primary be-preview__cta">
                    Get this address <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      <ScrollBlurReveal className="be-benefits-wrap">
        <div className="container">
          <StaggerChildren className="be-benefits">
            {BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <article className="be-benefit">
                    <div className="be-benefit__icon"><Icon size={20} /></div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </ScrollBlurReveal>

      <section className="be-pricing" id="be-plans">
        <div className="container">
          <FadeInUp>
            <div className="section-header be-pricing__header">
              <span className="section-subtitle">Simple pricing</span>
              <h2 className="h2 section-header__title">Choose the mailbox that fits</h2>
              <p className="section-header__desc">
                One professional mailbox per plan. Switch billing anytime at renewal.
                {popularPlan ? ` Most customers pick ${popularPlan.name}.` : ''}
              </p>
            </div>
          </FadeInUp>

          <div className="be-billing" role="group" aria-label="Billing cycle">
            <button
              type="button"
              className={billingCycle === 'monthly' ? 'is-on' : ''}
              onClick={() => setBillingCycle('monthly')}
              aria-pressed={billingCycle === 'monthly'}
            >
              Monthly
            </button>
            <button
              type="button"
              className={billingCycle === 'yearly' ? 'is-on' : ''}
              onClick={() => setBillingCycle('yearly')}
              aria-pressed={billingCycle === 'yearly'}
            >
              Yearly
              {maxSave > 0 && <span className="be-billing__save">Save {maxSave}%</span>}
            </button>
          </div>

          {loading ? (
            <div className="be-loading" role="status" aria-live="polite">
              <Loader2 className="spin" size={28} />
              <span>Loading plans…</span>
            </div>
          ) : (
            <div className="be-plan-grid">
              {plans.map((plan) => {
                const isYearly = billingCycle === 'yearly';
                const price = isYearly ? plan.yearlyPriceUSD : plan.monthlyPriceUSD;
                const perLabel = isYearly ? '/ year' : '/ month';
                const monthlyEq = isYearly ? Number(plan.yearlyPriceUSD) / 12 : null;
                const save = yearlySavePct(plan.monthlyPriceUSD, plan.yearlyPriceUSD);
                const blurb = PLAN_BLURBS[plan.slug];
                return (
                  <article
                    key={plan.slug}
                    className={`be-plan-card ${plan.popular ? 'be-plan-card--popular' : ''}`}
                  >
                    {plan.popular && (
                      <div className="be-plan-card__popular"><Star size={12} /> Most popular</div>
                    )}
                    <h3>{plan.name}</h3>
                    {blurb && <p className="be-plan-card__blurb">{blurb}</p>}
                    <div className="be-plan-card__price">
                      <strong>{formatPriceWithCode(price)}</strong>
                      <span>{perLabel}</span>
                    </div>
                    {isYearly && monthlyEq > 0 && (
                      <p className="be-plan-card__eq">
                        {formatPriceWithCode(monthlyEq)} / month
                        {save > 0 ? ` · save ${save}%` : ''}
                      </p>
                    )}
                    {!isYearly && (
                      <p className="be-plan-card__eq">Billed every month · cancel at renewal</p>
                    )}
                    <ul>
                      {(plan.features || []).map((f) => (
                        <li key={f}><Check size={14} aria-hidden="true" /> {f}</li>
                      ))}
                    </ul>
                    <Link
                      className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} be-plan-card__cta`}
                      to={`/email-checkout?plan=${encodeURIComponent(plan.slug)}&billing=${billingCycle}`}
                    >
                      Get {plan.name} <ArrowRight size={16} />
                    </Link>
                  </article>
                );
              })}

              <article className="be-plan-card be-plan-card--enterprise">
                <h3>Enterprise</h3>
                <p className="be-plan-card__blurb">Custom storage, security & support</p>
                <div className="be-plan-card__price"><strong>Let&apos;s talk</strong></div>
                <p className="be-plan-card__eq">Tailored for larger organizations</p>
                <ul>
                  <li><Check size={14} aria-hidden="true" /> Custom storage & security</li>
                  <li><Check size={14} aria-hidden="true" /> Large meeting capacity</li>
                  <li><Check size={14} aria-hidden="true" /> Dedicated support</li>
                  <li><Check size={14} aria-hidden="true" /> Tailored admin controls</li>
                </ul>
                <Link className="btn btn-ghost be-plan-card__cta" to="/contact">
                  Contact sales
                </Link>
              </article>
            </div>
          )}
        </div>
      </section>

      <ScrollBlurReveal className="be-how" id="be-how">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Getting started</span>
              <h2 className="h2 section-header__title">Ready in three steps</h2>
              <p className="section-header__desc">No complicated setup on your side. We handle provisioning after you pay.</p>
            </div>
          </FadeInUp>
          <ol className="be-steps">
            {STEPS.map((step) => (
              <li key={step.n} className="be-step">
                <span className="be-step__n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </ScrollBlurReveal>

      <section className="be-faq-wrap" id="be-faq">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">FAQ</span>
              <h2 className="h2 section-header__title">Questions, answered</h2>
            </div>
          </FadeInUp>
          <div className="be-faq">
            {FAQS.map((item) => (
              <details key={item.q} className="be-faq__item">
                <summary>
                  {item.q}
                  <ChevronDown size={18} className="be-faq__chevron" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
