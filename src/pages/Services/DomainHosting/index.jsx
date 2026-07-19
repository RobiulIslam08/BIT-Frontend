import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, ArrowRight, HardDrive, Search,
  Globe, ShoppingCart, Loader2, AlertCircle, Star, Sparkles,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { COMPANY } from '@/utils/constants';
import { checkDomainAvailability } from '@/api/domainApi';
import { useCurrency } from '@/context/CurrencyContext';

// ─── Hosting Plans ───
const SHARED_PLANS = [
  { name: 'Starter', monthly: 3.99, yearly: 39, popular: false, features: ['10 GB SSD', '1 Website', 'Unmetered Bandwidth', '10 Email Accounts', 'Free SSL', 'cPanel Access'] },
  { name: 'Business', monthly: 7.99, yearly: 79, popular: true, features: ['50 GB SSD', '5 Websites', 'Unmetered Bandwidth', '50 Email Accounts', 'Free SSL', 'cPanel Access', 'Free Domain'] },
  { name: 'Professional', monthly: 14.99, yearly: 149, popular: false, features: ['Unlimited SSD', 'Unlimited Websites', 'Unmetered Bandwidth', 'Unlimited Email', 'Free SSL', 'cPanel Access', 'Free Domain', 'Priority Support'] },
];
const VPS_PLANS = [
  { name: 'VPS-1', monthly: 12.99, yearly: 129, features: ['1 vCPU Core', '2 GB RAM', '40 GB NVMe', '2 TB Bandwidth', 'Root Access'] },
  { name: 'VPS-2', monthly: 24.99, yearly: 249, features: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe', '4 TB Bandwidth', 'Root Access'] },
  { name: 'VPS-4', monthly: 44.99, yearly: 449, features: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe', '8 TB Bandwidth', 'Root Access'] },
];

// ─── Popular TLD price reference (displayed in suggestions) ───
const TLD_PRICES = {
  com: 15, net: 17, org: 14, io: 55, co: 32, info: 12, biz: 17,
  online: 8, tech: 35, store: 10, shop: 22, app: 20, dev: 14,
  site: 8, website: 8, cloud: 22, digital: 32, agency: 32,
  solutions: 22, services: 22,
};

// ─── Domain Result Card Component ───
function DomainResultCard({ result, isPrimary = false }) {
  const { formatPrice } = useCurrency();

  const tld = result.domain.split('.').slice(1).join('.');
  const basePriceUSD = result.isPremium && result.premiumPrice ? result.premiumPrice : (TLD_PRICES[tld] ?? 20);
  const displayPrice = formatPrice(basePriceUSD);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: isPrimary ? '1.25rem 1.5rem' : '1rem 1.25rem',
        borderRadius: isPrimary ? '14px' : '10px',
        border: isPrimary
          ? result.available
            ? '2px solid var(--color-success, #22c55e)'
            : '2px solid var(--color-error, #ef4444)'
          : '1px solid var(--color-border)',
        background: isPrimary
          ? result.available
            ? 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(16,185,129,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(220,38,38,0.04) 100%)'
          : 'var(--color-bg-card, var(--color-bg-secondary))',
        flexWrap: 'wrap',
      }}
    >
      {/* Domain Name + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        {result.available ? (
          <CheckCircle2 size={isPrimary ? 22 : 18} style={{ color: '#22c55e', flexShrink: 0 }} />
        ) : (
          <XCircle size={isPrimary ? 22 : 18} style={{ color: '#ef4444', flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: isPrimary ? 'var(--text-xl)' : 'var(--text-base)',
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {result.domain}
          </div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: result.available ? '#16a34a' : '#dc2626',
            fontWeight: 600,
            marginTop: '2px',
          }}>
            {result.available ? '✓ Available' : '✗ Unavailable'}
            {result.isPremium && result.available && (
              <span style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>⭐ Premium</span>
            )}
          </div>
        </div>
      </div>

      {/* Price + Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        {result.available && (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontWeight: 800,
              fontSize: isPrimary ? 'var(--text-2xl)' : 'var(--text-lg)',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary)',
            }}>
              {displayPrice}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>/year</div>
          </div>
        )}
        {result.available ? (
          <Link
            to={`/domain-checkout?domain=${result.domain}`}
            className={isPrimary ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ whiteSpace: 'nowrap', fontSize: isPrimary ? undefined : 'var(--text-sm)', padding: isPrimary ? undefined : '0.4rem 0.875rem' }}
          >
            {isPrimary ? (
              <><ShoppingCart size={16} /> Buy Now</>
            ) : (
              <><ShoppingCart size={14} /> Buy</>
            )}
          </Link>
        ) : (
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}>
            Taken
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton Loader ───
function SearchSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{
            height: i === 1 ? '80px' : '64px',
            borderRadius: i === 1 ? '14px' : '10px',
            background: 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Domain Search Section ───
function DomainSearchSection() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { primaryResult, suggestions }
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await checkDomainAvailability(trimmed);
      if (data?.success && data?.data) {
        setResult(data.data);
      } else {
        setError(data?.message || 'Unexpected response. Please try again.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to check domain. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Available suggestions only (Namecheap shows only available alternatives)
  const availableSuggestions = result?.suggestions?.filter((s) => s.available) ?? [];
  const unavailableSuggestions = result?.suggestions?.filter((s) => !s.available) ?? [];

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)', paddingTop: '0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <FadeInUp>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-subtitle">
              <Globe size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
              Domain Search
            </span>
            <h2 className="h2 section-header__title">
              Find Your <span className="text-gradient">Perfect Domain</span>
            </h2>
            <p className="section-header__desc">
              Search and check domain availability in real-time. Powered by Namecheap.
            </p>
          </div>
        </FadeInUp>

        {/* ─── Search Bar ─── */}
        <FadeInUp delay={0.1}>
          <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-bg-card, #fff)',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(var(--color-primary-rgb, 79,70,229),0.15)',
            }}>
              <Search size={20} style={{ margin: '0 1rem', color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                id="domain-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your domain (e.g. mybusiness.com)"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  padding: '1rem 0',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button
                id="domain-search-btn"
                type="submit"
                disabled={loading || !query.trim()}
                className="btn btn-primary"
                style={{
                  borderRadius: '12px',
                  margin: '6px',
                  padding: '0.75rem 1.75rem',
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  flexShrink: 0,
                  opacity: loading || !query.trim() ? 0.6 : 1,
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
                ) : (
                  <><Search size={18} /> Search</>
                )}
              </button>
            </div>
          </form>
        </FadeInUp>

        {/* ─── Loading Skeleton ─── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SearchSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Error State ─── */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#dc2626',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Results ─── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Primary Result */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.75rem',
                }}>
                  Your Search
                </div>
                <DomainResultCard result={result.primaryResult} isPrimary />
              </div>

              {/* Available Alternatives */}
              {availableSuggestions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.75rem',
                  }}>
                    <Sparkles size={13} />
                    Available Alternatives
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {availableSuggestions.map((s) => (
                      <DomainResultCard key={s.domain} result={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable (collapsed, just a count) */}
              {unavailableSuggestions.length > 0 && availableSuggestions.length > 0 && (
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '0.5rem',
                }}>
                  {unavailableSuggestions.length} other extension{unavailableSuggestions.length > 1 ? 's' : ''} already registered.
                </div>
              )}

              {/* Nothing available at all */}
              {availableSuggestions.length === 0 && !result.primaryResult.available && (
                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                }}>
                  <AlertCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>All common extensions for this name are taken. Try a different name.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

// ─── Main Page ───
export default function DomainHosting() {
  const [tab, setTab] = useState('shared');
  const [isYearly, setIsYearly] = useState(true);
  const plans = tab === 'shared' ? SHARED_PLANS : VPS_PLANS;

  const { formatPrice } = useCurrency();

  return (
    <>
      <SEOHead
        title="Domain & Hosting"
        description="Check domain availability and find reliable hosting plans at the best prices. Powered by Namecheap."
      />

      {/* ─── Hero ─── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)', paddingBottom: '4rem' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domain & Hosting</span>
              <h1 className="h1 section-header__title">
                Reliable <span className="text-gradient">Hosting & Domains</span>
              </h1>
              <p className="section-header__desc">
                Fast, secure, and affordable hosting plans with free SSL and 24/7 support.
                Check domain availability instantly.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ─── Domain Search ─── */}
      <DomainSearchSection />

      {/* ─── Hosting Plans ─── */}
      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Hosting Plans</span>
              <h2 className="h2 section-header__title">Choose Your <span className="text-gradient">Hosting Plan</span></h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              {['shared', 'vps'].map((t) => (
                <button
                  key={t}
                  id={`hosting-tab-${t}`}
                  onClick={() => setTab(t)}
                  className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'shared' ? 'Shared Hosting' : 'VPS Hosting'}
                </button>
              ))}
            </div>

            {/* Billing Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: !isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Monthly</span>
              <button
                id="billing-toggle"
                onClick={() => setIsYearly(!isYearly)}
                style={{ width: '48px', height: '26px', borderRadius: '13px', background: isYearly ? 'var(--color-primary)' : 'var(--color-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
              >
                <motion.div
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px' }}
                  animate={{ left: isYearly ? '25px' : '3px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Yearly</span>
              {isYearly && <span className="badge badge-success">Save 20%</span>}
            </div>
          </FadeInUp>

          {/* Plan Cards */}
          <StaggerChildren style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            {plans.map((plan) => (
              <StaggerItem key={plan.name}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="card-elevated"
                  style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', border: plan.popular ? '2px solid var(--color-primary)' : undefined }}
                >
                  {plan.popular && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--color-accent-gradient)' }} />}
                  {plan.popular && <span className="badge" style={{ marginBottom: '1rem' }}>Most Popular</span>}
                  <h3 className="h4" style={{ marginBottom: '0.5rem' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>${isYearly ? plan.yearly : plan.monthly}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={COMPANY.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Get Started <ArrowRight size={16} />
                  </a>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── Domain Extensions Pricing Table ─── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domains</span>
              <h2 className="h2 section-header__title">Domain Extension Pricing</h2>
              <p className="section-header__desc">
                Register your domain at the lowest prices. All domains include free DNS management and WHOIS Privacy.
              </p>
            </div>
          </FadeInUp>

          {/* Pricing Table */}
          <FadeInUp delay={0.1}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-primary)', borderBottom: '2px solid var(--color-border)' }}>
                    {['Extension', 'Register', 'Renew', 'Transfer', 'Privacy'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ext: '.com',     reg: 15,  renew: 17,  transfer: 15,  privacy: 'Free' },
                    { ext: '.net',     reg: 17,  renew: 19,  transfer: 17,  privacy: 'Free' },
                    { ext: '.org',     reg: 14,  renew: 16,  transfer: 14,  privacy: 'Free' },
                    { ext: '.co',      reg: 32,  renew: 35,  transfer: 32,  privacy: 'Free' },
                    { ext: '.io',      reg: 55,  renew: 58,  transfer: 55,  privacy: 'Free' },
                    { ext: '.info',    reg: 12,  renew: 14,  transfer: 12,  privacy: 'Free' },
                    { ext: '.biz',     reg: 17,  renew: 19,  transfer: 17,  privacy: 'Free' },
                    { ext: '.online',  reg: 8,   renew: 20,  transfer: 8,   privacy: 'Free' },
                    { ext: '.tech',    reg: 35,  renew: 38,  transfer: 35,  privacy: 'Free' },
                    { ext: '.store',   reg: 10,  renew: 35,  transfer: 10,  privacy: 'Free' },
                  ].map((row, i) => (
                    <tr key={row.ext} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(var(--color-primary-rgb, 79,70,229),0.02)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}>{row.ext}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {formatPrice(row.reg)}/yr
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)' }}>
                        {formatPrice(row.renew)}/yr
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)' }}>
                        {formatPrice(row.transfer)}/yr
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>
                          {row.privacy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
