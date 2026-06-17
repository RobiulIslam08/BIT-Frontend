// BIT SOFTWARE — Domain & Hosting Page (Namecheap-style)
import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, HardDrive, Globe, Shield } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { COMPANY } from '@/utils/constants';

const SHARED_PLANS = [
  { name: 'Starter', monthly: 3.99, yearly: 39, popular: false, features: ['10 GB SSD', '1 Website', 'Unmetered Bandwidth', '10 Email Accounts', 'Free SSL', 'cPanel Access'] },
  { name: 'Business', monthly: 7.99, yearly: 79, popular: true, features: ['50 GB SSD', '5 Websites', 'Unmetered Bandwidth', '50 Email Accounts', 'Free SSL', 'cPanel Access', 'Free Domain'] },
  { name: 'Professional', monthly: 14.99, yearly: 149, popular: false, features: ['Unlimited SSD', 'Unlimited Websites', 'Unmetered Bandwidth', 'Unlimited Email', 'Free SSL', 'cPanel Access', 'Free Domain', 'Priority Support'] },
];

const VPS_PLANS = [
  { name: 'VPS-1', monthly: 12.99, yearly: 129, features: ['1 vCPU Core', '2 GB RAM', '40 GB NVMe', '2 TB Bandwidth', 'Root Access'] },
  { name: 'VPS-2', monthly: 24.99, yearly: 249, features: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe', '4 TB Bandwidth', 'Root Access'] },
  { name: 'VPS-4', monthly: 44.99, yearly: 449, features: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe', '8 TB Bandwidth', 'Root Access'] },
];

const DOMAINS = [
  { ext: '.com', price: 12 }, { ext: '.sa', price: 30 }, { ext: '.com.sa', price: 30 },
  { ext: '.net', price: 14 }, { ext: '.org', price: 12 }, { ext: '.store', price: 8 },
];

export default function DomainHosting() {
  const [tab, setTab] = useState('shared');
  const [isYearly, setIsYearly] = useState(true);

  const plans = tab === 'shared' ? SHARED_PLANS : VPS_PLANS;

  return (
    <>
      <SEOHead title="Domain & Hosting" description="Reliable hosting plans and domain registration at the best prices." />

      {/* Hero */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domain & Hosting</span>
              <h1 className="h1 section-header__title">Reliable <span className="text-gradient">Hosting & Domains</span></h1>
              <p className="section-header__desc">Fast, secure, and affordable hosting plans with free SSL and 24/7 support.</p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Hosting Plans */}
      <section className="section">
        <div className="container">
          {/* Tabs */}
          <FadeInUp>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              {['shared', 'vps'].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'} style={{ textTransform: 'capitalize' }}>
                  {t === 'shared' ? 'Shared Hosting' : 'VPS Hosting'}
                </button>
              ))}
            </div>

            {/* Billing Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: !isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Monthly</span>
              <button onClick={() => setIsYearly(!isYearly)} style={{ width: '48px', height: '26px', borderRadius: '13px', background: isYearly ? 'var(--color-primary)' : 'var(--color-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <motion.div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px' }} animate={{ left: isYearly ? '25px' : '3px' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Yearly</span>
              {isYearly && <span className="badge badge-success">Save 20%</span>}
            </div>
          </FadeInUp>

          {/* Plan Cards */}
          <StaggerChildren style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }} className="card-elevated" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', border: plan.popular ? '2px solid var(--color-primary)' : undefined }}>
                  {plan.popular && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--color-accent-gradient)' }} />}
                  {plan.popular && <span className="badge" style={{ marginBottom: '1rem' }}>Most Popular</span>}
                  <h3 className="h4" style={{ marginBottom: '0.5rem' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>${isYearly ? plan.yearly : plan.monthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                  <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>
                    Get Started <ArrowRight size={16} />
                  </a>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Domain Registration */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domains</span>
              <h2 className="h2 section-header__title">Register Your Domain</h2>
            </div>
          </FadeInUp>
          <StaggerChildren style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {DOMAINS.map((d) => (
              <StaggerItem key={d.ext}>
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>{d.ext}</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>${d.price}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>/year</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
