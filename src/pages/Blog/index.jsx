// ============================================
// BIT SOFTWARE — Blog Page
// ============================================

import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';

const POSTS = [
  { slug: 'web-development-saudi-2025', title: 'Web Development Trends in Saudi Arabia 2025', excerpt: 'Discover the latest web development trends shaping the Saudi digital landscape.', date: 'Dec 15, 2025', readTime: '5 min', category: 'Web Development' },
  { slug: 'zatca-compliance-erp', title: 'ZATCA Compliance: What Your ERP System Needs', excerpt: 'Everything you need to know about making your ERP system ZATCA compliant.', date: 'Dec 10, 2025', readTime: '8 min', category: 'ERP' },
  { slug: 'mobile-apps-saudi-market', title: 'Building Mobile Apps for the Saudi Market', excerpt: 'Key considerations when developing mobile apps targeting Saudi Arabia users.', date: 'Dec 5, 2025', readTime: '6 min', category: 'Mobile' },
  { slug: 'seo-arabic-websites', title: 'SEO Best Practices for Arabic Websites', excerpt: 'How to optimize your Arabic website for Google search in Saudi Arabia.', date: 'Nov 28, 2025', readTime: '7 min', category: 'Marketing' },
  { slug: 'ecommerce-mada-integration', title: 'Mada Payment Integration Guide', excerpt: 'Step-by-step guide to integrating Mada payments into your e-commerce platform.', date: 'Nov 20, 2025', readTime: '10 min', category: 'E-commerce' },
  { slug: 'google-my-business-saudi', title: 'Google My Business Optimization for Saudi Businesses', excerpt: 'Maximize your local search visibility with these GMB optimization tips.', date: 'Nov 15, 2025', readTime: '5 min', category: 'Marketing' },
];

export default function Blog() {
  return (
    <>
      <SEOHead title="Blog" description="Insights, guides, and news about IT solutions, web development, and digital marketing in Saudi Arabia." />

      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Blog</span>
              <h1 className="h1 section-header__title">Insights & <span className="text-gradient">Updates</span></h1>
              <p className="section-header__desc">Expert insights on technology, digital marketing, and business growth in Saudi Arabia.</p>
            </div>
          </FadeInUp>

          <StaggerChildren className="services-overview__grid">
            {POSTS.map((post) => (
              <StaggerItem key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="badge" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>{post.category}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                  <p className="body-sm" style={{ flex: 1, marginBottom: '1rem' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {post.readTime}</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
