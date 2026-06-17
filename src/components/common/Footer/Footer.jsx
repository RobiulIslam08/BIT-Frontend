// BIT SOFTWARE — Footer Component
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, ExternalLink, Globe, MessageCircle, Users, Play, AtSign } from 'lucide-react';
import { FadeInUp } from '../../animations/FadeInUp';
import { COMPANY, SOCIALS, SERVICES } from '@/utils/constants';
import './Footer.css';

const SOCIAL_ICONS = [
  { Icon: Globe, link: SOCIALS.facebook, label: 'Facebook' },
  { Icon: AtSign, link: SOCIALS.instagram, label: 'Instagram' },
  { Icon: Users, link: SOCIALS.linkedin, label: 'LinkedIn' },
  { Icon: MessageCircle, link: SOCIALS.twitter, label: 'Twitter' },
  { Icon: Play, link: SOCIALS.youtube, label: 'YouTube' },
];

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <footer className="footer">
      {!isHomePage && (
        <div className="footer__cta">
          <div className="container">
            <FadeInUp>
              <div className="footer__cta-inner">
                <div className="footer__cta-content">
                  <h3 className="h3">Ready to Start Your Project?</h3>
                  <p className="body-base" style={{ color: 'var(--color-text-muted)' }}>Let's discuss how we can help transform your business.</p>
                </div>
                <div className="footer__cta-actions">
                  <Link to="/contact" className="btn btn-primary btn-lg">Get Started</Link>
                  <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg"><Phone size={18} /> WhatsApp Us</a>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      )}

      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__col footer__col--brand">
              <Link to="/" className="footer__logo">
                <div className="footer__logo-icon"><span>B</span></div>
                <div><div className="footer__logo-name">BIT Software</div><div className="footer__logo-tagline">& IT Solution</div></div>
              </Link>
              <p className="footer__desc body-sm">Delivering world-class IT solutions to businesses across Saudi Arabia and beyond.</p>
              <div className="footer__socials">
                {SOCIAL_ICONS.map(({ Icon, link, label }) => (
                  <motion.a key={label} href={link} target="_blank" rel="noopener noreferrer" className="footer__social-icon" aria-label={label} whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }}>
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Our Services</h4>
              <ul className="footer__links">
                {SERVICES.slice(0, 6).map((s) => (<li key={s.id}><Link to={s.path} className="footer__link">{s.title}</Link></li>))}
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__links">
                {QUICK_LINKS.map((l) => (<li key={l.path}><Link to={l.path} className="footer__link">{l.label}</Link></li>))}
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Contact Us</h4>
              <div className="footer__contact-list">
                <a href={`tel:${COMPANY.phone}`} className="footer__contact-item"><Phone size={16} /><span>{COMPANY.phone}</span></a>
                <a href={`mailto:${COMPANY.email}`} className="footer__contact-item"><Mail size={16} /><span>{COMPANY.email}</span></a>
                <div className="footer__contact-item"><MapPin size={16} /><span>{COMPANY.address}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p>&copy; {currentYear} {COMPANY.name}. All rights reserved.</p>
            <div className="footer__bottom-links"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
