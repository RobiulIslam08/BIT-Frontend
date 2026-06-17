// ============================================
// BIT SOFTWARE — About Page
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Zap, Award, Globe, Shield } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { Counter } from '@/components/animations/CounterAnimation';

const VALUES = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every line of code serves a business objective. We measure success by your growth.' },
  { icon: Zap, title: 'Performance First', desc: 'Speed is not a feature — it\'s a requirement. We target 100/100 Lighthouse on every project.' },
  { icon: Shield, title: 'Security & Compliance', desc: 'ZATCA compliant, Saudi labor law aware, and built with enterprise-grade security.' },
  { icon: Globe, title: 'Arabic-First Design', desc: 'Full RTL support, Arabic typography, and culturally relevant UX from day one.' },
  { icon: Users, title: 'Client Partnership', desc: 'We don\'t just deliver and disappear. We become your long-term technology partner.' },
  { icon: Award, title: 'Quality Obsessed', desc: 'Clean code, thorough testing, and pixel-perfect design. We never cut corners.' },
];

export default function About() {
  return (
    <>
      <SEOHead title="About Us" description="Learn about BIT Software & IT Solution — Saudi Arabia's premier IT partner delivering world-class digital solutions." />

      {/* Hero */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
              <span className="section-subtitle">About Us</span>
              <h1 className="h1 section-header__title">
                We Build the Future of<br /><span className="text-gradient">Saudi Digital Business</span>
              </h1>
              <p className="section-header__desc">
                Founded with a single mission: to deliver IT solutions so good, our website itself becomes the proof. Based in Saudi Arabia, serving the world.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Stats */}
      <section className="stats section-sm">
        <div className="container">
          <div className="stats__grid">
            {[
              { value: 250, suffix: '+', label: 'Projects Completed' },
              { value: 120, suffix: '+', label: 'Happy Clients' },
              { value: 15, suffix: '+', label: 'Team Members' },
              { value: 99, suffix: '%', label: 'Client Satisfaction' },
            ].map((stat, i) => (
              <FadeInUp key={stat.label} delay={i * 0.1}>
                <div className="stats__item">
                  <div className="stats__value"><Counter to={stat.value} suffix={stat.suffix} /></div>
                  <div className="stats__label">{stat.label}</div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Our Values</span>
              <h2 className="h2 section-header__title">What Drives Us</h2>
            </div>
          </FadeInUp>
          <StaggerChildren className="services-overview__grid">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card" style={{ padding: '2rem' }}>
                  <div className="service-card__icon"><v.icon size={24} /></div>
                  <h3 className="service-card__title">{v.title}</h3>
                  <p className="service-card__desc">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <FadeInUp>
            <div className="cta-section__inner">
              <h2 className="h2 cta-section__title">Let's Work Together</h2>
              <p className="body-lg cta-section__desc">Ready to transform your business with technology?</p>
              <div className="cta-section__buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">Contact Us <ArrowRight size={18} /></Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
