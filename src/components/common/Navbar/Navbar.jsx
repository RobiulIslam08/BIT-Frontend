// ============================================
// BIT SOFTWARE — Navbar Component
// ============================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, Phone, Mail, Globe, AtSign, Users, MessageCircle } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleMobileMenu, closeMobileMenu } from '@/features/ui/uiSlice';
import { NAV_ITEMS, COMPANY, SOCIALS } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/config/env';
import { CurrencySelector } from '../CurrencySelector';
import './Navbar.css';

export function Navbar() {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpandedItems, setMobileExpandedItems] = useState({});
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);

  const toggleMobileItem = (key) => {
    setMobileExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
    setMobileExpandedItems({});
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
          <div className="container navbar__trust-container">
            <div className="navbar__trust-left">
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
            <div className="navbar__trust-right">
              <a href={`mailto:${COMPANY.email}`} className="navbar__trust-link">
                <Mail size={12} />
                <span>{COMPANY.email}</span>
              </a>
              <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="navbar__trust-link">
                <Phone size={12} />
                <span>{COMPANY.phone}</span>
              </a>
              <div className="navbar__trust-socials">
                <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" className="navbar__trust-social-icon" aria-label="Facebook">
                  <Globe size={12} />
                </a>
                <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" className="navbar__trust-social-icon" aria-label="Instagram">
                  <AtSign size={12} />
                </a>
                <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" className="navbar__trust-social-icon" aria-label="Linkedin">
                  <Users size={12} />
                </a>
                <a href={SOCIALS.twitter} target="_blank" rel="noopener noreferrer" className="navbar__trust-social-icon" aria-label="Twitter">
                  <MessageCircle size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="navbar__main-wrapper">
          <div className="navbar__container container">
            {/* Logo */}
            <Link to="/" className="navbar__logo" aria-label="BIT Software Home">
              <img src="/bit-logo.png" alt="BIT Software Logo" style={{ height: '60px', width: 'auto' }} />
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
            <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CurrencySelector />
              <ThemeToggle />

              {/* Authentication Buttons (Desktop) */}
              <div className="navbar__auth-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isAuthenticated ? (
                  <div 
                    className="navbar__user-menu"
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setActiveDropdown('user-menu')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.625rem', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 0
                      }}
                      onClick={() => setActiveDropdown(activeDropdown === 'user-menu' ? null : 'user-menu')}
                    >
                      {user?.profileImage ? (
                        <img 
                          src={getImageUrl(user.profileImage)} 
                          alt={user.name} 
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid var(--color-primary-border)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                          }} 
                        />
                      ) : (
                        <div 
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--color-primary-muted)',
                            border: '1px solid var(--color-primary-border)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="body-xs" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {user?.name || 'User'}
                      </span>
                      <ChevronDown size={14} className="navbar__chevron" style={{
                        transform: activeDropdown === 'user-menu' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === 'user-menu' && (
                        <motion.div
                          className="navbar__dropdown"
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          style={{
                            right: 0,
                            left: 'auto',
                            minWidth: '220px',
                            padding: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-primary-border)', marginBottom: '0.25rem' }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{user?.name}</p>
                            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                          </div>
                          
                          <Link to="/my-account" className="navbar__dropdown-link" onClick={() => setActiveDropdown(null)}>
                            My Account
                          </Link>

                          {isAdmin && (
                            <Link to="/dashboard" className="navbar__dropdown-link" onClick={() => setActiveDropdown(null)}>
                              Admin Dashboard
                            </Link>
                          )}
                          
                          <button 
                            onClick={() => {
                              setActiveDropdown(null);
                              logout();
                            }} 
                            className="navbar__dropdown-link"
                            style={{ 
                              width: '100%', 
                              textAlign: 'left', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              color: 'var(--color-danger)'
                            }}
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link to="/auth/login" className="btn btn-ghost btn-sm">
                      Sign In
                    </Link>
                    <Link to="/auth/register" className="btn btn-primary btn-sm">
                      Register
                    </Link>
                  </>
                )}
              </div>
           
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
                  <img src="/bit-logo.png" alt="BIT Software Logo" style={{ height: '36px', width: 'auto' }} />
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
                {NAV_ITEMS.map((item, index) => {
                  const hasChildren = !!item.children;
                  const isExpanded = !!mobileExpandedItems[item.key];
                  return (
                    <motion.div
                      key={item.key || item.path}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {hasChildren ? (
                        <button
                          onClick={() => toggleMobileItem(item.key)}
                          className={`navbar__mobile-link ${
                            location.pathname.startsWith(item.path) ? 'navbar__mobile-link--active' : ''
                          }`}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform var(--transition-fast)',
                            }}
                          />
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''}`}
                        >
                          {item.label}
                        </Link>
                      )}

                      <AnimatePresence initial={false}>
                        {hasChildren && isExpanded && (
                          <motion.div
                            className="navbar__mobile-sub"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`navbar__mobile-sublink ${location.pathname === child.path ? 'navbar__mobile-sublink--active' : ''}`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="navbar__mobile-footer">
                <div className="navbar__mobile-auth" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {isAuthenticated ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
                        {user?.profileImage ? (
                          <img 
                            src={getImageUrl(user.profileImage)} 
                            alt={user.name} 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--color-primary-border)',
                            }} 
                          />
                        ) : (
                          <div 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'var(--color-primary-muted)',
                              border: '1px solid var(--color-primary-border)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700
                            }}
                          >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {user?.name || 'User'}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => dispatch(closeMobileMenu())}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={logout} className="btn btn-outline-cyan btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth/login" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                        Sign In
                      </Link>
                      <Link to="/auth/register" className="btn btn-outline-cyan btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                        Register
                      </Link>
                    </>
                  )}
                </div>
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
