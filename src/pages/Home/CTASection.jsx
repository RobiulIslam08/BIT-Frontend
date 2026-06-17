// ============================================
// BIT SOFTWARE — CTA Section (Premium Rebuild)
// ============================================

import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { COMPANY } from '@/utils/constants';
import './Home.css';

export default function CTASection() {
  return (
    <section className="cta-section section">
      <div className="container">
        <div className="cta-section__inner">
          {/* Overlay gradient layers managed by CSS */}
          <div className="cta-section__overlay" />
          
          <div className="cta-section__content">
            <h2 className="h2 cta-section__title">
              Ready to Accelerate Your Digital Transformation?
            </h2>
            <p className="cta-section__desc">
              Discuss your custom SaaS, ERP system, or web & mobile app goals with our engineering team. Get a transparent roadmap and quote.
            </p>
            <div className="cta-section__buttons">
              <Link to="/contact" className="btn btn-primary btn-lg">
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
                WhatsApp Consult
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
