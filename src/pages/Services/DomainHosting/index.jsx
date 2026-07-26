import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, ArrowRight, Search,
  Globe, ShoppingCart, Loader2, AlertCircle, Sparkles, X,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { StaggerChildren, StaggerItem } from '@/components/animations/StaggerChildren';
import { checkDomainAvailability } from '@/api/domainApi';
import { getPublicDomainPricing } from '@/api/domainPricingApi';
import { getPublicHostingPlans } from '@/api/hostingPlanApi';
import { useCurrency } from '@/context/CurrencyContext';
import { addToCart, cartItemKey, selectCartItems } from '@/features/cart/cartSlice';
import { toast } from '@/components/common/Toast/Toast';
import { trackSearch, trackSelectItem, trackEvent, trackAddToCart } from '@/utils/analytics';

// ─── Hosting Plans (fallback if API unavailable) ───
const SHARED_PLANS = [
  { slug: 'shared-starter', name: 'Starter', monthly: 3.99, yearly: 39, popular: false, features: ['10 GB SSD', '1 Website', 'Unmetered Bandwidth', '10 Email Accounts', 'Free SSL', 'cPanel Access'] },
  { slug: 'shared-business', name: 'Business', monthly: 7.99, yearly: 79, popular: true, features: ['50 GB SSD', '5 Websites', 'Unmetered Bandwidth', '50 Email Accounts', 'Free SSL', 'cPanel Access', 'Free Domain'] },
  { slug: 'shared-professional', name: 'Professional', monthly: 14.99, yearly: 149, popular: false, features: ['Unlimited SSD', 'Unlimited Websites', 'Unmetered Bandwidth', 'Unlimited Email', 'Free SSL', 'cPanel Access', 'Free Domain', 'Priority Support'] },
];
const VPS_PLANS = [
  { slug: 'vps-starter', name: 'Starter', monthly: 12.99, yearly: 129, popular: false, features: ['1 vCPU Core', '2 GB RAM', '40 GB NVMe', '2 TB Bandwidth', 'Root Access'] },
  { slug: 'vps-business', name: 'Business', monthly: 24.99, yearly: 249, popular: true, features: ['2 vCPU Cores', '4 GB RAM', '80 GB NVMe', '4 TB Bandwidth', 'Root Access'] },
  { slug: 'vps-professional', name: 'Professional', monthly: 44.99, yearly: 449, popular: false, features: ['4 vCPU Cores', '8 GB RAM', '160 GB NVMe', '8 TB Bandwidth', 'Root Access'] },
];

const mapApiPlans = (list = []) =>
  list.map((p) => ({
    slug: p.slug,
    name: p.name,
    monthly: p.monthlyPriceUSD,
    yearly: p.yearlyPriceUSD,
    popular: !!p.popular,
    features: p.features || [],
    planType: p.planType,
  }));

const FALLBACK_REGISTER_USD = 20;

/** Convert API pricing rows → { com: { register, renew, transfer }, ... } */
const toPriceMap = (list = []) => {
  const map = {};
  for (const row of list) {
    if (!row?.tld) continue;
    const key = String(row.tld).replace(/^\./, '').toLowerCase();
    map[key] = {
      register: row.registerPriceUSD ?? FALLBACK_REGISTER_USD,
      renew: row.renewPriceUSD ?? row.registerPriceUSD ?? FALLBACK_REGISTER_USD,
      transfer: row.transferPriceUSD ?? row.registerPriceUSD ?? FALLBACK_REGISTER_USD,
    };
  }
  return map;
};

