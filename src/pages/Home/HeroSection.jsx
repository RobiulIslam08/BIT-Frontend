// ============================================
// BIT SOFTWARE — Hero Section (Premium Rebuild)
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Terminal, Layout, Shield, Cpu, Cloud, Check } from 'lucide-react';
import './Home.css';

const SERVICES_WORDS = [
  'Custom Software',
  'Web Applications',
  'Mobile Apps',
  'ERP Solutions',
  'Digital Marketing'
];

const TRUST_LOGOS = [
  'Saudi Made Certified',
  'ZATCA Compliant E-Invoicing',
  'Riyadh Chamber Member',
  'Aramco Vendor Approved',
  'MCI Commercial Registry',
  'SCA Cybersecurity Standard'
];

function WordSwap() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SERVICES_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="hero__word-swap-container">
      <AnimatePresence mode="wait">
        <motion.span
          key={SERVICES_WORDS[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hero__word-swap-item"
        >
          {SERVICES_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Background Orbs & Grids */}
      <div className="hero__bg">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />
        <div className="hero__bg-grid" />
        <div className="hero__bg-gradient" />
      </div>

      <div className="container hero__container">
        {/* Left Column: Copy & Actions */}
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Saudi Arabia's Premier Technology Partner
          </div>

          <h1 className="hero__title">
            We Engineer
            <br />
            <WordSwap />
            <br />
            For Saudi Businesses
          </h1>

          <p className="hero__subtitle">
            Providing ZATCA-compliant ERPs, custom SaaS, and next-gen web & mobile applications built to accelerate growth.
          </p>

          <div className="hero__ctas">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Start Your Project
              <ArrowRight size={18} />
            </Link>
            <Link to="/portfolio" className="btn btn-outline-cyan btn-lg">
              View Our Work
            </Link>
          </div>
        </div>

        {/* Right Column: Animated Mock Product Panel */}
        <div className="hero__visual">
          <div className="hero__mock-panel">
            {/* Header / Chrome Controls */}
            <div className="hero__mock-header">
              <div className="hero__mock-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="hero__mock-url">
                <Terminal size={12} />
                <span>dashboard.bitsoftware.sa</span>
              </div>
            </div>

            {/* Panel Body */}
            <div className="hero__mock-body">
              {/* Sidebar Skeletons */}
              <div className="hero__mock-sidebar">
                <div className="sidebar-logo skeleton-block" style={{ width: '40px', height: '14px' }} />
                <div className="sidebar-nav">
                  <div className="nav-item skeleton-block" style={{ width: '100%', height: '12px' }} />
                  <div className="nav-item skeleton-block" style={{ width: '85%', height: '12px' }} />
                  <div className="nav-item skeleton-block" style={{ width: '90%', height: '12px' }} />
                  <div className="nav-item skeleton-block" style={{ width: '70%', height: '12px' }} />
                </div>
              </div>

              {/* Main Workspace */}
              <div className="hero__mock-main">
                {/* Stats Widgets Row */}
                <div className="mock-widgets">
                  <div className="widget-card">
                    <div className="widget-icon skeleton-block" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                    <div className="widget-info">
                      <div className="skeleton-block" style={{ width: '32px', height: '8px', marginBottom: '6px' }} />
                      <div className="skeleton-block" style={{ width: '48px', height: '14px' }} />
                    </div>
                  </div>
                  <div className="widget-card">
                    <div className="widget-icon skeleton-block" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                    <div className="widget-info">
                      <div className="skeleton-block" style={{ width: '32px', height: '8px', marginBottom: '6px' }} />
                      <div className="skeleton-block" style={{ width: '48px', height: '14px' }} />
                    </div>
                  </div>
                </div>

                {/* Shimmering Graph Visual */}
                <div className="mock-graph-container">
                  <div className="mock-graph-header">
                    <div className="skeleton-block" style={{ width: '80px', height: '12px' }} />
                    <div className="skeleton-block" style={{ width: '40px', height: '12px' }} />
                  </div>
                  <div className="mock-graph-svg">
                    <svg viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shimmering-chart">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(0, 255, 255, 0.05)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0, 255, 255, 0.05)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(0, 255, 255, 0.05)" strokeWidth="1" />
                      {/* Graph Path */}
                      <path
                        d="M0 80 Q 40 20, 80 50 T 160 30 T 240 70 T 300 10"
                        stroke="url(#gradient-cyan-blue)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="path-draw"
                      />
                      <defs>
                        <linearGradient id="gradient-cyan-blue" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="#0080FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Logo Marquee Strip */}
      <div className="hero__marquee">
        <div className="hero__marquee-track">
          {/* Render twice for seamless looping */}
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, index) => (
            <div key={index} className="hero__marquee-item">
              <Shield size={16} className="hero__marquee-icon" />
              <span>{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
