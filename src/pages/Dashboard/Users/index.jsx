// ============================================
// BIT SOFTWARE — Admin Users Management
// ============================================
// Searchable, paginated list of every registered user. Each user has a
// public 6-digit Customer ID (userCode). "Details" opens the full user page.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users as UsersIcon, Filter, RefreshCw, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Search, ChevronRight as ArrowRight,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllUsers } from '@/api/adminUsersApi';

const ROLE_OPTIONS = ['user', 'admin'];
const STATUS_OPTIONS = ['active', 'blocked'];

const roleConfig = {
  admin: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  user: { label: 'Customer', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
};

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function Pill({ config, value }) {
  const c = config[value] || { label: value, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function DashboardUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1, limit: 20 });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await getAllUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

  return (
    <>
      <SEOHead title="Users" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UsersIcon size={22} style={{ color: 'var(--color-primary)' }} /> Users
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>Search customers by name, email, or Customer ID</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <Filter size={15} /> Filters:
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              placeholder="Name, email, or ID…"
              style={{ width: '220px', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem 0.4rem 1.9rem' }}
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}>
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleConfig[r]?.label || r}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {meta.total} total
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={28} className="spin" /></div>
          ) : users.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="users__table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => navigate(`/dashboard/users/${u._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                        {u.userCode || '—'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{u.name || '—'}</td>
                      <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td><Pill config={roleConfig} value={u.role} /></td>
                      <td><Pill config={statusConfig} value={u.status} /></td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(u.createdAt)}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/users/${u._id}`); }}
                          style={{ padding: '0.35rem 0.6rem', gap: '0.2rem' }}
                        >
                          Details <ArrowRight size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPage > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <span>Page {meta.page} of {meta.totalPage} ({meta.total})</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" disabled={meta.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}><ChevronLeft size={15} /> Prev</button>
                <button className="btn btn-ghost btn-sm" disabled={meta.page >= meta.totalPage} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next <ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .users__table { width: 100%; border-collapse: collapse; }
        .users__table thead th {
          text-align: left; padding: 0.85rem 1rem; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary);
          white-space: nowrap;
        }
        .users__table tbody td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .users__table tbody tr:last-child td { border-bottom: none; }
        .users__table tbody tr { transition: background 0.15s ease; }
        .users__table tbody tr:hover { background: var(--color-bg-secondary); }
      `}</style>
    </>
  );
}
