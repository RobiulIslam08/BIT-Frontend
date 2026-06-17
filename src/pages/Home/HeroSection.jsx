// ============================================
// BIT SOFTWARE — Hero Section (Ultra-Premium)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ArrowRight, Terminal, Shield, Sparkles, Zap, Globe, CheckCircle2 } from 'lucide-react';
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

const HERO_HIGHLIGHTS = [
  { icon: CheckCircle2, text: 'ZATCA Phase-2 Certified' },
  { icon: CheckCircle2, text: '250+ Projects Delivered' },
  { icon: CheckCircle2, text: '24/7 Support' },
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
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hero__word-swap-item"
        >
          {SERVICES_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="hero__particles">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="hero__particle"
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${2 + Math.random() * 4}px`,
            '--duration': `${15 + Math.random() * 25}s`,
            '--delay': `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const heroRef = useRef(null);

  return (
    <section className="hero" ref={heroRef}>
      {/* Background Orbs & Grids */}
      <div className="hero__bg">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />
        <div className="hero__bg-orb hero__bg-orb--3" />
        <div className="hero__bg-grid" />
        <div className="hero__bg-gradient" />
        <FloatingParticles />
      </div>

      <div className="container hero__container">
        {/* Left Column: Copy & Actions */}
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero__badge">
            <Sparkles size={14} className="hero__badge-icon" />
            Saudi Arabia's #1 Technology Partner
          </div>

          <h1 className="hero__title">
            We Build
            <br />
            <WordSwap />
            <br />
            <span className="hero__title-line">That Drive Growth</span>
          </h1>

          <p className="hero__subtitle">
            From ZATCA-compliant ERPs to next-gen web & mobile apps — we transform ambitious ideas into
            <strong> scalable, revenue-generating</strong> digital products for Saudi businesses.
          </p>

          {/* Quick highlights */}
          <div className="hero__highlights">
            {HERO_HIGHLIGHTS.map((h) => (
              <div key={h.text} className="hero__highlight-item">
                <h.icon size={16} />
                <span>{h.text}</span>
              </div>
            ))}
          </div>

          <div className="hero__ctas">
            <Link to="/contact" className="btn btn-primary btn-lg hero__cta-primary">
              <Zap size={18} />
              Start Your Project
              <ArrowRight size={18} />
            </Link>
            <Link to="/portfolio" className="btn btn-outline-cyan btn-lg">
              View Our Work
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Animated Mock Product Panel */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
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
                      {/* Area fill */}
                      <path
                        d="M0 80 Q 40 20, 80 50 T 160 30 T 240 70 T 300 10 L 300 100 L 0 100 Z"
                        fill="url(#gradient-area)"
                        className="path-draw"
                        opacity="0.15"
                      />
                      <defs>
                        <linearGradient id="gradient-cyan-blue" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="#0080FF" />
                        </linearGradient>
                        <linearGradient id="gradient-area" x1="150" y1="0" x2="150" y2="100" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge overlays */}
          <motion.div
            className="hero__float-badge hero__float-badge--1"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Globe size={14} /> 250+ Projects
          </motion.div>
          <motion.div
            className="hero__float-badge hero__float-badge--2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Shield size={14} /> ZATCA Certified
          </motion.div>
        </motion.div>
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
