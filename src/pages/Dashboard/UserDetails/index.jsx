// ============================================
// BIT SOFTWARE — Admin User Details
// ============================================
// Full profile for a single user: prominent copyable Customer ID, grouped
// profile fields, role/status controls, guarded delete, and the user's
// domains + hosting with renew prices, totals, and detail modals.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Trash2, Shield,
  User, Building2, Briefcase, Calendar, Mail, Phone, PhoneCall,
  MapPin, Globe, Server, RefreshCw, Eye, X,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { toast } from '@/components/common/Toast/Toast';
import {
  getUserById, updateUserRole, updateUserStatus, deleteUser,
} from '@/api/adminUsersApi';
import { getAllDomains } from '@/api/domainsApi';
import { getAllHostings } from '@/api/hostingApi';
import '../Domains/Domains.css';

const roleConfig = {
  admin: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  user: { label: 'Customer', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
};

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const domainStatusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  transferred_out: { label: 'Transferred', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
};

const hostingStatusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

function formatUSD(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

function sumRenew(items) {
  return (items || []).reduce((acc, item) => {
    const n = item?.renewPriceUSD;
    return acc + (typeof n === 'number' && !Number.isNaN(n) ? n : 0);
  }, 0);
}

function StatusBadge({ status, map }) {
  const s = map[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px',
      fontWeight: 700, background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function InfoGrid({ title, fields }) {
  const notSet = 'Not set';
  return (
    <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
      <h3 className="h5" style={{ marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {fields.map(({ label, value, icon: Icon }) => (
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
  );
}

function DomainDetailModal({ domain, onClose }) {
  const owner = domain.userId
    ? `${domain.userId.name || '—'}${domain.userId.email ? ` (${domain.userId.email})` : ''}`
    : '—';
  const ns = Array.isArray(domain.nameservers) && domain.nameservers.length
    ? domain.nameservers.join(', ')
    : '—';

  const rows = [
    { label: 'Domain', value: domain.domainName, bold: true },
    { label: 'Owner', value: owner },
    { label: 'Registrar', value: domain.registrar || '—' },
    { label: 'Managed by us', value: domain.managedByNamecheap ? 'Yes' : 'No' },
    { label: 'Status', value: <StatusBadge status={domain.status} map={domainStatusConfig} /> },
    { label: 'Source', value: domain.source === 'purchase' ? 'Purchased' : 'Admin Added' },
    { label: 'Registered', value: formatDate(domain.registeredAt) },
    { label: 'Expires', value: formatDate(domain.expiresAt) },
    { label: 'Registration years', value: domain.registrationYears ?? '—' },
    { label: 'Renew Price', value: formatUSD(domain.renewPriceUSD), highlight: true },
    { label: 'Auto-renew', value: domain.autoRenew ? 'ON' : 'OFF' },
    { label: 'Whois privacy', value: domain.whoisPrivacy ? 'Yes' : 'No' },
    { label: 'Nameservers', value: ns },
    { label: 'Notes', value: domain.notes || '—' },
  ];

  return (
    <div className="domains__modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="domains__modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>Domain Details</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{
          marginBottom: '1.15rem', padding: '0.85rem 1rem', borderRadius: 10,
          background: 'rgba(var(--color-primary-rgb), 0.08)', border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Renew Price</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginTop: 2 }}>
            {formatUSD(domain.renewPriceUSD)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
          {rows.map(({ label, value, bold, highlight }) => (
            <div key={label} style={{ display: 'flex', gap: '0.5rem', alignItems: typeof value === 'string' || typeof value === 'number' ? 'flex-start' : 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', minWidth: 140, flexShrink: 0 }}>{label}:</span>
              <span style={{
                fontWeight: bold || highlight ? 700 : 500,
                color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
                wordBreak: 'break-word',
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

function HostingDetailModal({ hosting, onClose }) {
  const owner = hosting.userId
    ? `${hosting.userId.name || '—'}${hosting.userId.email ? ` (${hosting.userId.email})` : ''}`
    : '—';
  const features = Array.isArray(hosting.features) && hosting.features.length
    ? hosting.features.join(', ')
    : '—';
  const hasPassword = Boolean(hosting.hasCpanelPassword || hosting.hasCpanelAccess || hosting.cpanelPassword);
  const cpanelPasswordLabel = hosting.cpanelPassword
    ? hosting.cpanelPassword
    : (hasPassword ? 'Set (hidden)' : 'Not set');

  const rows = [
    { label: 'Plan', value: hosting.planName || '—', bold: true },
    { label: 'Plan slug', value: hosting.planSlug || '—' },
    { label: 'Website', value: hosting.websiteLabel || '—' },
    { label: 'Owner', value: owner },
    { label: 'Type', value: hosting.planType || '—' },
    { label: 'Billing cycle', value: hosting.billingCycle || '—' },
    { label: 'Status', value: <StatusBadge status={hosting.status} map={hostingStatusConfig} /> },
    { label: 'Source', value: hosting.source === 'purchase' ? 'Purchased' : 'Admin Added' },
    { label: 'Starts', value: formatDate(hosting.startsAt) },
    { label: 'Expires', value: formatDate(hosting.expiresAt) },
    { label: 'Amount paid', value: formatUSD(hosting.amountUSD) },
    { label: 'Renew Price', value: formatUSD(hosting.renewPriceUSD), highlight: true },
    { label: 'Features', value: features },
    { label: 'cPanel URL', value: hosting.cpanelUrl || '—' },
    { label: 'cPanel username', value: hosting.cpanelUsername || '—' },
    { label: 'cPanel domain', value: hosting.cpanelDomain || '—' },
    { label: 'cPanel password', value: cpanelPasswordLabel },
    { label: 'Internal provider', value: hosting.internalProvider || '—' },
    { label: 'Internal note', value: hosting.internalServerNote || '—' },
    { label: 'Project file', value: hosting.projectFile?.originalName || '—' },
    { label: 'Notes', value: hosting.notes || '—' },
  ];

  return (
    <div className="domains__modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="domains__modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="h5" style={{ margin: 0 }}>Hosting Details</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
          <div style={{
            padding: '0.85rem 1rem', borderRadius: 10,
            background: 'rgba(var(--color-primary-rgb), 0.08)', border: '1px solid rgba(var(--color-primary-rgb), 0.25)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Renew Price</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginTop: 2 }}>
              {formatUSD(hosting.renewPriceUSD)}
            </div>
          </div>
          <div style={{
            padding: '0.85rem 1rem', borderRadius: 10,
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount Paid</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginTop: 2 }}>
              {formatUSD(hosting.amountUSD)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
          {rows.map(({ label, value, bold, highlight }) => (
            <div key={label} style={{ display: 'flex', gap: '0.5rem', alignItems: typeof value === 'string' || typeof value === 'number' ? 'flex-start' : 'center' }}>
              <span style={{ color: 'var(--color-text-muted)', minWidth: 140, flexShrink: 0 }}>{label}:</span>
              <span style={{
                fontWeight: bold || highlight ? 700 : 500,
                color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
                wordBreak: 'break-word',
                textTransform: ['Type', 'Billing cycle'].includes(label) ? 'capitalize' : undefined,
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

const emptyMeta = { total: 0, totalRenewPriceUSD: undefined };

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [domains, setDomains] = useState([]);
  const [hostings, setHostings] = useState([]);
  const [domainsMeta, setDomainsMeta] = useState(emptyMeta);
  const [hostingsMeta, setHostingsMeta] = useState(emptyMeta);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [detailDomain, setDetailDomain] = useState(null);
  const [detailHosting, setDetailHosting] = useState(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getUserById(id);
      if (res.success) setUser(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load user.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [dRes, hRes] = await Promise.all([
        getAllDomains({ userId: id, limit: 100 }),
        getAllHostings({ userId: id, limit: 100 }),
      ]);
      if (dRes.success) {
        setDomains(dRes.data || []);
        setDomainsMeta(dRes.meta || emptyMeta);
      }
      if (hRes.success) {
        setHostings(hRes.data || []);
        setHostingsMeta(hRes.meta || emptyMeta);
      }
    } catch {
      // Non-blocking: the profile still renders without assets.
    } finally {
      setAssetsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); fetchAssets(); }, [fetchUser, fetchAssets]);

  const domainCount = typeof domainsMeta.total === 'number' ? domainsMeta.total : domains.length;
  const hostingCount = typeof hostingsMeta.total === 'number' ? hostingsMeta.total : hostings.length;

  const domainRenewTotal = useMemo(() => (
    typeof domainsMeta.totalRenewPriceUSD === 'number'
      ? domainsMeta.totalRenewPriceUSD
      : sumRenew(domains)
  ), [domainsMeta.totalRenewPriceUSD, domains]);

  const hostingRenewTotal = useMemo(() => (
    typeof hostingsMeta.totalRenewPriceUSD === 'number'
      ? hostingsMeta.totalRenewPriceUSD
      : sumRenew(hostings)
  ), [hostingsMeta.totalRenewPriceUSD, hostings]);

  const combinedRenewTotal = domainRenewTotal + hostingRenewTotal;

  const handleCopy = async () => {
    if (!user?.userCode) return;
    try {
      await navigator.clipboard.writeText(user.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const handleRoleChange = async (role) => {
    if (role === user.role) return;
    setSavingRole(true);
    try {
      const res = await updateUserRole(id, role);
      if (res.success) {
        setUser((u) => ({ ...u, role }));
        toast.success(`Role updated to ${roleConfig[role]?.label || role}.`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleStatusToggle = async () => {
    const next = user.status === 'active' ? 'blocked' : 'active';
    setSavingStatus(true);
    try {
      const res = await updateUserStatus(id, next);
      if (res.success) {
        setUser((u) => ({ ...u, status: next }));
        toast.success(next === 'blocked' ? 'User blocked.' : 'User activated.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${user.name}" (Customer ID ${user.userCode})? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteUser(id);
      toast.success('User deleted.');
      navigate('/dashboard/users');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <Loader2 size={28} className="spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/users')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={15} /> Back to Users
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error || 'User not found.'}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`User · ${user.name || user.userCode}`} />
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/users')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={15} /> Back to Users
        </button>

        {/* ─── Header: identity + Customer ID ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', background: 'linear-gradient(135deg, var(--color-primary-muted), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="h4" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: roleConfig[user.role]?.bg, color: roleConfig[user.role]?.color }}>
                  {roleConfig[user.role]?.label || user.role}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: statusConfig[user.status]?.bg, color: statusConfig[user.status]?.color }}>
                  {statusConfig[user.status]?.label || user.status}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.15rem' }}>Customer ID</div>
            <button
              onClick={handleCopy}
              title="Copy Customer ID"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <span style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--color-primary)' }}>
                {user.userCode || '—'}
              </span>
              {user.userCode && (copied ? <Check size={18} style={{ color: '#16a34a' }} /> : <Copy size={16} style={{ color: 'var(--color-text-muted)' }} />)}
            </button>
          </div>
        </div>

        {/* ─── Admin controls ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Role</label>
            <select
              className="input"
              value={user.role}
              disabled={savingRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Account Status</label>
            <button
              className={`btn btn-sm ${user.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleStatusToggle}
              disabled={savingStatus}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {savingStatus ? <Loader2 size={14} className="spin" /> : <Shield size={14} />}
              {user.status === 'active' ? 'Block User' : 'Activate User'}
            </button>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-ghost btn-sm" onClick={handleDelete} disabled={deleting} style={{ color: '#dc2626' }}>
              {deleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />} Delete User
            </button>
          </div>
        </div>

        {/* ─── Grouped profile info ─── */}
        <InfoGrid
          title="Personal Information"
          fields={[
            { label: 'Full Name', value: user.name, icon: User },
            { label: 'First Name', value: user.firstName, icon: User },
            { label: 'Last Name', value: user.lastName, icon: User },
            { label: 'Organization', value: user.organization, icon: Building2 },
            { label: 'Job Title', value: user.jobTitle, icon: Briefcase },
            { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null, icon: Calendar },
          ]}
        />
        <InfoGrid
          title="Contact Information"
          fields={[
            { label: 'Email Address', value: user.email, icon: Mail },
            { label: 'Phone', value: user.phone, icon: Phone },
            { label: 'Alternate Phone', value: user.alternatePhone, icon: PhoneCall },
          ]}
        />
        <InfoGrid
          title="Address"
          fields={[
            { label: 'Address Line 1', value: user.address1 || user.address, icon: MapPin },
            { label: 'Address Line 2', value: user.address2, icon: MapPin },
            { label: 'City', value: user.city, icon: MapPin },
            { label: 'State / Province', value: user.stateProvince, icon: MapPin },
            { label: 'Zip / Postal Code', value: user.postalCode, icon: MapPin },
            { label: 'Country', value: user.country, icon: Globe },
          ]}
        />

        {/* ─── Renew summary ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          {[
            { label: 'Domains', value: String(domainCount) },
            { label: 'Domain Renew Total', value: formatUSD(domainRenewTotal) },
            { label: 'Hostings', value: String(hostingCount) },
            { label: 'Hosting Renew Total', value: formatUSD(hostingRenewTotal) },
            { label: 'Combined Renew', value: formatUSD(combinedRenewTotal), highlight: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-elevated"
              style={{
                padding: '0.9rem 1rem',
                margin: 0,
                borderColor: stat.highlight ? 'rgba(var(--color-primary-rgb), 0.35)' : undefined,
                background: stat.highlight ? 'rgba(var(--color-primary-rgb), 0.06)' : undefined,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                color: stat.highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}>
                {assetsLoading ? '…' : stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ─── Domains ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--color-primary)' }} /> Domains ({domainCount})
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={fetchAssets} disabled={assetsLoading}>
              <RefreshCw size={13} className={assetsLoading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          {assetsLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={20} className="spin" /></div>
          ) : domains.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0, padding: '1.25rem' }}>No domains for this user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem 1rem' }}>
              {domains.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--color-bg-secondary)', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.domainName}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginTop: 4 }}>
                      <StatusBadge status={d.status} map={domainStatusConfig} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {d.registrar || '—'} · {d.source === 'purchase' ? 'Purchased' : 'Admin Added'} · Expires {formatDate(d.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      {formatUSD(d.renewPriceUSD)}
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetailDomain(d)} title="View details">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/domains?search=${encodeURIComponent(d.domainName)}`)}>Manage</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem',
            padding: '0.85rem 1.25rem', borderTop: '1px solid var(--color-border)',
            fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
          }}>
            <span>Total domains: <strong style={{ color: 'var(--color-text-primary)' }}>{domainCount}</strong></span>
            <span>Total renew: <strong style={{ color: 'var(--color-primary)' }}>{formatUSD(domainRenewTotal)}</strong></span>
          </div>
        </div>

        {/* ─── Hosting ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} style={{ color: 'var(--color-primary)' }} /> Hosting ({hostingCount})
            </h3>
          </div>
          {assetsLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={20} className="spin" /></div>
          ) : hostings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0, padding: '1.25rem' }}>No hosting for this user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem 1rem' }}>
              {hostings.map((h) => (
                <div key={h._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--color-bg-secondary)', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.planName || '—'}
                      {h.websiteLabel && (
                        <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}> · {h.websiteLabel}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginTop: 4 }}>
                      <StatusBadge status={h.status} map={hostingStatusConfig} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {h.planType || '—'} · {h.billingCycle || '—'} · Expires {formatDate(h.expiresAt)}
                      </span>
                      {typeof h.amountUSD === 'number' && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          · Paid {formatUSD(h.amountUSD)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      {formatUSD(h.renewPriceUSD)}
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetailHosting(h)} title="View details">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/hostings?search=${encodeURIComponent(h.websiteLabel || h.planName || '')}`)}>Manage</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem',
            padding: '0.85rem 1.25rem', borderTop: '1px solid var(--color-border)',
            fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
          }}>
            <span>Total hostings: <strong style={{ color: 'var(--color-text-primary)' }}>{hostingCount}</strong></span>
            <span>Total renew: <strong style={{ color: 'var(--color-primary)' }}>{formatUSD(hostingRenewTotal)}</strong></span>
          </div>
        </div>
      </div>

      {detailDomain && (
        <DomainDetailModal domain={detailDomain} onClose={() => setDetailDomain(null)} />
      )}
      {detailHosting && (
        <HostingDetailModal hosting={detailHosting} onClose={() => setDetailHosting(null)} />
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
