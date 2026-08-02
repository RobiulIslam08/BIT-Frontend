// ============================================
// BIT SOFTWARE — Service Analysis (Admin)
// ============================================
// Read-only overview of BIT-registered domains + all hostings,
// with paginated "See More" lists and full renew-price totals.

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  PieChart, Globe, Server, Loader2, AlertCircle, RefreshCw, ChevronDown,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllDomains } from '@/api/domainsApi';
import { getAllHostings } from '@/api/hostingApi';
import '../Domains/Domains.css';
import './ServiceAnalysis.css';

const PAGE_SIZE = 10;

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

function Badge({ status, map }) {
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

const formatDate = (d) => (
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
);

const formatUSD = (n) => {
  const num = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const emptyMeta = { page: 1, total: 0, totalPage: 1, limit: PAGE_SIZE, totalRenewPriceUSD: 0 };

export default function AdminServiceAnalysis() {
  const [domains, setDomains] = useState([]);
  const [domainMeta, setDomainMeta] = useState(emptyMeta);
  const [domainPage, setDomainPage] = useState(1);
  const [domainLoading, setDomainLoading] = useState(true);
  const [domainLoadingMore, setDomainLoadingMore] = useState(false);
  const [domainError, setDomainError] = useState('');

  const [hostings, setHostings] = useState([]);
  const [hostingMeta, setHostingMeta] = useState(emptyMeta);
  const [hostingPage, setHostingPage] = useState(1);
  const [hostingLoading, setHostingLoading] = useState(true);
  const [hostingLoadingMore, setHostingLoadingMore] = useState(false);
  const [hostingError, setHostingError] = useState('');

  const fetchDomains = useCallback(async (page = 1, append = false) => {
    if (append) setDomainLoadingMore(true);
    else setDomainLoading(true);
    setDomainError('');
    try {
      const res = await getAllDomains({
        registrar: 'BIT',
        page,
        limit: PAGE_SIZE,
      });
      if (res.success) {
        const rows = res.data || [];
        setDomains((prev) => (append ? [...prev, ...rows] : rows));
        if (res.meta) {
          setDomainMeta({
            page: res.meta.page ?? page,
            total: res.meta.total ?? 0,
            totalPage: res.meta.totalPage ?? 1,
            limit: res.meta.limit ?? PAGE_SIZE,
            totalRenewPriceUSD: res.meta.totalRenewPriceUSD ?? 0,
          });
        }
        setDomainPage(page);
      }
    } catch (err) {
      setDomainError(err?.response?.data?.message || 'Failed to load domains.');
      if (!append) setDomains([]);
    } finally {
      setDomainLoading(false);
      setDomainLoadingMore(false);
    }
  }, []);

  const fetchHostings = useCallback(async (page = 1, append = false) => {
    if (append) setHostingLoadingMore(true);
    else setHostingLoading(true);
    setHostingError('');
    try {
      const res = await getAllHostings({
        page,
        limit: PAGE_SIZE,
      });
      if (res.success) {
        const rows = res.data || [];
        setHostings((prev) => (append ? [...prev, ...rows] : rows));
        if (res.meta) {
          setHostingMeta({
            page: res.meta.page ?? page,
            total: res.meta.total ?? 0,
            totalPage: res.meta.totalPage ?? 1,
            limit: res.meta.limit ?? PAGE_SIZE,
            totalRenewPriceUSD: res.meta.totalRenewPriceUSD ?? 0,
          });
        }
        setHostingPage(page);
      }
    } catch (err) {
      setHostingError(err?.response?.data?.message || 'Failed to load hostings.');
      if (!append) setHostings([]);
    } finally {
      setHostingLoading(false);
      setHostingLoadingMore(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchDomains(1, false);
    fetchHostings(1, false);
  }, [fetchDomains, fetchHostings]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const domainRenewTotal = domainMeta.totalRenewPriceUSD || 0;
  const hostingRenewTotal = hostingMeta.totalRenewPriceUSD || 0;
  const grandRenewTotal = domainRenewTotal + hostingRenewTotal;

  const canLoadMoreDomains = domainPage < (domainMeta.totalPage || 1);
  const canLoadMoreHostings = hostingPage < (hostingMeta.totalPage || 1);

  return (
    <>
      <SEOHead title="Service Analysis" description="BIT domains and hosting renew analysis." />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="h3" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={22} /> Service Analysis
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)', margin: '0.35rem 0 0' }}>
              BIT-registered domains and all hostings — renew totals across the full inventory.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={refreshAll}
            disabled={domainLoading || hostingLoading}
          >
            <RefreshCw size={14} className={domainLoading || hostingLoading ? 'spin' : undefined} /> Refresh
          </button>
        </div>

        {/* Summary */}
        <motion.div
          className="sa__summary"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="sa__stat">
            <div className="sa__stat-label">BIT Domains</div>
            <div className="sa__stat-value">{domainMeta.total}</div>
          </div>
          <div className="sa__stat">
            <div className="sa__stat-label">Domain Renew Total</div>
            <div className="sa__stat-value">{formatUSD(domainRenewTotal)}</div>
          </div>
          <div className="sa__stat">
            <div className="sa__stat-label">Hostings</div>
            <div className="sa__stat-value">{hostingMeta.total}</div>
          </div>
          <div className="sa__stat">
            <div className="sa__stat-label">Hosting Renew Total</div>
            <div className="sa__stat-value">{formatUSD(hostingRenewTotal)}</div>
          </div>
          <div className="sa__stat sa__stat--highlight">
            <div className="sa__stat-label">Grand Renew Total</div>
            <div className="sa__stat-value">{formatUSD(grandRenewTotal)}</div>
          </div>
        </motion.div>

        {/* Domains */}
        <section className="sa__section">
          <div className="sa__section-head">
            <div>
              <h2 className="sa__section-title"><Globe size={18} /> Domains</h2>
              <p className="sa__section-sub">Only domains with registrar = BIT</p>
            </div>
          </div>

          {domainError && (
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {domainError}
            </div>
          )}

          <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
            {domainLoading ? (
              <div className="sa__loading"><Loader2 size={28} className="spin" /></div>
            ) : domains.length === 0 ? (
              <div className="sa__empty">No BIT-registered domains found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="domains__table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Expires</th>
                      <th>Renew (USD)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((d, idx) => (
                      <motion.tr
                        key={d._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx % PAGE_SIZE, 9) * 0.02 }}
                      >
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{d.domainName}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{d.userId?.name || '—'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{d.userId?.email || ''}</div>
                        </td>
                        <td><Badge status={d.status} map={domainStatusConfig} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(d.expiresAt)}</td>
                        <td style={{ fontWeight: 700 }}>
                          {typeof d.renewPriceUSD === 'number' ? formatUSD(d.renewPriceUSD) : '—'}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '11px', fontWeight: 700,
                            color: d.source === 'purchase' ? '#16a34a' : '#6366f1',
                          }}>
                            {d.source === 'purchase' ? 'Purchased' : 'Admin Added'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="sa__footer">
              <div className="sa__footer-totals">
                <span>Total domains: <strong>{domainMeta.total}</strong></span>
                <span>Total renew: <strong>{formatUSD(domainRenewTotal)}</strong></span>
                <span>Showing: <strong>{domains.length}</strong></span>
              </div>
              {canLoadMoreDomains && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={domainLoadingMore}
                  onClick={() => fetchDomains(domainPage + 1, true)}
                >
                  {domainLoadingMore ? <Loader2 size={14} className="spin" /> : <ChevronDown size={14} />}
                  See More
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Hostings */}
        <section className="sa__section">
          <div className="sa__section-head">
            <div>
              <h2 className="sa__section-title"><Server size={18} /> Hostings</h2>
              <p className="sa__section-sub">All hosting assets in the system</p>
            </div>
          </div>

          {hostingError && (
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {hostingError}
            </div>
          )}

          <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
            {hostingLoading ? (
              <div className="sa__loading"><Loader2 size={28} className="spin" /></div>
            ) : hostings.length === 0 ? (
              <div className="sa__empty">No hostings found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="domains__table">
                  <thead>
                    <tr>
                      <th>Plan / Website</th>
                      <th>Owner</th>
                      <th>Type</th>
                      <th>Billing</th>
                      <th>Status</th>
                      <th>Expires</th>
                      <th>Renew (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostings.map((h, idx) => (
                      <motion.tr
                        key={h._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx % PAGE_SIZE, 9) * 0.02 }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                            {h.planName || h.planSlug || '—'}
                          </div>
                          {h.websiteLabel && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{h.websiteLabel}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{h.userId?.name || '—'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{h.userId?.email || ''}</div>
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{h.planType || '—'}</td>
                        <td style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{h.billingCycle || '—'}</td>
                        <td><Badge status={h.status} map={hostingStatusConfig} /></td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(h.expiresAt)}</td>
                        <td style={{ fontWeight: 700 }}>
                          {typeof h.renewPriceUSD === 'number' ? formatUSD(h.renewPriceUSD) : '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="sa__footer">
              <div className="sa__footer-totals">
                <span>Total hostings: <strong>{hostingMeta.total}</strong></span>
                <span>Total renew: <strong>{formatUSD(hostingRenewTotal)}</strong></span>
                <span>Showing: <strong>{hostings.length}</strong></span>
              </div>
              {canLoadMoreHostings && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={hostingLoadingMore}
                  onClick={() => fetchHostings(hostingPage + 1, true)}
                >
                  {hostingLoadingMore ? <Loader2 size={14} className="spin" /> : <ChevronDown size={14} />}
                  See More
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Grand total */}
        <motion.div
          className="sa__grand"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="sa__grand-label">Combined renew total (all BIT domains + all hostings)</div>
          <div className="sa__grand-value">{formatUSD(grandRenewTotal)}</div>
        </motion.div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
