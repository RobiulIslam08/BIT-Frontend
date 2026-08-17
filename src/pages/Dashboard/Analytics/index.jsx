// ============================================
// BIT SOFTWARE — Admin Visitor Analytics
// ============================================
// Live visitors + session history (pages visited, exit page, user info).

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Users, UserX, Radio, RefreshCw, Loader2,
  AlertCircle, Search, Filter, ChevronLeft, ChevronRight, X, Clock,
  ShoppingCart, MessageCircle,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getLiveActivity, getActivitySessions } from '@/api/activityApi';

const statusConfig = {
  active: { label: 'Live', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  left: { label: 'Left', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

function Pill({ config, value }) {
  const c = config[value] || { label: value, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '11px',
      fontWeight: 700, background: c.bg, color: c.color,
    }}>
      {c.label}
    </span>
  );
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function formatDuration(ms) {
  if (typeof ms !== 'number' || Number.isNaN(ms) || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return `${min}m ${sec}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function sessionDuration(s) {
  const start = s.startedAt ? new Date(s.startedAt).getTime() : 0;
  const end = (s.endedAt || s.lastSeenAt) ? new Date(s.endedAt || s.lastSeenAt).getTime() : Date.now();
  return start ? end - start : 0;
}

const intentConfig = {
  checkout: { label: 'Checkout', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  contact: { label: 'Contact', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  auth: { label: 'Login', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  service: { label: 'Service', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  account: { label: 'Account', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  browse: { label: 'Browse', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
};

function IntentPill({ value }) {
  if (!value) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
  return <Pill config={intentConfig} value={value} />;
}

function deviceLabel(s) {
  const d = s.device || 'desktop';
  const b = s.browser;
  return b ? `${d} · ${b}` : d;
}

function visitorLabel(s) {
  if (s.name || s.email || s.userCode) {
    const kind = s.role === 'admin' ? 'Admin' : 'Customer';
    return {
      title: s.name || s.email || kind,
      sub: [s.userCode, s.email, kind, s.isReturning ? 'Returning' : null].filter(Boolean).join(' · '),
      isGuest: false,
    };
  }
  return { title: 'Guest', sub: s.isReturning ? 'Returning visitor' : 'Not logged in', isGuest: true };
}

function JourneyModal({ session, onClose }) {
  const navigate = useNavigate();
  const info = visitorLabel(session);
  const pages = session.pages || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="card-elevated"
        style={{ width: 'min(640px, 100%)', maxHeight: '86vh', overflow: 'auto', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 className="h5" style={{ margin: 0 }}>{info.title}</h3>
            <p className="body-sm" style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>{info.sub}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
            <div style={{ marginTop: 4 }}><Pill config={statusConfig} value={session.status} /></div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Duration</div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>{formatDuration(sessionDuration(session))}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Entry</div>
            <div style={{ marginTop: 4, fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>{session.entryPage || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Exit</div>
            <div style={{ marginTop: 4, fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>{session.exitPage || session.currentPage || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Source</div>
            <div style={{ marginTop: 4, fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{session.source || 'direct'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Device</div>
            <div style={{ marginTop: 4, fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{deviceLabel(session)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Intent</div>
            <div style={{ marginTop: 4 }}><IntentPill value={session.intent} /></div>
          </div>
        </div>

        {session.userId && (
          <div style={{ padding: '0 1.25rem 0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/users/${session.userId}`)}>
              View customer
            </button>
          </div>
        )}

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <h4 className="h6" style={{ margin: '0 0 0.75rem' }}>Page journey</h4>
          {pages.length === 0 ? (
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>No pages recorded.</p>
          ) : (
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pages.map((p, i) => (
                <li key={`${p.path}-${p.enteredAt}-${i}`} style={{
                  display: 'flex', gap: '0.75rem', padding: '0.7rem 0.85rem',
                  borderRadius: 10, background: 'var(--color-bg-secondary)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
                    fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>{p.path}</div>
                    {p.title && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.title}</div>}
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {formatDateTime(p.enteredAt)}
                      {p.leftAt ? ` → ${formatDateTime(p.leftAt)}` : ' · on page'}
                      {' · '}
                      {formatDuration(p.durationMs ?? (p.leftAt ? new Date(p.leftAt) - new Date(p.enteredAt) : Date.now() - new Date(p.enteredAt)))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardAnalytics() {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);
  const [stats, setStats] = useState({
    liveNow: 0, todaySessions: 0, todayLoggedIn: 0, todayGuests: 0,
    onCheckout: 0, abandonedCheckout: 0, whatsappClicks: 0,
  });
  const [topPages, setTopPages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  const [liveLoading, setLiveLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({
    search: '', visitorType: '', status: '', device: '', intent: '', page: 1, limit: 20,
  });

  const fetchLive = useCallback(async (silent = false) => {
    if (!silent) setLiveLoading(true);
    try {
      const res = await getLiveActivity();
      if (res.success) {
        setLive(res.data?.visitors || []);
        if (res.data?.stats) setStats((prev) => ({ ...prev, ...res.data.stats }));
        if (Array.isArray(res.data?.topPages)) setTopPages(res.data.topPages);
      }
    } catch (err) {
      if (!silent) setError(err?.response?.data?.message || 'Failed to load live visitors.');
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await getActivitySessions(params);
      if (res.success) {
        setSessions(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sessions.');
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLive(false); }, [fetchLive]);

  useEffect(() => {
    const id = setInterval(() => fetchLive(true), 10000);
    return () => clearInterval(id);
  }, [fetchLive]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const kpis = [
    { label: 'Live now', value: stats.liveNow, icon: Radio, color: '#22c55e' },
    { label: "Today's sessions", value: stats.todaySessions, icon: BarChart3, color: 'var(--color-primary)' },
    { label: 'On checkout now', value: stats.onCheckout, icon: ShoppingCart, color: '#f59e0b' },
    { label: 'Left checkout today', value: stats.abandonedCheckout, icon: ShoppingCart, color: '#ef4444' },
    { label: 'WhatsApp clicks', value: stats.whatsappClicks, icon: MessageCircle, color: '#25D366' },
    { label: 'Guests today', value: stats.todayGuests, icon: UserX, color: '#6366f1' },
  ];

  return (
    <>
      <SEOHead title="Analytics" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={22} style={{ color: 'var(--color-primary)' }} /> Analytics
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>
              Pages visitors viewed and the page they left from — with customer info when logged in
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { fetchLive(false); fetchSessions(); }} disabled={liveLoading || listLoading}>
            <RefreshCw size={14} className={liveLoading || listLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {kpis.map((k) => (
            <div key={k.label} className="card-elevated" style={{ padding: '0.9rem 1rem', margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                <k.icon size={14} style={{ color: k.color }} /> {k.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: k.color, lineHeight: 1.2 }}>
                {liveLoading && k.label === 'Live now' ? '…' : k.value}
              </div>
            </div>
          ))}
        </div>

        {topPages.length > 0 && (
          <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
            <h2 className="h5" style={{ margin: '0 0 0.75rem' }}>Top pages today</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {topPages.map((p) => (
                <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: 'var(--text-sm)' }}>
                  <span style={{ wordBreak: 'break-all' }}>{p.path || '/'}</span>
                  <strong style={{ flexShrink: 0, color: 'var(--color-primary)' }}>{p.views}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <div className="card-elevated" style={{ marginBottom: '1.25rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={18} style={{ color: '#22c55e' }} /> Live now ({live.length})
            </h2>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Updates every 10s</span>
          </div>
          {liveLoading && live.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={24} className="spin" /></div>
          ) : live.length === 0 ? (
            <p style={{ margin: 0, padding: '1.5rem 1.25rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No one is on the site right now.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Current page</th>
                    <th>Intent</th>
                    <th>Device</th>
                    <th>Since</th>
                    <th>Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {live.map((s) => {
                    const info = visitorLabel(s);
                    return (
                      <tr key={s._id || s.sessionId} onClick={() => setDetail(s)} style={{ cursor: 'pointer', background: s.intent === 'checkout' ? 'rgba(245,158,11,0.08)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{info.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{info.sub}</div>
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>{s.currentPage || '—'}</td>
                        <td><IntentPill value={s.intent} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{deviceLabel(s)}</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDateTime(s.startedAt)}</td>
                        <td>{s.pages?.length || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-elevated" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <Filter size={15} /> Filters:
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              className="input"
              placeholder="Name, email, ID, or page…"
              style={{ width: '240px', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem 0.4rem 1.9rem' }}
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.visitorType} onChange={(e) => setFilters((f) => ({ ...f, visitorType: e.target.value, page: 1 }))}>
            <option value="">All visitors</option>
            <option value="customer">Customers</option>
            <option value="guest">Guests</option>
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All status</option>
            <option value="active">Live</option>
            <option value="left">Left</option>
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.intent} onChange={(e) => setFilters((f) => ({ ...f, intent: e.target.value, page: 1 }))}>
            <option value="">All intent</option>
            <option value="checkout">Checkout</option>
            <option value="contact">Contact</option>
            <option value="service">Service</option>
            <option value="auth">Login</option>
            <option value="browse">Browse</option>
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem' }} value={filters.device} onChange={(e) => setFilters((f) => ({ ...f, device: e.target.value, page: 1 }))}>
            <option value="">All devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {meta.total} total
          </div>
        </div>

        <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--color-primary)' }} /> Sessions
            </h2>
          </div>
          {listLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}><Loader2 size={28} className="spin" /></div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No sessions yet. Browse the public site, then refresh.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="analytics__table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Entry</th>
                    <th>Exit / current</th>
                    <th>Source</th>
                    <th>Intent</th>
                    <th>Device</th>
                    <th>Pages</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, idx) => {
                    const info = visitorLabel(s);
                    return (
                      <motion.tr
                        key={s._id || s.sessionId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setDetail(s)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{info.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{info.sub}</div>
                          {s.userId && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.15rem 0', fontSize: 11, height: 'auto' }}
                              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/users/${s.userId}`); }}
                            >
                              Customer profile
                            </button>
                          )}
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-all', maxWidth: 180 }}>{s.entryPage || '—'}</td>
                        <td style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-all', maxWidth: 180 }}>{s.exitPage || s.currentPage || '—'}</td>
                        <td style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{s.source || 'direct'}{s.whatsappClicks ? ` · WA ${s.whatsappClicks}` : ''}</td>
                        <td><IntentPill value={s.intent} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{deviceLabel(s)}</td>
                        <td>{s.pages?.length || 0}</td>
                        <td style={{ whiteSpace: 'nowrap' }}><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{formatDuration(sessionDuration(s))}</td>
                        <td><Pill config={statusConfig} value={s.status} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDateTime(s.lastSeenAt)}</td>
                      </motion.tr>
                    );
                  })}
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

      <AnimatePresence>
        {detail && <JourneyModal key={detail._id || detail.sessionId} session={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .analytics__table { width: 100%; border-collapse: collapse; }
        .analytics__table thead th {
          text-align: left; padding: 0.85rem 1rem; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary);
          white-space: nowrap;
        }
        .analytics__table tbody td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .analytics__table tbody tr:last-child td { border-bottom: none; }
        .analytics__table tbody tr { transition: background 0.15s ease; }
        .analytics__table tbody tr:hover { background: var(--color-bg-secondary); }
      `}</style>
    </>
  );
}