const DOMAIN_SEARCH_STYLES = `
@keyframes spin { to { transform: rotate(360deg); } }

.domain-search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--color-bg-card, #fff);
  border: 2px solid var(--color-primary);
  border-radius: 16px;
  overflow: hidden;
  padding: 0.5rem;
  box-shadow: 0 4px 24px rgba(var(--color-primary-rgb, 79,70,229),0.15);
}
.domain-search-input-row {
  display: flex;
  align-items: center;
  flex: 1;
}
.domain-search-icon {
  margin: 0 0.75rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.domain-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: clamp(0.875rem, 3.5vw, 1.125rem);
  color: var(--color-text-primary);
  padding: 0.6rem 0.5rem 0.6rem 0;
  font-family: var(--font-body);
  min-width: 0;
}
.domain-search-input::placeholder { color: var(--color-text-muted); }
.domain-search-submit {
  width: 100%;
  border-radius: 10px;
  font-size: var(--text-sm);
  padding: 0.75rem 1rem;
  justify-content: center;
  gap: 0.4rem;
}
@media (min-width: 540px) {
  .domain-search-bar {
    flex-direction: row;
    align-items: center;
    padding: 0.375rem;
  }
  .domain-search-input-row { flex: 1; }
  .domain-search-input { padding: 0.75rem 0.5rem 0.75rem 0; }
  .domain-search-submit {
    width: auto;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    white-space: nowrap;
  }
}

/* --- Domain Result Cards --- */
.domain-result-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.domain-result-card.is-primary {
  padding: 1rem 1.125rem;
  border-radius: 16px;
}
.domain-result-card.is-primary.is-available {
  border: 2px solid #22c55e;
  background: linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(16,185,129,0.04) 100%);
  box-shadow: 0 4px 20px rgba(34,197,94,0.08);
}
.domain-result-card.is-primary.is-unavailable {
  border: 2px solid #ef4444;
  background: linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(220,38,38,0.04) 100%);
}

.domain-result-main {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}
.domain-result-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
.domain-result-info {
  flex: 1;
  min-width: 0;
}
.domain-result-title {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-text-primary);
  word-break: break-all;
  overflow-wrap: break-word;
  line-height: 1.35;
}
.domain-result-card.is-primary .domain-result-title {
  font-size: clamp(1rem, 4vw, 1.25rem);
}
.domain-result-card:not(.is-primary) .domain-result-title {
  font-size: clamp(0.85rem, 3.2vw, 0.98rem);
}
.domain-result-status {
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 2px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.domain-result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding-top: 0.625rem;
  border-top: 1px dashed var(--color-border);
}
.domain-result-price-box {
  text-align: left;
}
.domain-result-price {
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--color-primary);
  line-height: 1.2;
}
.domain-result-card.is-primary .domain-result-price {
  font-size: clamp(1.1rem, 4vw, 1.35rem);
}
.domain-result-card:not(.is-primary) .domain-result-price {
  font-size: clamp(0.9rem, 3.2vw, 1.05rem);
}
.domain-result-subtext {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}
.domain-result-buy-btn {
  white-space: nowrap;
  gap: 0.35rem;
  border-radius: 10px;
  font-weight: 600;
}

@media (min-width: 540px) {
  .domain-result-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.875rem;
  }
  .domain-result-actions {
    width: auto;
    padding-top: 0;
    border-top: none;
    justify-content: flex-end;
    flex-shrink: 0;
  }
  .domain-result-price-box {
    text-align: right;
  }
}

.plan-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 420px;
  margin: 0 auto;
}
@media (min-width: 600px) {
  .plan-grid { grid-template-columns: repeat(2, 1fr); max-width: 700px; }
}
@media (min-width: 900px) {
  .plan-grid { grid-template-columns: repeat(3, 1fr); max-width: 1000px; }
}
.plan-card { padding: 1.25rem; }
@media (min-width: 768px) { .plan-card { padding: 2rem; } }

.dpt-cards {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}
.dpt-table-wrap { display: none; overflow-x: auto; }
.dpt-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}
.dpt-card:last-child { border-bottom: none; }
.dpt-ext {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-base);
  color: var(--color-primary);
  min-width: 60px;
  flex-shrink: 0;
}
.dpt-details { display: flex; flex-wrap: wrap; gap: 0.25rem 0.875rem; flex: 1; }
.dpt-item { display: flex; flex-direction: column; gap: 1px; }
.dpt-label { font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.dpt-val { font-size: var(--text-sm); font-weight: 700; color: var(--color-text-primary); }
@media (min-width: 640px) {
  .dpt-cards { display: none; }
  .dpt-table-wrap { display: block; }
}
`;

