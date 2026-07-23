// ============================================
// BIT SOFTWARE — AccountLayout (Customer Dashboard Shell)
// Own sidebar + top bar — not the marketing homepage Navbar.
// ============================================

import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Globe, Server, Wallet, CreditCard, LayoutDashboard,
  LogOut, Menu, X, Home, ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAppDispatch } from '@/app/hooks';
import { logout, selectCurrentUser, selectIsAdmin } from '@/features/auth/authSlice';
import { trackEvent } from '@/utils/analytics';
import './AccountLayout.css';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User, to: '/my-account' },
  { id: 'domains', label: 'My Domains', icon: Globe, to: '/my-account?tab=domains' },
  { id: 'hosting', label: 'My Hosting', icon: Server, to: '/my-account?tab=hosting' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, to: '/my-account?tab=wallet' },
  { id: 'billing', label: 'Billing', icon: CreditCard, to: '/my-account?tab=billing' },
];

const PAGE_TITLES = {
  profile: 'Profile',
  domains: 'My Domains',
  hosting: 'My Hosting',
  wallet: 'Wallet',
  billing: 'Billing',
};

function resolveActiveSection(pathname, searchParams) {
  if (pathname.startsWith('/my-account/domains')) return 'domains';
  if (pathname.startsWith('/my-account/hosting')) return 'hosting';
  if (pathname.startsWith('/my-account/profile')) return 'profile';
  if (pathname === '/my-account' || pathname === '/my-account/') {
    const tab = searchParams.get('tab');
    if (tab && NAV_ITEMS.some((n) => n.id === tab)) return tab;
    return 'profile';
  }
  return 'profile';
}

function resolvePageTitle(pathname, section) {
  if (pathname.includes('/profile/edit')) return 'Edit Profile';
  if (/\/my-account\/domains\/[^/]+/.test(pathname)) return 'Domain Details';
  if (/\/my-account\/hosting\/[^/]+/.test(pathname)) return 'Hosting Details';
  return PAGE_TITLES[section] || 'My Account';
}

export function AccountLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);

  const activeSection = useMemo(
    () => resolveActiveSection(location.pathname, searchParams),
    [location.pathname, searchParams],
  );

  const pageTitle = resolvePageTitle(location.pathname, activeSection);
  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    trackEvent('logout', { source: 'account' });
    navigate('/auth/login');
  };

  const closeMobile = () => setIsMobileOpen(false);

  const renderNav = (onNavigate) => (
    <nav className="account__nav" aria-label="Account navigation">
      {NAV_ITEMS.map(({ id, label, icon: Icon, to }) => (
        <Link
          key={id}
          to={to}
          className={`account__nav-link ${activeSection === id ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <Icon size={18} />
          <span>{label}</span>
          {activeSection === id && <ChevronRight size={14} className="account__nav-chevron" />}
        </Link>
      ))}

      {isAdmin && (
        <Link to="/dashboard" className="account__nav-link account__nav-link--admin" onClick={onNavigate}>
          <LayoutDashboard size={18} />
          <span>Admin Dashboard</span>
        </Link>
      )}
    </nav>
  );

  const sidebarBody = (
    <>
      <div className="account__brand">
        <Link to="/" className="account__logo" onClick={closeMobile}>
          <img src="/bit-logo.png" alt="BIT Software" />
        </Link>
        <div className="account__brand-meta">
          <span className="account__brand-eyebrow">Customer</span>
          <span className="account__brand-title">My Account</span>
        </div>
      </div>

      <div className="account__user">
        <div className="account__avatar" aria-hidden="true">{initials}</div>
        <div className="account__user-text">
          <div className="account__user-name">{user?.name || 'User'}</div>
          <div className="account__user-email">{user?.email || ''}</div>
          {user?.userCode && (
            <div className="account__user-id">ID {user.userCode}</div>
          )}
        </div>
      </div>

      {renderNav(closeMobile)}

      <div className="account__sidebar-footer">
        <Link to="/" className="account__nav-link" onClick={closeMobile}>
          <Home size={18} />
          <span>Back to Website</span>
        </Link>
        <button type="button" className="account__nav-link account__nav-link--danger" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="account">
      {/* Desktop sidebar */}
      <aside className="account__sidebar" aria-label="Account sidebar">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="account__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.aside
              className="account__mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              aria-label="Account menu"
            >
              <div className="account__mobile-head">
                <Link to="/" className="account__logo account__logo--sm" onClick={closeMobile}>
                  <img src="/bit-logo.png" alt="BIT Software" />
                </Link>
                <button type="button" className="account__icon-btn" onClick={closeMobile} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              {sidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="account__main">
        <header className="account__topbar">
          <div className="account__topbar-left">
            <button
              type="button"
              className="account__icon-btn account__menu-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="account__topbar-title-wrap">
              <h1 className="account__topbar-title">{pageTitle}</h1>
              <p className="account__topbar-sub">Manage your BIT services</p>
            </div>
          </div>

          <div className="account__topbar-right">
            <ThemeToggle />
            <div className="account__topbar-user" title={user?.email || ''}>
              <div className="account__avatar account__avatar--sm">{initials}</div>
              <span className="account__topbar-user-name">{user?.name || 'Account'}</span>
            </div>
          </div>
        </header>

        <div className="account__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
