// ============================================
// BIT SOFTWARE — My Account (Customer Dashboard)
// ============================================
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, User, Settings, RefreshCw, Loader2,
  AlertCircle, CheckCircle2, Clock, XCircle,
  Calendar, AlertTriangle, ShoppingBag, ExternalLink,
  Shield, LayoutDashboard,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated, selectIsAdmin } from '@/features/auth/authSlice';
import { getMyDomains } from '@/api/domainOrderApi';
import { useCurrency } from '@/context/CurrencyContext';
import './MyAccount.css';

const TABS = [
  { id: 'domains', label: 'My Domains', icon: Globe },
  { id: 'profile', label: 'Profile', icon: Settings },
];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  pending_payment: { label: 'Pending', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: Clock },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
};

const getDaysUntilExpiry = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const ExpiryBadge = ({ expiresAt }) => {
  const days = getDaysUntilExpiry(expiresAt);
  if (days === null) return null;
  if (days < 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>
      <XCircle size={11} /> Expired
    </span>
  );
  if (days <= 30) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
      <AlertTriangle size={11} /> Expires in {days}d
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>
      <CheckCircle2 size={11} /> {days}d remaining
    </span>
  );
};

export default function MyAccount() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectCurrentUser);
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState('domains');
  const [domains, setDomains] = useState([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [domainError, setDomainError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchDomains = async () => {
    setIsLoadingDomains(true);
    setDomainError('');
    try {
      const res = await getMyDomains();
      if (res.success) setDomains(res.data || []);
    } catch (err) {
      setDomainError(err?.response?.data?.message || 'Failed to load domains.');
    } finally {
      setIsLoadingDomains(false);
    }
  };

  useEffect(() => { fetchDomains(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <SEOHead title="My Account" description="Manage your domains and account settings." />

      <div className="myaccount">
        {/* ─── Sidebar ─── */}
        <aside className="myaccount__sidebar">
          <div className="myaccount__user-card">
            <div className="myaccount__avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="myaccount__user-name">{user?.name}</div>
              <div className="myaccount__user-email">{user?.email}</div>
            </div>
          </div>

          <nav className="myaccount__nav">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`myaccount__nav-item ${activeTab === id ? 'myaccount__nav-item--active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
            {/* Admin shortcut */}
            {isAdmin && (
              <Link to="/dashboard" className="myaccount__nav-item" style={{ marginTop: 'auto' }}>
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="myaccount__main">
          <AnimatePresence mode="wait">
            {/* ─── DOMAINS TAB ─── */}
            {activeTab === 'domains' && (
              <motion.div key="domains" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="myaccount__section-header">
                  <div>
                    <h2 className="h4">My Domains</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
                      Manage all your registered domains
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={fetchDomains} disabled={isLoadingDomains}>
                      <RefreshCw size={14} className={isLoadingDomains ? 'spin' : ''} /> Refresh
                    </button>
                    <Link to="/services/domain-hosting" className="btn btn-primary btn-sm">
                      <Globe size={14} /> Register Domain
                    </Link>
                  </div>
                </div>

                {/* Error */}
                {domainError && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {domainError}
                  </div>
                )}

                {/* Loading */}
                {isLoadingDomains ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                    <Loader2 size={32} className="spin" />
                    <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading your domains...</p>
                  </div>
                ) : domains.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-elevated"
                    style={{ textAlign: 'center', padding: '4rem 2rem' }}
                  >
                    <Globe size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                    <h3 className="h5" style={{ marginBottom: '0.5rem' }}>No Domains Yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                      Search and register your first domain to get started.
                    </p>
                    <Link to="/services/domain-hosting" className="btn btn-primary">
                      Search Domains
                    </Link>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {domains.map((domain, i) => {
                      const status = statusConfig[domain.orderStatus] || statusConfig.processing;
                      const StatusIcon = status.icon;
                      return (
                        <motion.div
                          key={domain._id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="card-elevated myaccount__domain-card"
                        >
                          <div className="myaccount__domain-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Globe size={20} style={{ color: 'var(--color-primary)' }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {domain.domainName}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: status.bg, color: status.color }}>
                                    <StatusIcon size={11} /> {status.label}
                                  </span>
                                  {domain.orderStatus === 'active' && <ExpiryBadge expiresAt={domain.expiresAt} />}
                                  {domain.whoisPrivacy && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                      <Shield size={11} /> WHOIS Private
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                                {formatPrice(domain.sellPriceUSD)}/yr
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                Order #{domain.orderId}
                              </div>
                            </div>
                          </div>

                          <div className="myaccount__domain-meta">
                            <div className="myaccount__domain-meta-item">
                              <Calendar size={13} />
                              <span>Registered: {formatDate(domain.registeredAt)}</span>
                            </div>
                            <div className="myaccount__domain-meta-item">
                              <Calendar size={13} />
                              <span>Expires: {formatDate(domain.expiresAt)}</span>
                            </div>
                            <div className="myaccount__domain-meta-item">
                              <Shield size={13} />
                              <span>WHOIS: {domain.whoisPrivacy ? 'Protected' : 'Public'}</span>
                            </div>
                          </div>

                          {/* Failure notice */}
                          {domain.orderStatus === 'failed' && domain.failureReason && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 'var(--text-xs)', color: '#dc2626' }}>
                              <strong>Registration Failed:</strong> {domain.failureReason}
                              {domain.paymentStatus === 'refunded' && (
                                <span style={{ marginLeft: '0.5rem', color: '#16a34a' }}>✅ Refund Issued</span>
                              )}
                            </div>
                          )}

                          {/* Expiry warning */}
                          {domain.orderStatus === 'active' && getDaysUntilExpiry(domain.expiresAt) <= 30 && getDaysUntilExpiry(domain.expiresAt) > 0 && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 'var(--text-xs)', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertTriangle size={13} />
                              Your domain expires soon. Please contact support to renew.
                              <a href="mailto:support@bitsoftwareitsolution.com" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                                Contact Support <ExternalLink size={11} style={{ display: 'inline' }} />
                              </a>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── PROFILE TAB ─── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="myaccount__section-header">
                  <div>
                    <h2 className="h4">Profile Settings</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>Manage your account information</p>
                  </div>
                </div>
                <div className="card-elevated">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { label: 'Full Name', value: user?.name || '—', icon: User },
                      { label: 'Email Address', value: user?.email || '—', icon: AlertCircle },
                      { label: 'Phone', value: user?.phone || 'Not set', icon: ShoppingBag },
                      { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—', icon: Calendar },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '10px', background: 'var(--color-bg-secondary)' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={17} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.15rem' }}>{label}</div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    💡 To update your profile information, please contact support at{' '}
                    <a href="mailto:support@bitsoftwareitsolution.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      support@bitsoftwareitsolution.com
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
