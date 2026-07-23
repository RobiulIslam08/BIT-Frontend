// ============================================
// BIT SOFTWARE — Admin User Details
// ============================================
// Full profile for a single user: prominent copyable Customer ID, grouped
// profile fields, role/status controls, guarded delete, and the user's
// domains + hosting (reusing the admin list endpoints with a userId filter).

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Trash2, Shield,
  User, Building2, Briefcase, Calendar, Mail, Phone, PhoneCall,
  MapPin, Globe, Server, RefreshCw,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { toast } from '@/components/common/Toast/Toast';
import { useCurrency } from '@/context/CurrencyContext';
import {
  getUserById, updateUserRole, updateUserStatus, deleteUser,
} from '@/api/adminUsersApi';
import { getAllDomains } from '@/api/domainsApi';
import { getAllHostings } from '@/api/hostingApi';

const roleConfig = {
  admin: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  user: { label: 'Customer', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
};

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

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

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [domains, setDomains] = useState([]);
  const [hostings, setHostings] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

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
      if (dRes.success) setDomains(dRes.data || []);
      if (hRes.success) setHostings(hRes.data || []);
    } catch {
      // Non-blocking: the profile still renders without assets.
    } finally {
      setAssetsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); fetchAssets(); }, [fetchUser, fetchAssets]);

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

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

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

        {/* ─── Domains ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--color-primary)' }} /> Domains ({domains.length})
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={fetchAssets} disabled={assetsLoading}>
              <RefreshCw size={13} className={assetsLoading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          {assetsLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={20} className="spin" /></div>
          ) : domains.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>No domains for this user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {domains.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--color-bg-secondary)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.domainName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{d.status} · Expires {formatDate(d.expiresAt)}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/domains?search=${encodeURIComponent(d.domainName)}`)} style={{ flexShrink: 0 }}>Manage</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Hosting ─── */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} style={{ color: 'var(--color-primary)' }} /> Hosting ({hostings.length})
            </h3>
          </div>
          {assetsLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={20} className="spin" /></div>
          ) : hostings.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>No hosting for this user.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {hostings.map((h) => (
                <div key={h._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.9rem', borderRadius: '10px', background: 'var(--color-bg-secondary)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.planName} <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>({h.planType})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{h.status} · Expires {formatDate(h.expiresAt)}</div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {typeof h.amountUSD === 'number' && h.amountUSD > 0 && (
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>{formatPrice(h.amountUSD)}</div>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/hostings?search=${encodeURIComponent(h.websiteLabel || h.planName || '')}`)}>Manage</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
