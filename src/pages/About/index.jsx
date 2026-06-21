// ============================================
// BIT SOFTWARE — About Page (Premium Redesign)
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Zap, Award, Globe, Shield, Heart, Lightbulb, Handshake } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { Counter } from '@/components/animations/CounterAnimation';

const VALUES = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every line of code serves a business objective. We measure success by your growth and ROI.' },
  { icon: Zap, title: 'Performance First', desc: 'Speed is not a feature — it\'s a requirement. We deliver 100/100 Lighthouse scores consistently.' },
  { icon: Shield, title: 'Security & Compliance', desc: 'ZATCA compliant, Saudi labor law aware, and built with enterprise-grade security standards.' },
  { icon: Globe, title: 'Arabic-First Design', desc: 'Full RTL support, Arabic typography, and culturally relevant UX designed for the Saudi market.' },
  { icon: Handshake, title: 'Client Partnership', desc: 'We don\'t just deliver and disappear. We become your long-term technology partner for success.' },
  { icon: Award, title: 'Quality Obsessed', desc: 'Clean code, thorough testing, and pixel-perfect design. We never compromise on quality.' },
];

const TEAM_STRENGTHS = [
  { icon: Lightbulb, title: 'Innovation', desc: 'We stay ahead of trends with React 19, AI integration, and cutting-edge architectures.' },
  { icon: Heart, title: 'Passion', desc: 'We love what we do. That passion shows in every pixel and every line of code we write.' },
  { icon: Users, title: 'Collaboration', desc: 'Your team becomes our team. We work closely with stakeholders at every stage.' },
];

export default function About() {
  return (
    <>
      <SEOHead title="About Us" description="Learn about BIT Software & IT Solution — Saudi Arabia's premier IT partner delivering world-class digital solutions." />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">About Us</span>
              <h1 className="h1 page-hero__title">
                We Build the Future of<br /><span className="text-gradient">Digital Business</span>
              </h1>
              <p className="page-hero__desc">
                Founded with a single mission: to deliver IT solutions so good, our work speaks for itself. We are a team of passionate engineers, designers, and strategists based in Saudi Arabia, serving clients worldwide.
              </p>
              <div className="page-hero__buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">Start a Project <ArrowRight size={18} /></Link>
                <Link to="/portfolio" className="btn btn-secondary btn-lg">View Our Work</Link>
              </div>
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
              <h2 className="h2 section-header__title">What Drives Us Every Day</h2>
              <p className="section-header__desc">These core values shape every decision we make and every solution we build for our clients.</p>
            </div>
          </FadeInUp>
          <StaggerChildren className="services-overview__grid">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="service-card">
                  <div className="service-card__icon"><v.icon size={24} /></div>
                  <h3 className="service-card__title">{v.title}</h3>
                  <p className="service-card__desc">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Team Strengths */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Our Team</span>
              <h2 className="h2 section-header__title">Why Our Team Stands Out</h2>
              <p className="section-header__desc">Our diverse team brings together years of experience in software engineering, design, and digital strategy.</p>
            </div>
          </FadeInUp>
          <StaggerChildren className="why-us__grid">
            {TEAM_STRENGTHS.map((item, i) => (
              <StaggerItem key={item.title}>
                <div className="why-us__card">
                  <div className="why-us__card-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="service-card__icon"><item.icon size={24} /></div>
                  <h3 className="why-us__card-title">{item.title}</h3>
                  <p className="why-us__card-desc">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="cta-section__inner">
              <h2 className="h2 cta-section__title">Let's Build Something Great Together</h2>
              <p className="body-lg cta-section__desc">Ready to transform your business with technology? We'd love to hear about your project.</p>
              <div className="cta-section__buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">Contact Us <ArrowRight size={18} /></Link>
                <Link to="/services" className="btn btn-outline-white btn-lg">Our Services</Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
