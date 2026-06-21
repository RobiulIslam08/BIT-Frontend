// ============================================
// BIT SOFTWARE — Portfolio Page (Premium Redesign)
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';

const CATEGORIES = ['All', 'Web Development', 'Mobile Apps', 'ERP', 'E-commerce', 'Branding'];

const PROJECTS = [
  { title: 'Rashidi Trading Platform', category: 'E-commerce', desc: 'Full e-commerce platform with Arabic interface and Mada payment integration for seamless Saudi transactions.', tech: ['React', 'Laravel', 'MySQL'], color: '#FF6B6B' },
  { title: 'Saudi Medical ERP', category: 'ERP', desc: 'ZATCA-compliant hospital management system serving 5 branches with real-time data synchronization.', tech: ['React', 'Node.js', 'PostgreSQL'], color: '#4ECDC4' },
  { title: 'Harbi Construction App', category: 'Mobile Apps', desc: 'Workforce management app for 200+ construction workers with attendance tracking and payroll integration.', tech: ['React Native', 'Firebase'], color: '#45B7D1' },
  { title: 'Al-Nour Academy LMS', category: 'Web Development', desc: 'Learning Management System for 10,000+ students with Arabic RTL support and video hosting.', tech: ['Next.js', 'Strapi'], color: '#96CEB4' },
  { title: 'Gulf Supply Chain Portal', category: 'Web Development', desc: 'Supply chain management portal for regional logistics company with real-time inventory tracking.', tech: ['React', 'Laravel', 'Redis'], color: '#FFEAA7' },
  { title: 'Madinah Restaurant POS', category: 'ERP', desc: 'Multi-branch restaurant POS with real-time inventory sync and ZATCA e-invoicing compliance.', tech: ['React', 'Laravel', 'MySQL'], color: '#DDA0DD' },
];

export default function Portfolio() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <>
      <SEOHead title="Portfolio" description="Explore our portfolio of successful projects across Saudi Arabia — web development, mobile apps, ERP systems, and more." />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">Our Work</span>
              <h1 className="h1 page-hero__title">Projects We're <span className="text-gradient">Proud Of</span></h1>
              <p className="page-hero__desc">Real solutions for real businesses. Browse our portfolio of successfully delivered projects.</p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="section">
        <div className="container">
          {/* Filters */}
          <FadeInUp delay={0.1}>
            <div className="filter-group">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={active === cat ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeInUp>

          {/* Grid */}
          <StaggerChildren className="services-overview__grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <StaggerItem key={project.title}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="project-card"
                  >
                    <div
                      className="project-card__image"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}15, ${project.color}30)`,
                        borderBottom: `1px solid ${project.color}25`,
                      }}
                    >
                      <span style={{ fontSize: '3rem', opacity: 0.8 }}>🖥️</span>
                    </div>
                    <div className="project-card__body">
                      <div className="badge" style={{ marginBottom: '0.75rem' }}>{project.category}</div>
                      <h3 className="project-card__title">{project.title}</h3>
                      <p className="project-card__desc">{project.desc}</p>
                      <div className="project-card__tags">
                        {project.tech.map((t) => (
                          <span key={t} className="project-card__tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
