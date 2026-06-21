// ============================================
// BIT SOFTWARE — Blog Page (Premium Redesign)
// ============================================

import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';

const POSTS = [
  { slug: 'web-development-saudi-2025', title: 'Web Development Trends in Saudi Arabia 2025', excerpt: 'Discover the latest web development trends shaping the Saudi digital landscape and how businesses can leverage them.', date: 'Dec 15, 2025', readTime: '5 min', category: 'Web Development' },
  { slug: 'zatca-compliance-erp', title: 'ZATCA Compliance: What Your ERP System Needs', excerpt: 'Everything you need to know about making your ERP system ZATCA compliant for seamless e-invoicing in Saudi Arabia.', date: 'Dec 10, 2025', readTime: '8 min', category: 'ERP' },
  { slug: 'mobile-apps-saudi-market', title: 'Building Mobile Apps for the Saudi Market', excerpt: 'Key considerations when developing mobile apps targeting Saudi Arabia users, including RTL, payments, and UX.', date: 'Dec 5, 2025', readTime: '6 min', category: 'Mobile' },
  { slug: 'seo-arabic-websites', title: 'SEO Best Practices for Arabic Websites', excerpt: 'How to optimize your Arabic website for Google search in Saudi Arabia and dominate local search results.', date: 'Nov 28, 2025', readTime: '7 min', category: 'Marketing' },
  { slug: 'ecommerce-mada-integration', title: 'Mada Payment Integration Guide', excerpt: 'Step-by-step guide to integrating Mada and Apple Pay payments into your Saudi e-commerce platform.', date: 'Nov 20, 2025', readTime: '10 min', category: 'E-commerce' },
  { slug: 'google-my-business-saudi', title: 'Google My Business Optimization Tips', excerpt: 'Maximize your local search visibility with these proven GMB optimization strategies for Saudi businesses.', date: 'Nov 15, 2025', readTime: '5 min', category: 'Marketing' },
];

export default function Blog() {
  return (
    <>
      <SEOHead title="Blog" description="Insights, guides, and news about IT solutions, web development, and digital marketing in Saudi Arabia." />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">Blog</span>
              <h1 className="h1 page-hero__title">Insights & <span className="text-gradient">Updates</span></h1>
              <p className="page-hero__desc">Expert insights on technology, digital marketing, and business growth strategies for the Saudi market.</p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section">
        <div className="container">
          <StaggerChildren className="services-overview__grid">
            {POSTS.map((post) => (
              <StaggerItem key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="blog-card">
                  <div className="badge" style={{ marginBottom: '1.25rem' }}>{post.category}</div>
                  <h3 className="blog-card__title">{post.title}</h3>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <div className="blog-card__meta">
                    <span className="blog-card__meta-item"><Calendar size={13} /> {post.date}</span>
                    <span className="blog-card__meta-item"><Clock size={13} /> {post.readTime}</span>
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
