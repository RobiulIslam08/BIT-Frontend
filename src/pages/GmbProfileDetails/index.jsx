// ============================================
// BIT SOFTWARE — GMB Profile Details (Customer)
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  MapPin, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock,
  XCircle, RefreshCw, Phone, Mail, Globe, ExternalLink, Building2,
  ListChecks,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { getMyGmbProfileById } from '@/api/gmbProfileApi';
import GmbProfilePreview from '@/components/gmb/GmbProfilePreview';
import '../MyAccount/MyAccount.css';
import './GmbProfileDetails.css';

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle2 },
  pending: { label: 'Pending Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Clock },
  suspended: { label: 'Suspended', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: XCircle },
};

const serviceLabels = {
  new: 'New Profile Setup',
  recovery: 'Profile Recovery',
  regular: 'Profile Management',
};

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function GmbProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login', { state: { from: location } });
  }, [isAuthenticated, navigate, location]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyGmbProfileById(id);
      if (res.success) setProfile(res.data);
      else setError(res.message || 'Failed to load GMB profile.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load GMB profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
    // Same data-fetch pattern as HostingDetails / DomainDetails
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [id]);

  if (!isAuthenticated) return null;

  const status = statusConfig[profile?.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const hours = profile?.businessHours && typeof profile.businessHours === 'object'
    ? profile.businessHours
    : null;

  return (
    <>
      <SEOHead
        title={profile ? `${profile.businessName} — GMB Profile` : 'GMB Profile Details'}
        description="View your Google Business Profile details and preview."
      />

      <div className="myaccount gmb-details" style={{ maxWidth: 1100 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/my-account?tab=gmb')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} /> Back to My GMB
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="spin" />
            <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)' }}>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={36} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchProfile}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : profile ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="gmb-details__layout">
              <div className="gmb-details__main">
                <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', minWidth: 0 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={22} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h1 className="h4" style={{ margin: 0, fontSize: 'clamp(1.15rem, 4vw, 1.45rem)', wordBreak: 'break-word' }}>
                          {profile.businessName}
                        </h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.4rem', alignItems: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: status.bg, color: status.color }}>
                            <StatusIcon size={11} /> {status.label}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {serviceLabels[profile.serviceType] || profile.serviceType}
                          </span>
                        </div>
                      </div>
                    </div>
                    {typeof profile.amountSAR === 'number' && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: 'clamp(1.1rem, 4vw, 1.35rem)' }}>
                          {profile.amountSAR} SAR
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Service amount</div>
                      </div>
                    )}
                  </div>

                  {profile.googleProfileUrl && (
                    <a
                      href={profile.googleProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '1rem', display: 'inline-flex' }}
                    >
                      <ExternalLink size={14} /> Open on Google
                    </a>
                  )}
                </div>

                <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: '1rem' }}>
                  <h2 className="h5" style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={16} /> Business info
                  </h2>
                  <div className="gmb-details__grid">
                    <div>
                      <div className="gmb-details__label">Category</div>
                      <div>{profile.category || '—'}</div>
                    </div>
                    <div>
                      <div className="gmb-details__label">Location type</div>
                      <div>{profile.hasPhysicalLocation === 'yes' ? 'Physical location' : 'Service area'}</div>
                    </div>
                    {profile.hasPhysicalLocation === 'yes' ? (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="gmb-details__label">Address</div>
                        <div>
                          {[profile.streetAddress, profile.city, profile.state, profile.postalCode, profile.country]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className="gmb-details__label">Service areas</div>
                        <div>{profile.serviceAreas || '—'}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: '1rem' }}>
                  <h2 className="h5" style={{ marginTop: 0, marginBottom: '1rem' }}>Contact</h2>
                  <div className="gmb-details__grid">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Phone size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>{profile.phone || '—'}</span>
                    </div>
                    {profile.whatsapp && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Phone size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span>WhatsApp: {profile.whatsapp}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>{profile.email || '—'}</span>
                    </div>
                    {profile.website && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Globe size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {hours && (
                  <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: '1rem' }}>
                    <h2 className="h5" style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} /> Business hours
                    </h2>
                    <div className="gmb-details__hours">
                      {DAY_ORDER.map((day) => {
                        const h = hours[day];
                        if (!h) return null;
                        return (
                          <div key={day} className="gmb-details__hours-row">
                            <span className="gmb-details__hours-day">{day}</span>
                            <span>
                              {h.active ? `${h.open} – ${h.close}` : 'Closed'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(profile.description || profile.servicesList) && (
                  <div className="card-elevated" style={{ padding: 'clamp(1.25rem, 4vw, 1.5rem)', marginBottom: '1rem' }}>
                    <h2 className="h5" style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ListChecks size={16} /> Details
                    </h2>
                    {profile.description && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div className="gmb-details__label">Description</div>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {profile.description}
                        </p>
                      </div>
                    )}
                    {profile.servicesList && (
                      <div>
                        <div className="gmb-details__label">Services / keywords</div>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{profile.servicesList}</p>
                      </div>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Need changes?{' '}
                  <Link to="/contact" style={{ color: 'var(--color-primary)' }}>Contact support</Link>
                  {' '}— profile updates are handled by our team after setup.
                </p>
              </div>

              <aside className="gmb-details__preview">
                <GmbProfilePreview profile={profile} showMapControls={false} />
              </aside>
            </div>
          </motion.div>
        ) : null}
      </div>
    </>
  );
}