function DomainResultCard({ result, isPrimary = false, priceMap = {} }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const { formatPrice } = useCurrency();
  const parts = result.domain.split('.');
  const tld = parts.length > 1 ? parts.slice(1).join('.').toLowerCase() : 'com';
  const fromMap = priceMap[tld];
  const registerUSD =
    typeof result.registerPriceUSD === 'number' && result.registerPriceUSD > 0
      ? result.registerPriceUSD
      : (fromMap?.register ?? FALLBACK_REGISTER_USD);
  const renewUSD =
    typeof result.renewPriceUSD === 'number' && result.renewPriceUSD > 0
      ? result.renewPriceUSD
      : (fromMap?.renew ?? null);
  const displayRegister = formatPrice(registerUSD);
  const displayRenew = renewUSD != null ? formatPrice(renewUSD) : null;
  const inCart = cartItems.some(
    (i) => cartItemKey(i) === `domain:${String(result.domain).toLowerCase()}`,
  );

  const cardClasses = [
    'domain-result-card',
    isPrimary ? 'is-primary' : '',
    result.available ? 'is-available' : 'is-unavailable',
  ].filter(Boolean).join(' ');

  const gaItem = {
    item_id: result.domain,
    item_name: result.domain,
    item_category: 'domain_registration',
    item_variant: tld,
    price: registerUSD,
    quantity: 1,
  };

  const handleAddToCart = () => {
    if (inCart) {
      toast.info(`${result.domain} is already in your cart.`);
      return;
    }
    dispatch(addToCart({
      type: 'domain',
      domainName: result.domain,
      priceUSD: registerUSD,
      label: result.domain,
    }));
    trackAddToCart({ currency: 'USD', value: registerUSD, items: [gaItem] });
    toast.success(`${result.domain} added to cart.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cardClasses}
    >
      <div className="domain-result-main">
        {result.available
          ? <CheckCircle2 size={isPrimary ? 20 : 16} className="domain-result-icon" style={{ color: '#22c55e' }} />
          : <XCircle size={isPrimary ? 20 : 16} className="domain-result-icon" style={{ color: '#ef4444' }} />}
        <div className="domain-result-info">
          <div className="domain-result-title">{result.domain}</div>
          <div className="domain-result-status" style={{ color: result.available ? '#16a34a' : '#dc2626' }}>
            <span>{result.available ? 'Available' : 'Unavailable'}</span>
            {result.isPremium && result.available && (
              <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.62rem' }}>
                ⭐ Premium
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="domain-result-actions">
        {result.available && (
          <div className="domain-result-price-box">
            <div className="domain-result-price">{displayRegister}</div>
            <div className="domain-result-subtext">Register / 1st yr</div>
            {displayRenew && (
              <div className="domain-result-subtext" style={{ color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                Renews at {displayRenew}/yr
              </div>
            )}
          </div>
        )}
        {result.available ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'stretch' }}>
            <button
              type="button"
              className={`${isPrimary ? 'btn btn-primary' : 'btn btn-secondary'} domain-result-buy-btn`}
              style={{ fontSize: isPrimary ? '0.8rem' : '0.75rem', padding: isPrimary ? '0.55rem 1rem' : '0.4rem 0.75rem' }}
              onClick={handleAddToCart}
              disabled={inCart}
            >
              <ShoppingCart size={13} />{inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <Link
              to={`/domain-checkout?domain=${result.domain}`}
              className="btn btn-ghost domain-result-buy-btn"
              style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', justifyContent: 'center' }}
              onClick={() => trackSelectItem({ listName: 'domain_search_results', item: gaItem })}
            >
              Buy Now
            </Link>
          </div>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Taken</span>
        )}
      </div>
    </motion.div>
  );
}

function HostingDomainPrompt({ plan, billingCycle, priceUSD, onClose, onAdded }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState('ask'); // ask | has-domain
  const [domainInput, setDomainInput] = useState('');

  const addHosting = (attachedDomain) => {
    dispatch(addToCart({
      type: 'hosting',
      planSlug: plan.slug,
      planName: plan.name,
      planType: plan.planType || 'shared',
      billingCycle,
      priceUSD,
      label: `${plan.name} (${billingCycle})`,
      attachedDomain: attachedDomain || undefined,
      websiteLabel: attachedDomain || undefined,
    }));
    trackAddToCart({
      currency: 'USD',
      value: priceUSD,
      items: [{
        item_id: plan.slug,
        item_name: plan.name,
        item_category: 'hosting',
        item_variant: billingCycle,
        price: priceUSD,
        quantity: 1,
      }],
    });
    toast.success(`${plan.name} added to cart.`);
    onAdded?.();
    onClose();
  };

  const scrollToDomainSearch = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('domain-search-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('domain-search-input')?.focus();
    }, 50);
    toast.info('Search for a domain, add it to cart, then add hosting again — or skip and add hosting without a domain.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--color-bg-card, #fff)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Optional
            </div>
            <h3 className="h5" style={{ margin: '0.2rem 0 0', fontSize: '1.1rem' }}>Do you have a domain?</h3>
            <p style={{ margin: '0.35rem 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Adding <strong>{plan.name}</strong> hosting. Attach an existing domain, buy a new one, or skip.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost" style={{ padding: '0.35rem', minWidth: 0 }}>
            <X size={18} />
          </button>
        </div>

        {step === 'ask' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('has-domain')}>
              Yes, I have a domain
            </button>
            <button type="button" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={scrollToDomainSearch}>
              No — find a domain to buy
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addHosting()}>
              Skip for now
            </button>
          </div>
        )}

        {step === 'has-domain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Your domain name
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com"
                style={{
                  display: 'block', width: '100%', marginTop: '0.35rem',
                  padding: '0.65rem 0.75rem', borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)',
                }}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={!domainInput.trim() || !domainInput.includes('.')}
              onClick={() => addHosting(domainInput.trim().toLowerCase())}
            >
              Add hosting with this domain
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('ask')}>
              Back
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function SearchSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div key={i}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{ height: i === 1 ? '68px' : '54px', borderRadius: i === 1 ? '14px' : '10px', background: 'var(--color-border)' }}
        />
      ))}
    </div>
  );
}

function DomainSearchSection({ priceMap = {} }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    setLoading(true); setError(''); setResult(null);
    trackSearch(trimmed);
    try {
      const data = await checkDomainAvailability(trimmed);
      if (data?.success && data?.data) {
        setResult(data.data);
        trackEvent('domain_search_result', {
          search_term: trimmed,
          domain: data.data?.primaryResult?.domain,
          available: Boolean(data.data?.primaryResult?.available),
          suggestions_count: data.data?.suggestions?.length || 0,
        });
      } else {
        setError(data?.message || 'Unexpected response. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to check domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableSuggestions = result?.suggestions?.filter((s) => s.available) ?? [];
  const unavailableSuggestions = result?.suggestions?.filter((s) => !s.available) ?? [];

  return (
    <section id="domain-search-section" className="section" style={{ background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)', paddingTop: '0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <FadeInUp>
          <div className="section-header" style={{ marginBottom: '1.75rem' }}>
            <span className="section-subtitle">
              <Globe size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />Domain Search
            </span>
            <h2 className="h2 section-header__title">Find Your <span className="text-gradient">Perfect Domain</span></h2>
            <p className="section-header__desc">Search and check domain availability in real-time. Transparent register and renewal pricing.</p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
            <div className="domain-search-bar">
              <div className="domain-search-input-row">
                <Search size={17} className="domain-search-icon" />
                <input ref={inputRef} id="domain-search-input" type="text" value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. mybusiness.com" disabled={loading}
                  className="domain-search-input"
                />
              </div>
              <button id="domain-search-btn" type="submit"
                disabled={loading || !query.trim()} className="btn btn-primary domain-search-submit"
                style={{ opacity: loading || !query.trim() ? 0.6 : 1, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer' }}
              >
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
                  : <><Search size={15} /> Search Domain</>}
              </button>
            </div>
          </form>
        </FadeInUp>

        <AnimatePresence>
          {loading && <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SearchSkeleton /></motion.div>}
        </AnimatePresence>

        <AnimatePresence>
          {error && !loading && (
            <motion.div key="err" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.875rem 1rem', borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !loading && (
            <motion.div key="res" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <div style={{ marginBottom: '1.125rem' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Your Search</div>
                <DomainResultCard result={result.primaryResult} isPrimary priceMap={priceMap} />
              </div>
              {availableSuggestions.length > 0 && (
                <div style={{ marginBottom: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    <Sparkles size={11} />Available Alternatives
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {availableSuggestions.map((s) => <DomainResultCard key={s.domain} result={s} priceMap={priceMap} />)}
                  </div>
                </div>
              )}
              {unavailableSuggestions.length > 0 && availableSuggestions.length > 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                  {unavailableSuggestions.length} other extension{unavailableSuggestions.length > 1 ? 's' : ''} already registered.
                </div>
              )}
              {availableSuggestions.length === 0 && !result.primaryResult.available && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  <AlertCircle size={22} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>All common extensions for this name are taken. Try a different name.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{DOMAIN_SEARCH_STYLES}</style>
    </section>
  );
}

function DomainPricingTable({ formatPrice, rows = [], loading = false }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        Pricing will appear here shortly.
      </div>
    );
  }
  return (
    <>
      <div className="dpt-cards">
        {rows.map((row, i) => (
          <div key={row.ext} className="dpt-card" style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(var(--color-primary-rgb,79,70,229),0.02)' }}>
            <div className="dpt-ext">{row.ext}</div>
            <div className="dpt-details">
              <div className="dpt-item"><span className="dpt-label">Register</span><span className="dpt-val">{formatPrice(row.reg)}/yr</span></div>
              <div className="dpt-item"><span className="dpt-label">Renew</span><span className="dpt-val">{formatPrice(row.renew)}/yr</span></div>
              <div className="dpt-item"><span className="dpt-label">Transfer</span><span className="dpt-val">{formatPrice(row.transfer)}/yr</span></div>
              <div className="dpt-item"><span className="dpt-label">Privacy</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#16a34a' }}>{row.privacy}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="dpt-table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}>
              {['Extension', 'Register', 'Renew', 'Transfer', 'Privacy'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.ext} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(var(--color-primary-rgb,79,70,229),0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}>{row.ext}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatPrice(row.reg)}/yr</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{formatPrice(row.renew)}/yr</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{formatPrice(row.transfer)}/yr</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: '#16a34a', fontWeight: 600 }}>{row.privacy}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function DomainHosting() {
  const cartItems = useSelector(selectCartItems);
  const [tab, setTab] = useState('shared');
  const [isYearly, setIsYearly] = useState(true);
  const [priceMap, setPriceMap] = useState({});
  const [pricingRows, setPricingRows] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [sharedPlans, setSharedPlans] = useState(SHARED_PLANS);
  const [vpsPlans, setVpsPlans] = useState(VPS_PLANS);
  const [hostingPrompt, setHostingPrompt] = useState(null); // { plan, billingCycle, priceUSD }
  const plans = tab === 'shared' ? sharedPlans : vpsPlans;
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicHostingPlans();
        const list = res?.data || [];
        if (cancelled || !list.length) return;
        const shared = mapApiPlans(list.filter((p) => p.planType === 'shared'));
        const vps = mapApiPlans(list.filter((p) => p.planType === 'vps'));
        if (shared.length) setSharedPlans(shared);
        if (vps.length) setVpsPlans(vps);
      } catch {
        /* keep fallbacks */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPricingLoading(true);
      try {
        const res = await getPublicDomainPricing();
        const list = res?.data || [];
        if (cancelled) return;
        setPriceMap(toPriceMap(list));
        setPricingRows(
          list.map((p) => ({
            ext: `.${p.tld}`,
            reg: p.registerPriceUSD,
            renew: p.renewPriceUSD,
            transfer: p.transferPriceUSD,
            privacy: 'Free',
          })),
        );
      } catch {
        if (!cancelled) {
          setPriceMap({});
          setPricingRows([]);
        }
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SEOHead
        title="Domain & Hosting"
        description="Check domain availability and find reliable hosting plans at the best prices."
      />

      {/* ─── Hero ─── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)', paddingBottom: '3rem' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domain & Hosting</span>
              <h1 className="h1 section-header__title">Reliable <span className="text-gradient">Hosting & Domains</span></h1>
              <p className="section-header__desc">
                Fast, secure, and affordable hosting plans with free SSL and 24/7 support. Check domain availability instantly.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ─── Domain Search ─── */}
      <DomainSearchSection priceMap={priceMap} />

      {/* ─── Hosting Plans ─── */}
      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Hosting Plans</span>
              <h2 className="h2 section-header__title">Choose Your <span className="text-gradient">Hosting Plan</span></h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['shared', 'vps'].map((t) => (
                <button key={t} id={`hosting-tab-${t}`} onClick={() => setTab(t)}
                  className={tab === t ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)', padding: '0.6rem 1.25rem' }}>
                  {t === 'shared' ? 'Shared Hosting' : 'VPS Hosting'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: !isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Monthly</span>
              <button id="billing-toggle" onClick={() => setIsYearly(!isYearly)}
                style={{ width: '46px', height: '26px', borderRadius: '13px', background: isYearly ? 'var(--color-primary)' : 'var(--color-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}>
                <motion.div
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px' }}
                  animate={{ left: isYearly ? '23px' : '3px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Yearly</span>
              {isYearly && <span className="badge badge-success">Save 20%</span>}
            </div>
          </FadeInUp>

          <StaggerChildren className="plan-grid">
            {plans.map((plan) => (
              <StaggerItem key={plan.slug || plan.name}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}
                  className="card-elevated plan-card"
                  style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', border: plan.popular ? '2px solid var(--color-primary)' : undefined, height: '100%' }}>
                  {plan.popular && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--color-accent-gradient)' }} />}
                  {plan.popular && <span className="badge" style={{ marginBottom: '0.75rem' }}>Most Popular</span>}
                  <h3 className="h4" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: 'clamp(1.75rem, 7vw, 2.25rem)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {formatPrice(isYearly ? plan.yearly : plan.monthly)}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-sm)' }}>
                        <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const billingCycle = isYearly ? 'yearly' : 'monthly';
                    const priceUSD = isYearly ? plan.yearly : plan.monthly;
                    const inCart = cartItems.some(
                      (i) => cartItemKey(i) === `hosting:${plan.slug}:${billingCycle}`,
                    );
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <button
                          type="button"
                          className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                          style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-sm)' }}
                          disabled={inCart}
                          onClick={() => {
                            if (inCart) {
                              toast.info('This hosting plan is already in your cart.');
                              return;
                            }
                            setHostingPrompt({ plan, billingCycle, priceUSD });
                          }}
                        >
                          <ShoppingCart size={14} /> {inCart ? 'In Cart' : 'Add to Cart'}
                        </button>
                        <Link
                          to={`/hosting-checkout?plan=${encodeURIComponent(plan.slug)}&billing=${billingCycle}`}
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-sm)' }}
                          onClick={() => trackSelectItem({
                            listName: `hosting_plans_${tab}`,
                            item: {
                              item_id: plan.slug,
                              item_name: plan.name,
                              item_category: 'hosting',
                              item_variant: billingCycle,
                              price: priceUSD,
                              quantity: 1,
                            },
                          })}
                        >
                          Buy Now <ArrowRight size={14} />
                        </Link>
                      </div>
                    );
                  })()}
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ─── Domain Extensions Pricing ─── */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Domains</span>
              <h2 className="h2 section-header__title">Domain Extension Pricing</h2>
              <p className="section-header__desc">Register your domain at the lowest prices. All domains include free DNS management and WHOIS Privacy.</p>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <DomainPricingTable formatPrice={formatPrice} rows={pricingRows} loading={pricingLoading} />
          </FadeInUp>
        </div>
      </section>

      <AnimatePresence>
        {hostingPrompt && (
          <HostingDomainPrompt
            plan={hostingPrompt.plan}
            billingCycle={hostingPrompt.billingCycle}
            priceUSD={hostingPrompt.priceUSD}
            onClose={() => setHostingPrompt(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
