// ============================================
// BIT SOFTWARE — CTA Section (Ultra-Premium)
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Sparkles, Rocket } from 'lucide-react';
import { COMPANY } from '@/utils/constants';
import './Home.css';

export default function CTASection() {
  return (
    <section className="cta-section section">
      <div className="container">
        <div className="cta-section__inner">
          {/* Overlay gradient layers managed by CSS */}
          <div className="cta-section__overlay" />
          
          {/* Animated grid lines */}
          <div className="cta-section__grid-bg" />

          <div className="cta-section__content">
            <div className="cta-section__icon-badge">
              <Rocket size={24} />
            </div>
            <h2 className="h2 cta-section__title">
              Let's Build Something <span className="text-gradient">Extraordinary</span> Together
            </h2>
            <p className="cta-section__desc">
              Whether you need a ZATCA-compliant ERP, a high-converting e-commerce platform, or a custom SaaS — 
              our engineering team is ready to turn your vision into reality. <strong>Get a free consultation today.</strong>
            </p>
            <div className="cta-section__buttons">
              <Link to="/contact" className="btn btn-primary btn-lg">
                <Sparkles size={18} />
                Start Your Project
                <ArrowRight size={18} />
              </Link>
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-white btn-lg"
              >
                <Phone size={18} />
                WhatsApp Us Now
              </a>
            </div>
            <p className="cta-section__note">Free consultation • No commitment • Response within 2 hours</p>
          </div>
        </div>
      </div>
    </section>
  );
}
