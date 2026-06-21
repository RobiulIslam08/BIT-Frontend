// ============================================
// BIT SOFTWARE — Services Hub Page (Premium Redesign)
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Database, Smartphone, Share2, Palette, PenTool, Server, TrendingUp, MapPin, HardDrive, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import { SERVICES, COMPANY } from '@/utils/constants';

const ICON_MAP = { Globe, Database, Smartphone, Share2, Palette, PenTool, Server, TrendingUp, MapPin, HardDrive };

export default function Services() {
  return (
    <>
      <SEOHead title="Our Services" description="Explore our full range of IT services — web development, ERP, mobile apps, marketing, and more." />

      {/* Hero (Above the fold, no scroll reveal for instant display) */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">Our Services</span>
              <h1 className="h1 page-hero__title">Comprehensive IT <span className="text-gradient">Solutions</span></h1>
              <p className="page-hero__desc">From concept to launch, we provide end-to-end digital solutions tailored for businesses. Explore our full range of services below.</p>
              <div className="page-hero__buttons">
                <Link to="/contact" className="btn btn-primary btn-lg">Get a Free Quote <ArrowRight size={18} /></Link>
                <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg"><Phone size={18} /> WhatsApp Us</a>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Services Grid */}
      <ScrollBlurReveal>
        <section className="section">
          <div className="container">
            <FadeInUp>
              <div className="section-header">
                <span className="section-subtitle">What We Offer</span>
                <h2 className="h2 section-header__title">Services That Drive Results</h2>
                <p className="section-header__desc">Each service is crafted to deliver measurable business outcomes for your company.</p>
              </div>
            </FadeInUp>
            <StaggerChildren className="services-overview__grid">
              {SERVICES.map((s) => {
                const Icon = ICON_MAP[s.icon] || Globe;
                return (
                  <StaggerItem key={s.id}>
                    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
                      <Link to={s.path} className="service-card">
                        <div className="service-card__icon"><Icon size={24} /></div>
                        <h3 className="service-card__title">{s.title}</h3>
                        <p className="service-card__desc">{s.description}</p>
                        <span className="service-card__cta">Learn More <ArrowRight size={14} /></span>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          </div>
        </section>
      </ScrollBlurReveal>

      {/* CTA */}
      <ScrollBlurReveal>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <FadeInUp>
              <div className="cta-section__inner">
                <h2 className="h2 cta-section__title">Not Sure Which Service You Need?</h2>
                <p className="body-lg cta-section__desc">Tell us about your business goals and we'll recommend the perfect solution for you.</p>
                <div className="cta-section__buttons">
                  <Link to="/contact" className="btn btn-primary btn-lg">Get Free Consultation <ArrowRight size={18} /></Link>
                </div>
              </div>
            </FadeInUp>
          </div>
        </section>
      </ScrollBlurReveal>
    </>
  );
}
