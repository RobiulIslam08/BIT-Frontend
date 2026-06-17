// ============================================
// BIT SOFTWARE — Process Section (Scroll Drawing)
// ============================================

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import './Home.css';

const STEPS = [
  { num: '01', title: 'Discover', desc: 'Deep-dive workshops and detailed technical mapping.' },
  { num: '02', title: 'Design', desc: 'High-fidelity interactive UI/UX prototyping and user flows.' },
  { num: '03', title: 'Build', desc: 'Bespoke full-stack engineering with daily builds and security audits.' },
  { num: '04', title: 'Launch', desc: 'ZATCA compliance integration, production deployment, and onboarding.' },
  { num: '05', title: 'Support', desc: 'SLA-backed 24/7 server monitoring and feature updates.' }
];

export default function ProcessSection() {
  const containerRef = useRef(null);
  
  // Track scroll progress across this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center']
  });

  // Smooth the scroll input to make it feel fluid
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  return (
    <section className="process section" ref={containerRef}>
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle">Our Method</div>
          <h2 className="h2 section-header__title">A Clear Process For Results</h2>
          <p className="section-header__desc">
            How we translate your business goals into clean, custom software systems from scoping to launch.
          </p>
        </div>

        <div className="process__timeline-wrapper">
          {/* Horizontal SVG Line (Desktop Only) */}
          <div className="process__line-horizontal-container">
            <svg viewBox="0 0 1000 20" fill="none" className="process__svg-horizontal" preserveAspectRatio="none">
              <path
                d="M 50 10 L 950 10"
                stroke="var(--color-border)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.path
                d="M 50 10 L 950 10"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Vertical SVG Line (Mobile Only) */}
          <div className="process__line-vertical-container">
            <svg viewBox="0 0 20 600" fill="none" className="process__svg-vertical" preserveAspectRatio="none">
              <path
                d="M 10 20 L 10 580"
                stroke="var(--color-border)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.path
                d="M 10 20 L 10 580"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Steps list */}
          <div className="process__steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="process__step-item">
                <div className="process__step-badge-wrapper">
                  <div className="process__step-badge">
                    {step.num}
                  </div>
                </div>
                <h3 className="h4 process__step-item-title">{step.title}</h3>
                <p className="process__step-item-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
