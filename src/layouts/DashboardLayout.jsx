// ============================================
// BIT SOFTWARE — DashboardLayout
// ============================================

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, Tag, Users, FileText,
  ShoppingCart, Settings, BarChart3, LogOut,
  Menu, X, ChevronRight, Globe, Server
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import './DashboardLayout.css';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Services', path: '/dashboard/services', icon: Package },
  { label: 'Offers', path: '/dashboard/offers', icon: Tag },
  { label: 'Leads', path: '/dashboard/leads', icon: FileText },
  { label: 'GMB Orders', path: '/dashboard/orders', icon: ShoppingCart },
  { label: 'Domain Orders', path: '/dashboard/domain-orders', icon: Globe },
  { label: 'Domains', path: '/dashboard/domains', icon: Server },
  { label: 'Domain Pricing', path: '/dashboard/domain-pricing', icon: Tag },
  { label: 'Hosting Orders', path: '/dashboard/hosting-orders', icon: ShoppingCart },
  { label: 'Hostings', path: '/dashboard/hostings', icon: Server },
  { label: 'Hosting Plans', path: '/dashboard/hosting-plans', icon: Tag },
  { label: 'Users', path: '/dashboard/users', icon: Users },
  { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard">
      {/* Desktop Sidebar */}
      <aside className={`dashboard__sidebar ${isSidebarOpen ? '' : 'dashboard__sidebar--collapsed'}`}>
        <div className="dashboard__sidebar-header">
          <Link to="/" className="dashboard__logo" style={{ display: 'flex', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
            <img src="/bit-logo.png" alt="BIT Logo" style={{ height: '60px', width: 'auto' }} />
          </Link>
        </div>

        <nav className="dashboard__sidebar-nav">
          {SIDEBAR_ITEMS.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`dashboard__sidebar-link ${isActive(path) ? 'dashboard__sidebar-link--active' : ''}`}
              title={label}
            >
              <Icon size={20} />
              {isSidebarOpen && <span>{label}</span>}
              {isSidebarOpen && isActive(path) && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        <div className="dashboard__sidebar-footer">
          <button onClick={handleLogout} className="dashboard__sidebar-link" title="Logout">
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              className="dashboard__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              className="dashboard__mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="dashboard__sidebar-header">
                <Link to="/" className="dashboard__logo">
                  <img src="/bit-logo.png" alt="BIT Logo" style={{ height: '32px', width: 'auto' }} />
                </Link>
                <button onClick={() => setIsMobileSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <nav className="dashboard__sidebar-nav">
                {SIDEBAR_ITEMS.map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`dashboard__sidebar-link ${isActive(path) ? 'dashboard__sidebar-link--active' : ''}`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`dashboard__main ${isSidebarOpen ? '' : 'dashboard__main--expanded'}`}>
        <header className="dashboard__header">
          <div className="dashboard__header-left">
            <button
              className="dashboard__menu-btn"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileSidebarOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="dashboard__header-right">
            <ThemeToggle />
          </div>
        </header>
        <div className="dashboard__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
