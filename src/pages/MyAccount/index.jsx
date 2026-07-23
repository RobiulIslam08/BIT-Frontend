// ============================================
// BIT SOFTWARE — My Account (Customer Dashboard)
// ============================================
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, User, Settings, RefreshCw, Loader2,
  AlertCircle, CheckCircle2, Clock, XCircle,
  Calendar, AlertTriangle, ChevronRight,
  Shield, CreditCard, RotateCw, Server,
  Wallet, Pencil, Building2, Briefcase, Phone, PhoneCall,
  MapPin, Mail,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, selectIsAuthenticated, updateUser } from '@/features/auth/authSlice';
import { getMyDomains } from '@/api/domainsApi';
import { getMyHostings } from '@/api/hostingApi';
import { getMyProfile } from '@/api/userApi';
import { useCurrency } from '@/context/CurrencyContext';
import PaymentMethods from './PaymentMethods';
import WalletTab from './Wallet';
import './MyAccount.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: Settings },
  { id: 'domains', label: 'My Domains', icon: Globe },
  { id: 'hosting', label: 'My Hosting', icon: Server },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  transferred_out: { label: 'Transferred', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: XCircle },
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
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const { formatPrice } = useCurrency();

  const initialTab = TABS.some((t) => t.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [domains, setDomains] = useState([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [domainError, setDomainError] = useState('');
  const [hostings, setHostings] = useState([]);
  const [isLoadingHostings, setIsLoadingHostings] = useState(true);
  const [hostingError, setHostingError] = useState('');

  // Keep tab in sync with ?tab= query (default = profile)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const next = TABS.some((t) => t.id === tab) ? tab : 'profile';
    if (next !== activeTab) setActiveTab(next);
  }, [searchParams, activeTab]);

  const switchTab = (id) => {
    setActiveTab(id);
    const next = new URLSearchParams(searchParams);
    if (id === 'profile') next.delete('tab');
    else next.set('tab', id);
    navigate(
      { pathname: '/my-account', search: next.toString() ? `?${next.toString()}` : '' },
      { replace: true },
    );
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
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

  const fetchHostings = async () => {
    setIsLoadingHostings(true);
    setHostingError('');
    try {
      const res = await getMyHostings();
      if (res.success) setHostings(res.data || []);
    } catch (err) {
      setHostingError(err?.response?.data?.message || 'Failed to load hosting.');
    } finally {
      setIsLoadingHostings(false);
    }
  };

  useEffect(() => { fetchDomains(); fetchHostings(); }, []);

  // Hydrate the full profile (Namecheap-style fields + account balance) from the server.
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await getMyProfile();
        if (!ignore && res?.success && res.data) dispatch(updateUser(res.data));
      } catch {
        // Non-blocking: fall back to the persisted user in Redux.
      }
    })();
    return () => { ignore = true; };
  }, [dispatch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <SEOHead title="My Account" description="Manage your domains and account settings." />

      <div className="myaccount">
        <AnimatePresence mode="wait">
            {/* ─── PROFILE TAB (default) ─── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="myaccount__section-header">
                  <div>
                    <h2 className="h4">Profile</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>View your account information and balance</p>
                  </div>
                  <Link to="/my-account/profile/edit" className="btn btn-primary btn-sm">
                    <Pencil size={14} /> Edit Profile
                  </Link>
                </div>

                {/* ─── Balance cards (Account + Promotional Credit) ─── */}
                <div className="card-elevated myaccount__balance-summary">
                  <div className="myaccount__balance-summary__values">
                    <div className="myaccount__balance-summary__item">
                      <div className="myaccount__balance-summary__icon">
                        <Wallet size={24} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <div className="myaccount__balance-summary__label">Account Balance</div>
                        <div className="myaccount__balance-summary__value">
                          {user?.accountBalance != null ? formatPrice(user.accountBalance) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="myaccount__balance-summary__item">
                      <div>
                        <div className="myaccount__balance-summary__label">Promotional Credit</div>
                        <div className="myaccount__balance-summary__value myaccount__balance-summary__value--promo">
                          {user?.promotionalCredit != null ? formatPrice(user.promotionalCredit) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => switchTab('wallet')}
                  >
                    <Wallet size={14} /> Manage Wallet
                  </button>
                </div>

                {/* ─── Grouped profile info ─── */}
                {(() => {
                  const notSet = 'Not set';
                  const sections = [
                    {
                      title: 'Personal Information',
                      fields: [
                        { label: 'Customer ID', value: user?.userCode, icon: Shield },
                        { label: 'Full Name', value: user?.name, icon: User },
                        { label: 'First Name', value: user?.firstName, icon: User },
                        { label: 'Last Name', value: user?.lastName, icon: User },
                        { label: 'Organization', value: user?.organization, icon: Building2 },
                        { label: 'Job Title', value: user?.jobTitle, icon: Briefcase },
                        { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null, icon: Calendar },
                      ],
                    },
                    {
                      title: 'Contact Information',
                      fields: [
                        { label: 'Email Address', value: user?.email, icon: Mail },
                        { label: 'Phone', value: user?.phone, icon: Phone },
                        { label: 'Alternate Phone', value: user?.alternatePhone, icon: PhoneCall },
                      ],
                    },
                    {
                      title: 'Address',
                      fields: [
                        { label: 'Address Line 1', value: user?.address1, icon: MapPin },
                        { label: 'Address Line 2', value: user?.address2, icon: MapPin },
                        { label: 'City', value: user?.city, icon: MapPin },
                        { label: 'State / Province', value: user?.stateProvince, icon: MapPin },
                        { label: 'Zip / Postal Code', value: user?.postalCode, icon: MapPin },
                        { label: 'Country', value: user?.country, icon: Globe },
                      ],
                    },
                  ];
                  return sections.map((section) => (
                    <div key={section.title} className="card-elevated" style={{ marginBottom: '1.25rem' }}>
                      <h3 className="h5" style={{ marginBottom: '1rem' }}>{section.title}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                        {section.fields.map(({ label, value, icon: Icon }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', borderRadius: '10px', background: 'var(--color-bg-secondary)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.15rem' }}>{label}</div>
                              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: value ? undefined : 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {value || notSet}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </motion.div>
            )}

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
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={fetchDomains} disabled={isLoadingDomains}>
                      <RefreshCw size={14} className={isLoadingDomains ? 'spin' : ''} /> Refresh
                    </button>
                    <Link to="/services/domain-hosting" className="btn btn-primary btn-sm">
                      <Globe size={14} /> Register Domain
                    </Link>
                  </div>
                </div>

                {domainError && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {domainError}
                  </div>
                )}

                {isLoadingDomains ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                    <Loader2 size={32} className="spin" />
                    <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading your domains...</p>
                  </div>
                ) : domains.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-elevated" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Globe size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                    <h3 className="h5" style={{ marginBottom: '0.5rem' }}>No Domains Yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                      Search and register your first domain to get started.
                    </p>
                    <Link to="/services/domain-hosting" className="btn btn-primary">Search Domains</Link>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {domains.map((domain, i) => {
                      const status = statusConfig[domain.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const daysLeft = getDaysUntilExpiry(domain.expiresAt);
                      return (
                        <motion.div
                          key={domain._id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="card-elevated myaccount__domain-card"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/my-account/domains/${domain._id}`)}
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
                                  {domain.status === 'active' && <ExpiryBadge expiresAt={domain.expiresAt} />}
                                  {domain.autoRenew && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                                      <RotateCw size={11} /> Auto-Renew
                                    </span>
                                  )}
                                  {domain.whoisPrivacy && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                      <Shield size={11} /> WHOIS Private
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {typeof domain.renewPriceUSD === 'number' && domain.renewPriceUSD > 0 && (
                                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                                  {formatPrice(domain.renewPriceUSD)}/yr
                                </div>
                              )}
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginTop: '0.3rem', fontWeight: 600 }}>
                                Details <ChevronRight size={13} />
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

                          {domain.status === 'active' && daysLeft !== null && daysLeft <= 30 && daysLeft >= 0 && !domain.autoRenew && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 'var(--text-xs)', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertTriangle size={13} />
                              This domain expires soon. Open details to renew or enable auto-renew.
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── HOSTING TAB ─── */}
            {activeTab === 'hosting' && (
              <motion.div key="hosting" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="myaccount__section-header">
                  <div>
                    <h2 className="h4">My Hosting</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
                      View and manage your hosting plans
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={fetchHostings} disabled={isLoadingHostings}>
                      <RefreshCw size={14} className={isLoadingHostings ? 'spin' : ''} /> Refresh
                    </button>
                    <Link to="/services/domain-hosting" className="btn btn-primary btn-sm">
                      <Server size={14} /> Get Hosting
                    </Link>
                  </div>
                </div>

                {hostingError && (
                  <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {hostingError}
                  </div>
                )}

                {isLoadingHostings ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                    <Loader2 size={32} className="spin" />
                    <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading your hosting...</p>
                  </div>
                ) : hostings.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-elevated" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Server size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                    <h3 className="h5" style={{ marginBottom: '0.5rem' }}>No Hosting Yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                      Choose a hosting plan for your website to get started.
                    </p>
                    <Link to="/services/domain-hosting" className="btn btn-primary">Browse Hosting Plans</Link>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {hostings.map((item, i) => {
                      const status = statusConfig[item.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="card-elevated myaccount__domain-card"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/my-account/hosting/${item._id}`)}
                        >
                          <div className="myaccount__domain-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Server size={20} style={{ color: 'var(--color-primary)' }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.planName}
                                  <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginLeft: '0.4rem', textTransform: 'capitalize' }}>
                                    ({item.planType})
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: status.bg, color: status.color }}>
                                    <StatusIcon size={11} /> {status.label}
                                  </span>
                                  {item.status === 'active' && <ExpiryBadge expiresAt={item.expiresAt} />}
                                  {item.websiteLabel && (
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                      {item.websiteLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {typeof item.amountUSD === 'number' && item.amountUSD > 0 && (
                                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                                  {formatPrice(item.amountUSD)}
                                </div>
                              )}
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginTop: '0.3rem', fontWeight: 600 }}>
                                Details <ChevronRight size={13} />
                              </div>
                            </div>
                          </div>

                          <div className="myaccount__domain-meta">
                            <div className="myaccount__domain-meta-item">
                              <Calendar size={13} />
                              <span>Started: {formatDate(item.startsAt)}</span>
                            </div>
                            <div className="myaccount__domain-meta-item">
                              <Calendar size={13} />
                              <span>Expires: {formatDate(item.expiresAt)}</span>
                            </div>
                            <div className="myaccount__domain-meta-item">
                              <Server size={13} />
                              <span style={{ textTransform: 'capitalize' }}>{item.billingCycle} billing</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── WALLET TAB ─── */}
            {activeTab === 'wallet' && <WalletTab key="wallet" />}

            {/* ─── BILLING TAB ─── */}
            {activeTab === 'billing' && <PaymentMethods key="billing" />}

          </AnimatePresence>
      </div>
    </>
  );
}
