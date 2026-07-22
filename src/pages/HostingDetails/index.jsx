// ============================================
// BIT SOFTWARE — Hosting Details (Customer)
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  Server, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock,
  XCircle, Calendar, Download, Package, HardDrive, RefreshCw,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { getMyHostingById, downloadHostingProject } from '@/api/hostingApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function HostingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { formatPrice } = useCurrency();

  const [hosting, setHosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated, navigate]);

  const fetchHosting = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyHostingById(id);
      if (res.success) setHosting(res.data);
      else setError(res.message || 'Failed to load hosting.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load hosting details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHosting();
  }, [id]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDownload = async () => {
    if (!hosting?.projectFile?.available) {
      toast.info('Project file is not available yet.');
      return;
    }
    setDownloading(true);
    try {
      await downloadHostingProject(id, hosting.projectFile.originalName || 'project.zip');
      toast.success('Download started.');
    } catch (err) {
      toast.error(err?.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (!isAuthenticated) return null;

  const status = statusConfig[hosting?.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <>
      <SEOHead title={hosting ? `${hosting.planName} Hosting` : 'Hosting Details'} description="View your hosting plan details and download your project." />

      <div className="myaccount" style={{ maxWidth: 960, margin: '0 auto', padding: '1.25rem clamp(1rem, 4vw, 2rem) 3rem' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/my-account?tab=hosting')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} /> Back to My Hosting
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="spin" />
            <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading hosting details...</p>
          </div>
        ) : error ? (
          <div className="card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={36} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchHosting}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : hosting ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', minWidth: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Server size={22} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h1 className="h4" style={{ margin: 0, fontSize: 'clamp(1.15rem, 4vw, 1.45rem)' }}>
                      {hosting.planName}
                    </h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.4rem', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: status.bg, color: status.color }}>
                        <StatusIcon size={11} /> {status.label}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {hosting.planType} · {hosting.billingCycle}
                      </span>
                    </div>
                  </div>
                </div>
                {typeof hosting.amountUSD === 'number' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: 'clamp(1.1rem, 4vw, 1.35rem)' }}>
                      {formatPrice(hosting.amountUSD)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Plan amount</div>
                  </div>
                )}
              </div>

              {hosting.websiteLabel && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 10, background: 'var(--color-bg-secondary)', fontSize: 'var(--text-sm)' }}>
                  <strong style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', display: 'block', marginBottom: 2 }}>Website / Project</strong>
                  {hosting.websiteLabel}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="card-elevated" style={{ padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  <Calendar size={13} /> Started
                </div>
                <div style={{ fontWeight: 600 }}>{formatDate(hosting.startsAt)}</div>
              </div>
              <div className="card-elevated" style={{ padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  <Calendar size={13} /> Expires
                </div>
                <div style={{ fontWeight: 600 }}>{formatDate(hosting.expiresAt)}</div>
              </div>
              <div className="card-elevated" style={{ padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                  <Package size={13} /> Billing Cycle
                </div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{hosting.billingCycle}</div>
              </div>
            </div>

            <div className="card-elevated" style={{ padding: 'clamp(1.1rem, 3vw, 1.5rem)', marginBottom: '1rem' }}>
              <h2 className="h5" style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HardDrive size={18} /> Plan Features
              </h2>
              {(hosting.features || []).length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No feature list on file.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.55rem' }}>
                  {hosting.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
                      <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card-elevated" style={{ padding: 'clamp(1.1rem, 3vw, 1.5rem)' }}>
              <h2 className="h5" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={18} /> Project Files
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                Download your website project as a ZIP archive when available.
              </p>

              {hosting.projectFile?.available ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: 12, background: 'var(--color-bg-secondary)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>
                      {hosting.projectFile.originalName}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {formatBytes(hosting.projectFile.size)}
                      {hosting.projectFile.uploadedAt && ` · Uploaded ${formatDate(hosting.projectFile.uploadedAt)}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{ flexShrink: 0 }}
                  >
                    {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                    {downloading ? 'Downloading...' : 'Download ZIP'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Your project file is not ready yet. Once our team uploads it, you can download it from here.
                </div>
              )}
            </div>

            <p style={{ marginTop: '1.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Need help? <Link to="/contact" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Contact support</Link>
            </p>
          </motion.div>
        ) : null}
      </div>
    </>
  );
}
