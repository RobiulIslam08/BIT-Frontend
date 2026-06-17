// BIT SOFTWARE — Services Hub Page
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Database, Smartphone, Share2, Palette, PenTool, Server, TrendingUp, MapPin, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { SERVICES } from '@/utils/constants';

const ICON_MAP = { Globe, Database, Smartphone, Share2, Palette, PenTool, Server, TrendingUp, MapPin, HardDrive };

export default function Services() {
  return (
    <>
      <SEOHead title="Our Services" description="Explore our full range of IT services — web development, ERP, mobile apps, marketing, and more." />
      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Our Services</span>
              <h1 className="h1 section-header__title">Comprehensive IT <span className="text-gradient">Solutions</span></h1>
              <p className="section-header__desc">From concept to launch, we provide end-to-end digital solutions for Saudi businesses.</p>
            </div>
          </FadeInUp>
          <StaggerChildren className="services-overview__grid">
            {SERVICES.map((s) => {
              const Icon = ICON_MAP[s.icon] || Globe;
              return (
                <StaggerItem key={s.id}>
                  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                    <Link to={s.path} className="service-card">
                      <div className="service-card__icon"><Icon size={24} /></div>
                      <h3 className="service-card__title">{s.title}</h3>
                      <p className="service-card__desc">{s.description}</p>
                      <span className="service-card__cta">Learn More <ArrowRight size={14} /></span>
                    </Link>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>
    </>
  );
}
