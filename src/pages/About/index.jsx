// ============================================
// BIT SOFTWARE — About Page (Premium Redesign)
// ============================================

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Zap,
  Award,
  Globe,
  Shield,
  Handshake,
  MapPin,
  Mail,
} from 'lucide-react';
import { Linkedin, Facebook, Github } from '@/components/common/BrandIcons';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { Counter } from '@/components/animations/CounterAnimation';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import { COMPANY, TEAM_MEMBERS } from '@/utils/constants';
import './About.css';

const VALUES = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every line of code serves a business objective. We measure success by your growth and ROI.' },
  { icon: Zap, title: 'Performance First', desc: 'Speed is not a feature — it\'s a requirement. We deliver 100/100 Lighthouse scores consistently.' },
  { icon: Shield, title: 'Security & Compliance', desc: 'ZATCA compliant, Saudi labor law aware, and built with enterprise-grade security standards.' },
  { icon: Globe, title: 'Arabic-First Design', desc: 'Full RTL support, Arabic typography, and culturally relevant UX designed for the Saudi market.' },
  { icon: Handshake, title: 'Client Partnership', desc: 'We don\'t just deliver and disappear. We become your long-term technology partner for success.' },
  { icon: Award, title: 'Quality Obsessed', desc: 'Clean code, thorough testing, and pixel-perfect design. We never compromise on quality.' },
];

const STORY_PILLARS = [
  { label: 'Arabic-first', detail: 'RTL & local UX', icon: Globe },
  { label: 'ZATCA-ready', detail: 'Compliance built-in', icon: Shield },
  { label: 'Long-term', detail: 'Partners, not vendors', icon: Handshake },
];

const TEAM_SOCIALS = {
  ceo: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    mail: 'mailto:ceo@bitsoftware.sa',
  },
  engineer: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    mail: 'mailto:engineer@bitsoftware.sa',
  },
  marketer: {
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    mail: 'mailto:marketer@bitsoftware.sa',
  },
};

const ABOUT_STATS = [
  { value: 250, suffix: '+', label: 'Projects Completed' },
  { value: 120, suffix: '+', label: 'Happy Clients' },
  { value: 15, suffix: '+', label: 'Team Members' },
  { value: 99, suffix: '%', label: 'Client Satisfaction' },
];

