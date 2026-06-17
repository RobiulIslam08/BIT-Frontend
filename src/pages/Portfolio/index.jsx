// ============================================
// BIT SOFTWARE — Portfolio Page
// ============================================

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';

const CATEGORIES = ['All', 'Web Development', 'Mobile Apps', 'ERP', 'E-commerce', 'Branding'];

const PROJECTS = [
  { title: 'Rashidi Trading Platform', category: 'E-commerce', desc: 'Full e-commerce platform with Arabic interface and Mada payment integration.', tech: ['React', 'Laravel', 'MySQL'], color: '#FF6B6B' },
  { title: 'Saudi Medical ERP', category: 'ERP', desc: 'ZATCA-compliant hospital management system serving 5 branches.', tech: ['React', 'Node.js', 'PostgreSQL'], color: '#4ECDC4' },
  { title: 'Harbi Construction App', category: 'Mobile Apps', desc: 'Workforce management app for 200+ construction workers.', tech: ['React Native', 'Firebase'], color: '#45B7D1' },
  { title: 'Al-Nour Academy LMS', category: 'Web Development', desc: 'Learning Management System for 10,000+ students with Arabic RTL.', tech: ['Next.js', 'Strapi'], color: '#96CEB4' },
  { title: 'Gulf Supply Chain Portal', category: 'Web Development', desc: 'Supply chain management portal for regional logistics company.', tech: ['React', 'Laravel', 'Redis'], color: '#FFEAA7' },
  { title: 'Madinah Restaurant POS', category: 'ERP', desc: 'Multi-branch restaurant POS with real-time inventory sync.', tech: ['React', 'Laravel', 'MySQL'], color: '#DDA0DD' },
];

export default function Portfolio() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <>
      <SEOHead title="Portfolio" description="Explore our portfolio of successful projects across Saudi Arabia." />

      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Our Work</span>
              <h1 className="h1 section-header__title">Projects We're <span className="text-gradient">Proud Of</span></h1>
              <p className="section-header__desc">Real solutions for real Saudi businesses.</p>
            </div>
          </FadeInUp>

          {/* Filters */}
          <FadeInUp delay={0.1}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
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
            {filtered.map((project) => (
              <StaggerItem key={project.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="card-elevated"
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{
                    height: '180px', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
                    background: `linear-gradient(135deg, ${project.color}22, ${project.color}44)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${project.color}33`,
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>🖥️</span>
                  </div>
                  <div className="badge" style={{ marginBottom: '0.75rem' }}>{project.category}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>{project.title}</h3>
                  <p className="body-sm" style={{ marginBottom: '1rem' }}>{project.desc}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {project.tech.map((t) => (
                      <span key={t} style={{
                        fontSize: 'var(--text-xs)', padding: '0.25rem 0.5rem',
                        background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-secondary)',
                      }}>{t}</span>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
