// ============================================
// BIT SOFTWARE — Services Overview (Outcome Tabs)
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Database, Smartphone, Code, TrendingUp, Search, MapPin, Share2, Palette, PenTool, Server, Cloud } from 'lucide-react';
import './Home.css';

const TABS = ['Build', 'Grow', 'Design', 'Manage'];

const SERVICES_TABS = {
  Build: [
    { title: 'Web Development', benefit: 'High-performance web apps built with speed and security.', icon: Globe, path: '/services/web-development' },
    { title: 'ERP & POS Systems', benefit: 'ZATCA-compliant ERP systems designed to streamline retail operations.', icon: Database, path: '/services/erp-software' },
    { title: 'Mobile Applications', benefit: 'Premium iOS & Android apps designed for the Saudi audience.', icon: Smartphone, path: '/services/mobile-apps' },
    { title: 'Custom Software', benefit: 'Tailor-made enterprise software solutions built for unique needs.', icon: Code, path: '/services/it-services' }
  ],
  Grow: [
    { title: 'Online Marketing', benefit: 'Targeted campaigns that maximize your ROI and customer acquisition.', icon: TrendingUp, path: '/services/online-marketing' },
    { title: 'Search Optimization', benefit: 'Rank #1 on local Saudi search results with our SEO strategies.', icon: Search, path: '/services/online-marketing' },
    { title: 'Google My Business', benefit: 'Optimize maps visibility to drive foot traffic to your retail stores.', icon: MapPin, path: '/services/google-my-business' },
    { title: 'Social Media Management', benefit: 'Engage your audience across Snapchat, TikTok, WhatsApp & Instagram.', icon: Share2, path: '/services/social-media' }
  ],
  Design: [
    { title: 'Logo Creation', benefit: 'Memorable brand identity design tailored to Saudi cultural values.', icon: Palette, path: '/services/logo-design' },
    { title: 'Graphics & Visuals', benefit: 'Stunning print and digital visual designs that stand out.', icon: PenTool, path: '/services/graphics-design' }
  ],
  Manage: [
    { title: 'IT Infrastructure', benefit: 'End-to-end network management, support, and consulting.', icon: Server, path: '/services/it-management' },
    { title: 'Secure Hosting & Domains', benefit: 'High-speed local hosting and registration with 99.9% uptime.', icon: Cloud, path: '/services/domain-hosting' }
  ]
};

export default function ServicesOverview() {
  const [activeTab, setActiveTab] = useState('Build');

  return (
    <section className="services-overview section">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle">Our Capabilities</div>
          <h2 className="h2 section-header__title">Outcome-Driven Solutions</h2>
          <p className="section-header__desc">
            We don't just write code; we deliver specific business outcomes to help your company grow and succeed.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="services-overview__tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`services-overview__tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid Container with Cross-Fade */}
        <div className="services-overview__grid-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="services-overview__grid"
            >
              {SERVICES_TABS[activeTab].map((service) => {
                const IconComponent = service.icon;
                return (
                  <Link
                    to={service.path}
                    key={service.title}
                    className="service-card-premium"
                  >
                    <div className="service-card-premium__icon-wrapper">
                      <IconComponent size={24} className="service-card-premium__icon" />
                    </div>
                    <h3 className="h4 service-card-premium__title">{service.title}</h3>
                    <p className="service-card-premium__benefit">{service.benefit}</p>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
