// ============================================
// BIT SOFTWARE — Testimonials Section (Drag-to-Scroll Carousel)
// ============================================

import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2 } from 'lucide-react';
import './Home.css';

const TESTIMONIALS = [
  {
    name: 'Ibrahim Al-Mutairi',
    role: 'CTO',
    company: 'Al-Safi Dairy',
    text: 'BIT Software delivered our ZATCA Phase-2 billing integration ahead of schedule. The codebase they compiled is clean, documentations are flawless, and our team adapted instantly.',
    initials: 'IM',
    project: 'ZATCA Compliance Integration',
    date: 'April 2026',
    verified: true,
    logoText: 'Al-Safi Dairy'
  },
  {
    name: 'Yasmin Al-Harbi',
    role: 'Product Owner',
    company: 'Nadec Group',
    text: 'Their team rebuilt our e-commerce checkout flow, boosting our mobile conversions by 42%. Communication was transparent throughout, with daily builds provided directly via our private repository.',
    initials: 'YH',
    project: 'Mobile E-Commerce Flow',
    date: 'May 2026',
    verified: true,
    logoText: 'Nadec Group'
  },
  {
    name: 'Fahad bin Abdulaziz',
    role: 'Logistics Director',
    company: 'Naqel Express',
    text: 'A masterclass in React engineering. The real-time mapping dispatch board decreased our dispatch response time by 28% from day one. Full IP ownership transfer was smooth and professional.',
    initials: 'FA',
    project: 'Real-time Dispatch System',
    date: 'June 2026',
    verified: true,
    logoText: 'Naqel Express'
  },
  {
    name: 'Sarah Al-Judaibi',
    role: 'General Manager',
    company: 'Riyadh Retail Group',
    text: 'The POS and localized inventory systems we commissioned are highly performant and intuitive. Highly responsive customer support team and SLA commitments are fully honored.',
    initials: 'SJ',
    project: 'POS & Inventory ERP System',
    date: 'June 2026',
    verified: true,
    logoText: 'Riyadh Retail'
  }
];

export default function TestimonialsSection() {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };

    // Delay calculation slightly to ensure layout rendering completes
    const timeoutId = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="testimonials section">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle font-semibold">Testimonials</div>
          <h2 className="h2 section-header__title">What Partners Say About Us</h2>
          <p className="section-header__desc">
            Drag to scroll through reviews from enterprise leaders who chose BIT Software.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="testimonials__carousel-wrapper">
          <motion.div
            ref={carouselRef}
            className="testimonials__carousel-container"
            whileTap={{ cursor: 'grabbing' }}
          >
            <motion.div
              drag="x"
              dragConstraints={{ right: 0, left: -width }}
              className="testimonials__carousel-track"
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="testimonial-card-premium">
                  <div className="testimonial-card-premium__header">
                    <div className="testimonial-card-premium__stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    {t.verified && (
                      <span className="testimonial-card-premium__verified">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                        <span>Verified Review</span>
                      </span>
                    )}
                  </div>

                  <span className="testimonial-card-premium__project-badge">
                    {t.project}
                  </span>

                  <p className="testimonial-card-premium__text">
                    "{t.text}"
                  </p>

                  <div className="testimonial-card-premium__author">
                    <div className="testimonial-card-premium__avatar-container">
                      <div className="testimonial-card-premium__avatar">
                        {t.initials}
                      </div>
                      <span className="testimonial-card-premium__avatar-dot"></span>
                    </div>
                    
                    <div className="testimonial-card-premium__author-info">
                      <div className="testimonial-card-premium__name">{t.name}</div>
                      <div className="testimonial-card-premium__role">
                        {t.role}, <strong className="testimonial-card-premium__author-company">{t.company}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="testimonial-card-premium__meta">
                    <span className="testimonial-card-premium__date">{t.date}</span>
                    <span className="testimonial-card-premium__company-logo">{t.logoText}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