export default function About() {
  const [ceo, ...rest] = TEAM_MEMBERS;

  return (
    <div className="about-page">
      <SEOHead title="About Us" description="Learn about BIT Software & IT Solution — Saudi Arabia's premier IT partner delivering world-class digital solutions." />

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__atmosphere" aria-hidden="true">
          <span className="about-hero__orb about-hero__orb--1" />
          <span className="about-hero__orb about-hero__orb--2" />
          <span className="about-hero__grid" />
        </div>
        <div className="container about-hero__layout">
          <FadeInUp>
            <div className="about-hero__copy">
              <p className="about-hero__brand">{COMPANY.name}</p>
              <span className="section-subtitle">About Us</span>
              <h1 className="h1 about-hero__title">
                We Build the Future of{' '}
                <span className="text-gradient">Digital Business</span>
              </h1>
              <p className="about-hero__desc">
                World-class IT solutions from Riyadh — engineered for performance, compliance, and growth across Saudi Arabia and beyond.
              </p>
              <div className="about-hero__actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Start a Project <ArrowRight size={18} />
                </Link>
                <a href="#team" className="btn btn-secondary btn-lg">
                  Meet the Team
                </a>
              </div>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.14}>
            <div className="about-hero__visual" aria-hidden="true">
              <div className="about-hero__collage">
                <div className="about-hero__shot about-hero__shot--lead">
                  <img src="/project1.png" alt="E-commerce Application" />
                </div>
                <div className="about-hero__shot about-hero__shot--mid">
                  <img src="/project2.png" alt="Custom ERP Dashboard" />
                </div>
                <div className="about-hero__shot about-hero__shot--trail">
                  <img src="/project3.png" alt="Mobile App Interface" />
                </div>
                <div className="about-hero__visual-base">
                  <MapPin size={14} />
                  <span>{COMPANY.address}</span>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Our Story */}
      <ScrollBlurReveal>
        <section className="about-story section">
          <div className="container">
            <div className="about-story__grid">
              <FadeInUp>
                <div className="about-story__copy">
                  <span className="section-subtitle about-story__eyebrow">Our Story</span>
                  <h2 className="h2 about-story__title">
                    Built in Saudi Arabia.<br />
                    <span className="text-gradient">Delivered for the world.</span>
                  </h2>
                  <p className="about-story__text">
                    {COMPANY.name} started with a clear mission: ship IT solutions so strong the work speaks for itself. From ERP and web platforms to marketing systems, we help businesses move faster with technology they can trust.
                  </p>
                  <p className="about-story__text">
                    Based in {COMPANY.address}, our engineers, designers, and strategists build Arabic-first, ZATCA-aware products — then scale them for clients who expect excellence.
                  </p>
                  <ul className="about-story__pillars">
                    {STORY_PILLARS.map((pillar) => {
                      const IconComponent = pillar.icon;
                      return (
                        <li key={pillar.label} className="about-story__pillar">
                          <IconComponent size={18} className="about-story__pillar-icon" aria-hidden />
                          <div>
                            <strong>{pillar.label}</strong>
                            <span>{pillar.detail}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.12}>
                <div className="about-story__visual">
                  <div className="about-story__visual-glow" aria-hidden="true" />
                  <div className="about-story__visual-frame">
                    <div className="about-story__visual-inner">
                      <span className="about-story__pin">
                        <MapPin size={16} aria-hidden />
                        Headquarters
                      </span>
                      <p className="about-story__location">{COMPANY.address}</p>
                      <p className="about-story__location-sub">{COMPANY.tagline}</p>
                      <div className="about-story__visual-stats">
                        <div>
                          <span className="about-story__vs-value">5+</span>
                          <span className="about-story__vs-label">Years</span>
                        </div>
                        <div>
                          <span className="about-story__vs-value">KSA</span>
                          <span className="about-story__vs-label">Market focus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="about-story__float about-story__float--a" aria-hidden="true">
                    <span>ZATCA</span>
                    Compliant
                  </div>
                  <div className="about-story__float about-story__float--b" aria-hidden="true">
                    <span>RTL</span>
                    Arabic-first
                  </div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </section>
      </ScrollBlurReveal>

      {/* Stats */}
      <ScrollBlurReveal>
        <section className="about-stats section-sm">
          <div className="container">
            <div className="about-stats__rail">
              {ABOUT_STATS.map((stat, i) => (
                <FadeInUp key={stat.label} delay={i * 0.08}>
                  <div className="about-stats__item">
                    <div className="about-stats__value">
                      <Counter to={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="about-stats__label">{stat.label}</div>
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>
      </ScrollBlurReveal>

      {/* Values */}
      <ScrollBlurReveal>
        <section className="about-values section">
          <div className="container">
            <FadeInUp>
              <div className="section-header">
                <span className="section-subtitle">Our Values</span>
                <h2 className="h2 section-header__title">What Drives Us Every Day</h2>
                <p className="section-header__desc">
                  These core values shape every decision we make and every solution we build for our clients.
                </p>
              </div>
            </FadeInUp>
            <StaggerChildren className="about-values__grid" stagger={0.06}>
              {VALUES.map((v, i) => (
                <StaggerItem key={v.title}>
                  <article className="about-value">
                    <div className="about-value__top">
                      <span className="about-value__index">{String(i + 1).padStart(2, '0')}</span>
                      <div className="about-value__icon">
                        <v.icon size={22} />
                      </div>
                    </div>
                    <h3 className="about-value__title">{v.title}</h3>
                    <p className="about-value__desc">{v.desc}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      </ScrollBlurReveal>

      {/* Meet the Team */}
      <ScrollBlurReveal>
        <section id="team" className="about-team section">
          <div className="about-team__bg" aria-hidden="true">
            <span className="about-team__bg-orb about-team__bg-orb--1" />
            <span className="about-team__bg-orb about-team__bg-orb--2" />
          </div>
          <div className="container">
            <FadeInUp>
              <div className="section-header about-team__header">
                <span className="section-subtitle">Our Team</span>
                <h2 className="h2 section-header__title">
                  Meet the People <span className="text-gradient">Behind BIT</span>
                </h2>
                <p className="section-header__desc">
                  Leadership across strategy, engineering, and growth — focused on shipping work that lasts.
                </p>
              </div>
            </FadeInUp>

            <div className="about-team__stage">
              {ceo && (
                <FadeInUp>
                  <article className="about-team__feature">
                    <div className="about-team__feature-media">
                      <img
                        src={ceo.image}
                        alt={ceo.name}
                        className="about-team__photo"
                        width={720}
                        height={900}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="about-team__feature-veil" />
                      <div className="about-team__feature-meta">
                        <div className="about-team__role-badge">
                          <Award size={14} className="about-team__role-icon" />
                          <span>{ceo.role}</span>
                        </div>
                        <h3 className="about-team__name">{ceo.name}</h3>
                        <p className="about-team__bio">{ceo.bio}</p>
                        <div className="about-team__socials">
                          <a href={TEAM_SOCIALS.ceo.linkedin} target="_blank" rel="noopener noreferrer" className="about-team__social-link" aria-label="LinkedIn">
                            <Linkedin size={16} />
                          </a>
                          <a href={TEAM_SOCIALS.ceo.facebook} target="_blank" rel="noopener noreferrer" className="about-team__social-link" aria-label="Facebook">
                            <Facebook size={16} />
                          </a>
                          <a href={TEAM_SOCIALS.ceo.mail} className="about-team__social-link" aria-label="Email">
                            <Mail size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeInUp>
              )}

              <StaggerChildren className="about-team__side" stagger={0.12}>
                {rest.map((member, i) => (
                  <StaggerItem key={member.id}>
                    <article className="about-team__member">
                      <div className="about-team__photo-wrap">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="about-team__photo"
                          width={480}
                          height={600}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="about-team__member-veil" />
                      </div>
                      <div className="about-team__info">
                        <span className="about-team__role">{member.role}</span>
                        <h3 className="about-team__name">{member.name}</h3>
                        <p className="about-team__bio">{member.bio}</p>
                        <div className="about-team__socials">
                          <a href={TEAM_SOCIALS[member.id]?.linkedin} target="_blank" rel="noopener noreferrer" className="about-team__social-link" aria-label="LinkedIn">
                            <Linkedin size={14} />
                          </a>
                          {TEAM_SOCIALS[member.id]?.github && (
                            <a href={TEAM_SOCIALS[member.id].github} target="_blank" rel="noopener noreferrer" className="about-team__social-link" aria-label="GitHub">
                              <Github size={14} />
                            </a>
                          )}
                          {TEAM_SOCIALS[member.id]?.facebook && (
                            <a href={TEAM_SOCIALS[member.id].facebook} target="_blank" rel="noopener noreferrer" className="about-team__social-link" aria-label="Facebook">
                              <Facebook size={14} />
                            </a>
                          )}
                          <a href={TEAM_SOCIALS[member.id]?.mail} className="about-team__social-link" aria-label="Email">
                            <Mail size={14} />
                          </a>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>
      </ScrollBlurReveal>

      {/* CTA */}
      <ScrollBlurReveal>
        <section className="section">
          <div className="container">
            <FadeInUp>
              <div className="cta-section__inner">
                <h2 className="h2 cta-section__title">Let's Build Something Great Together</h2>
                <p className="body-lg cta-section__desc">
                  Ready to transform your business with technology? We'd love to hear about your project.
                </p>
                <div className="cta-section__buttons">
                  <Link to="/contact" className="btn btn-primary btn-lg">
                    Contact Us <ArrowRight size={18} />
                  </Link>
                  <Link to="/services" className="btn btn-outline-white btn-lg">
                    Our Services
                  </Link>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>
      </ScrollBlurReveal>
    </div>
  );
}
