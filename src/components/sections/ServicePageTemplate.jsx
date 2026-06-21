// ============================================
// BIT SOFTWARE — ServicePageTemplate (Premium Redesign)
// Reusable template for all individual service pages
// Center-aligned, responsive, professional design
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { Counter } from '@/components/animations/CounterAnimation';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import { COMPANY } from '@/utils/constants';

export function ServicePageTemplate({ seo, hero, features, whyUs, process, stats, faqs }) {
  return (
    <>
      <SEOHead title={seo.title} description={seo.description} />

      {/* Hero — Center Aligned (Above the fold, no scroll reveal for instant display) */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">{hero.subtitle}</span>
              <h1 className="h1 page-hero__title">{hero.title}</h1>
              <p className="page-hero__desc">{hero.description}</p>
              <div className="page-hero__buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">Get Started <ArrowRight size={18} /></Link>
                <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg"><Phone size={18} /> WhatsApp Us</a>
              </div>
              {hero.badges && (
                <div className="page-hero__badges">
                  {hero.badges.map((b) => (
                    <div key={b} className="page-hero__badge-item">
                      <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features — Center Aligned Cards */}
      {features && (
        <ScrollBlurReveal>
          <section className="section">
            <div className="container">
              <FadeInUp>
                <div className="section-header">
                  <span className="section-subtitle">What We Offer</span>
                  <h2 className="h2 section-header__title">{features.title || 'Our Capabilities'}</h2>
                </div>
              </FadeInUp>
              <StaggerChildren className="services-overview__grid">
                {features.items.map((f) => (
                  <StaggerItem key={f.title}>
                    <div className="service-card">
                      <div className="service-card__icon"><f.icon size={24} /></div>
                      <h3 className="service-card__title">{f.title}</h3>
                      <p className="service-card__desc">{f.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        </ScrollBlurReveal>
      )}

      {/* Stats */}
      {stats && (
        <ScrollBlurReveal>
          <section className="stats section-sm">
            <div className="container">
              <div className="stats__grid">
                {stats.map((s, i) => (
                  <FadeInUp key={s.label} delay={i * 0.1}>
                    <div className="stats__item">
                      <div className="stats__value"><Counter to={s.value} suffix={s.suffix} /></div>
                      <div className="stats__label">{s.label}</div>
                    </div>
                  </FadeInUp>
                ))}
              </div>
            </div>
          </section>
        </ScrollBlurReveal>
      )}

      {/* Why Choose Us — Center Aligned Cards */}
      {whyUs && (
        <ScrollBlurReveal>
          <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
            <div className="container">
              <FadeInUp>
                <div className="section-header">
                  <span className="section-subtitle">Why Choose Us</span>
                  <h2 className="h2 section-header__title">{whyUs.title || 'Why BIT Software?'}</h2>
                </div>
              </FadeInUp>
              <StaggerChildren className="why-us__grid">
                {whyUs.items.map((item, i) => (
                  <StaggerItem key={item.title}>
                    <div className="why-us__card">
                      <div className="why-us__card-number">{String(i + 1).padStart(2, '0')}</div>
                      <h3 className="why-us__card-title">{item.title}</h3>
                      <p className="why-us__card-desc">{item.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        </ScrollBlurReveal>
      )}

      {/* FAQ */}
      {faqs && <FAQBlock items={faqs} />}

      {/* CTA */}
      <ScrollBlurReveal>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <FadeInUp>
              <div className="cta-section__inner">
                <h2 className="h2 cta-section__title">Ready to Get Started?</h2>
                <p className="body-lg cta-section__desc">Contact us today for a free consultation and quote. Let's build something great together.</p>
                <div className="cta-section__buttons">
                  <Link to="/contact" className="btn btn-primary btn-lg">Contact Us <ArrowRight size={18} /></Link>
                  <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline-white btn-lg"><Phone size={18} /> WhatsApp</a>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>
      </ScrollBlurReveal>
    </>
  );
}

function FAQBlock({ items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <ScrollBlurReveal>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">FAQ</span>
              <h2 className="h2 section-header__title">Frequently Asked Questions</h2>
            </div>
          </FadeInUp>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((faq, i) => (
              <FadeInUp key={i} delay={i * 0.05}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    style={{
                      width: '100%', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)', textAlign: 'left',
                    }}
                  >
                    {faq.q}
                    <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openIdx === i ? 'auto' : 0, opacity: openIdx === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 1.5rem 1.25rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>
                  </motion.div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>
    </ScrollBlurReveal>
  );
}
