// ============================================
// BIT SOFTWARE — Featured Work / Portfolio Grid
// ============================================

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './Home.css';

const PROJECTS = [
  {
    title: 'E-Commerce App for Nadec',
    result: '+42% Mobile Conversion Rate Increase',
    desc: 'Bespoke React Native storefront integrated with localized payment gateways and lightning-fast state caching.',
    img: '/project1.png',
    link: '/portfolio'
  },
  {
    title: 'Al-Safi ZATCA Phase-2 Billing',
    result: '1.8M+ ERP Invoices Processed with 0% Error',
    desc: 'High-throughput enterprise integration aligning legacy invoice databases directly with ZATCA Phase-2 clearance APIs.',
    img: '/project2.png',
    link: '/portfolio'
  },
  {
    title: 'Naqel Express Logistics Panel',
    result: '-28% Last-Mile Dispatch Latency Reduction',
    desc: 'Real-time vehicle routing and dispatch optimization dashboard using WebSockets and Leaflet mapping.',
    img: '/project3.png',
    link: '/portfolio'
  }
];

export default function FeaturedWork() {
  return (
    <section className="featured-work section">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle">Our Impact</div>
          <h2 className="h2 section-header__title">Featured Cases & Measurable Results</h2>
          <p className="section-header__desc">
            Explore our real-world success stories delivering measurable business growth for market leaders in Saudi Arabia.
          </p>
        </div>

        <div className="featured-work__grid">
          {PROJECTS.map((project) => (
            <div key={project.title} className="featured-card">
              <div className="featured-card__image-container">
                <img
                  src={project.img}
                  alt={project.title}
                  loading="lazy"
                  className="featured-card__image"
                />
              </div>
              <div className="featured-card__content">
                <div className="featured-card__result">
                  {project.result}
                </div>
                <h3 className="h4 featured-card__title">
                  {project.title}
                </h3>
                <p className="featured-card__desc">
                  {project.desc}
                </p>
                <Link to={project.link} className="featured-card__link">
                  <span>View Case Study</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
