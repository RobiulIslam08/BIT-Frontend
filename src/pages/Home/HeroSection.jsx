// ============================================
// BIT SOFTWARE — Hero Section (High-Fidelity Premium)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Globe, Check, BarChart3, TrendingUp, Cpu } from 'lucide-react';
import './Home.css';

const SERVICES_WORDS = [
  'Custom Software',
  'Web Applications',
  'Mobile Apps',
  'ZATCA ERPs',
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
  { text: 'ZATCA Phase-2 Compliant' },
  { text: '100% In-House Engineering' },
  { text: 'Full Source Code Ownership' },
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
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hero__word-swap-item"
        >
          {SERVICES_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FloatingParticles() {
  return (
    <div className="hero__particles">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="hero__particle"
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${3 + Math.random() * 3}px`,
            '--duration': `${12 + Math.random() * 18}s`,
            '--delay': `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="hero">
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
      

          <h1 className="hero__title">
            We Build <WordSwap />
            <br />
            <span className="hero__title-line">To Scale Your Business</span>
          </h1>

          <p className="hero__subtitle">
            Providing ZATCA Phase-2 e-invoicing platforms, bespoke enterprise software, and conversion-optimized web applications built for Saudi growth.
          </p>

          {/* Quick highlights */}
          <div className="hero__highlights">
            {HERO_HIGHLIGHTS.map((h) => (
              <div key={h.text} className="hero__highlight-item">
                <ShieldCheck size={16} className="hero__highlight-icon" />
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

        {/* Right Column: High-Fidelity Interactive Dashboard Mockup */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
                <Globe size={12} />
                <span>zatca-erp.bitsoftware.sa</span>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="hero__mock-body">
              {/* Sidebar */}
              <div className="hero__mock-sidebar">
                <div className="mock-brand">
                  <div className="mock-brand-dot" />
                  <span>BIT ERP</span>
                </div>
                <div className="sidebar-nav">
                  <div className="nav-item active">Sales Dashboard</div>
                  <div className="nav-item">ZATCA Clearance</div>
                  <div className="nav-item">POS Terminal</div>
                  <div className="nav-item">Settings</div>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="hero__mock-main">
                {/* Stats Widgets Row */}
                <div className="mock-widgets">
                  <div className="widget-card">
                    <div className="widget-header">
                      <span className="widget-title">Cleared Invoices</span>
                      <TrendingUp size={14} className="text-emerald" />
                    </div>
                    <div className="widget-value">99.98%</div>
                    <div className="widget-footer">ZATCA Phase-2 Connected</div>
                  </div>
                  
                  <div className="widget-card">
                    <div className="widget-header">
                      <span className="widget-title">Daily Sales</span>
                      <BarChart3 size={14} className="text-cyan" />
                    </div>
                    <div className="widget-value">SAR 45,820</div>
                    <div className="widget-footer">+12.4% vs Yesterday</div>
                  </div>
                </div>

                {/* Shimmering Graph Visual */}
                <div className="mock-graph-container">
                  <div className="mock-graph-header">
                    <span className="graph-label">Transaction Flow (Realtime)</span>
                    <span className="graph-status">Live</span>
                  </div>
                  <div className="mock-graph-svg">
                    <svg viewBox="0 0 300 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="shimmering-chart">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                      
                      {/* Graph Path */}
                      <path
                        d="M0 75 Q 30 35, 60 55 T 120 40 T 180 70 T 240 25 T 300 45"
                        stroke="url(#gradient-cyan-blue)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="path-draw"
                      />
                      
                      {/* Area Fill */}
                      <path
                        d="M0 75 Q 30 35, 60 55 T 120 40 T 180 70 T 240 25 T 300 45 L 300 90 L 0 90 Z"
                        fill="url(#gradient-area)"
                        className="path-draw"
                        opacity="0.15"
                      />
                      <defs>
                        <linearGradient id="gradient-cyan-blue" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="#0080FF" />
                        </linearGradient>
                        <linearGradient id="gradient-area" x1="150" y1="0" x2="150" y2="90" gradientUnits="userSpaceOnUse">
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
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShieldCheck size={14} className="text-emerald" /> 
            <span>ZATCA Phase-2 Approved</span>
          </motion.div>
          
          <motion.div
            className="hero__float-badge hero__float-badge--2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <Cpu size={14} className="text-cyan" /> 
            <span>100% Custom React</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Infinite Logo Marquee Strip */}
      <div className="hero__marquee">
        <div className="hero__marquee-track">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, index) => (
            <div key={index} className="hero__marquee-item">
              <ShieldCheck size={16} className="hero__marquee-icon" />
              <span>{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
