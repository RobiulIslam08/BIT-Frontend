// ============================================
// BIT SOFTWARE — Navbar Component
// ============================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleMobileMenu, closeMobileMenu } from '@/features/ui/uiSlice';
import { NAV_ITEMS, COMPANY } from '@/utils/constants';
import './Navbar.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(closeMobileMenu());
    setActiveDropdown(null);
  }, [location.pathname, dispatch]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: scrolled ? -32 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar__trust-bar">
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 8px var(--color-success)'
            }}
            className="animate-pulse"
          />
          <span>Currently serving 40+ clients</span>
        </div>
        <div className="navbar__main-wrapper">
          <div className="navbar__container container">
            {/* Logo */}
            <Link to="/" className="navbar__logo" aria-label="BIT Software Home">
              <div className="navbar__logo-icon">
                <span>B</span>
              </div>
              <div className="navbar__logo-text">
                <span className="navbar__logo-name">BIT Software</span>
                <span className="navbar__logo-tagline">& IT Solution</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="navbar__nav" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.key || item.path}
                  className="navbar__item"
                  onMouseEnter={() => item.children && setActiveDropdown(item.key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={`navbar__link ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'navbar__link--active' : ''}`}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={14} className="navbar__chevron" />}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && activeDropdown === item.key && (
                      <motion.div
                        className="navbar__dropdown"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`navbar__dropdown-link ${location.pathname === child.path ? 'navbar__dropdown-link--active' : ''}`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Section */}
            <div className="navbar__actions">
              <ThemeToggle />
              <a
                href={COMPANY.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm navbar__cta"
              >
                <Phone size={14} />
                Get a Quote
              </a>
              <button
                className="navbar__hamburger"
                onClick={() => dispatch(toggleMobileMenu())}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="navbar__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeMobileMenu())}
            />
            <motion.div
              className="navbar__mobile"
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="navbar__mobile-header">
                <Link to="/" className="navbar__logo" aria-label="BIT Software Home">
                  <div className="navbar__logo-icon">
                    <span>B</span>
                  </div>
                  <span className="navbar__logo-name">BIT Software</span>
                </Link>
                <button
                  onClick={() => dispatch(closeMobileMenu())}
                  aria-label="Close menu"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="navbar__mobile-nav">
                {NAV_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.key || item.path}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''}`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="navbar__mobile-sub">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="navbar__mobile-sublink"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="navbar__mobile-footer">
                <a
                  href={COMPANY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Phone size={18} />
                  Get a Quote
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
