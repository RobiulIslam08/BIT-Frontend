// ============================================
// BIT SOFTWARE — My Business Email Details
// ============================================
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Mail, Loader2, AlertCircle, ArrowLeft, KeyRound, ExternalLink, CheckCircle2, Clock,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { getMyEmailById, sendWebmailAccessEmail } from '@/api/emailsApi';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';

export default function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { formatPrice } = useCurrency();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getMyEmailById(id);
        if (!cancelled && res.success) setItem(res.data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSendAccess = async () => {
    setSending(true);
    try {
      await sendWebmailAccessEmail(id);
      toast.success('Access details sent to your email.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not send access email.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="spin" size={28} /></div>;
  }

  if (error || !item) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: 8, color: '#dc2626' }}><AlertCircle size={16} /> {error || 'Not found'}</div>
        <Link to="/my-account?tab=email" className="btn btn-ghost" style={{ marginTop: 12 }}>Back</Link>
      </div>
    );
  }

  const desired = item.primaryEmail
    || (item.desiredEmailLocalPart && item.domainName
      ? `${item.desiredEmailLocalPart}@${item.domainName}`
      : null);
  const ready = item.provisioningStatus === 'ready' || item.hasWebmailAccess;

  return (
    <>
      <SEOHead title={`${item.planName} — Business Email`} />
      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <Link to="/my-account?tab=email" className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to My Email
        </Link>

        <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="h5" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={20} /> {item.planName}
              </h1>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
                {desired || item.domainName || 'Business Email'} · {item.billingCycle}
              </div>
            </div>
            <span style={{
              alignSelf: 'flex-start',
              padding: '0.25rem 0.6rem',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: ready ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
              color: ready ? '#16a34a' : '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {ready ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              {ready ? 'Ready' : 'Setup in progress'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="card-elevated" style={{ padding: '1rem' }}>
            <h3 className="h6">Subscription</h3>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Status: <strong>{item.status}</strong></p>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Starts: {item.startsAt ? new Date(item.startsAt).toLocaleDateString() : '—'}</p>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : '—'}</p>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Amount: {item.amountUSD != null ? formatPrice(item.amountUSD) : '—'}</p>
          </div>

          <div className="card-elevated" style={{ padding: '1rem' }}>
            <h3 className="h6">Business details</h3>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>{item.businessName || '—'}</p>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Domain: {item.domainName || '—'}</p>
            <p style={{ margin: '0.35rem 0', fontSize: 14 }}>Country: {item.country || '—'}</p>
          </div>

          <div className="card-elevated" style={{ padding: '1rem' }}>
            <h3 className="h6">Webmail access</h3>
            {!ready ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                Your mailbox is being prepared. Details will show here when ready.
              </p>
            ) : (
              <>
                {item.webmailUrl && (
                  <a className="btn btn-primary btn-sm" href={item.webmailUrl} target="_blank" rel="noreferrer" style={{ marginBottom: 8 }}>
                    <ExternalLink size={14} /> Open webmail
                  </a>
                )}
                <p style={{ fontSize: 14, margin: '0.35rem 0' }}>Username: <strong>{item.webmailUsername}</strong></p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleSendAccess} disabled={sending}>
                  {sending ? <Loader2 className="spin" size={14} /> : <KeyRound size={14} />}
                  Email me credentials
                </button>
              </>
            )}
          </div>
        </div>

        {!!(item.features || []).length && (
          <div className="card-elevated" style={{ padding: '1rem', marginTop: '1rem' }}>
            <h3 className="h6">Plan features</h3>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
              {item.features.map((f) => <li key={f} style={{ marginBottom: 4, fontSize: 14 }}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
