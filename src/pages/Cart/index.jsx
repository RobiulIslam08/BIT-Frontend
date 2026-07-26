// ============================================
// BIT SOFTWARE — Shopping Cart Page
// ============================================
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { ShoppingCart, Trash2, ArrowRight, Globe, Server, Package } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import {
  selectCartItems,
  selectCartTotalUSD,
  removeFromCart,
  clearCart,
  cartItemKey,
} from '@/features/cart/cartSlice';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/components/common/Toast/Toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const totalUSD = useSelector(selectCartTotalUSD);
  const { formatPriceWithCode } = useCurrency();

  const handleRemove = (item) => {
    dispatch(removeFromCart(cartItemKey(item)));
    toast.info('Item removed from cart.');
  };

  const handleClear = () => {
    dispatch(clearCart());
    toast.info('Cart cleared.');
  };

  return (
    <>
      <SEOHead title="Cart" description="Your domain and hosting cart." />
      <div className="section" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <ShoppingCart size={22} style={{ color: 'var(--color-primary)' }} />
              <h1 className="h3" style={{ margin: 0 }}>Your Cart</h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Review domain and hosting items, then checkout once.
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.25rem',
                borderRadius: 16,
                border: '1px dashed var(--color-border)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <Package size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }} />
              <h2 className="h5" style={{ marginBottom: '0.35rem' }}>Your cart is empty</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
                Add a domain or hosting plan to get started.
              </p>
              <Link to="/services/domain-hosting" className="btn btn-primary">
                Browse Domain & Hosting <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {items.map((item) => {
                  const key = cartItemKey(item);
                  const isDomain = item.type === 'domain';
                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-card, #fff)',
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: 'var(--color-primary-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isDomain
                          ? <Globe size={18} style={{ color: 'var(--color-primary)' }} />
                          : <Server size={18} style={{ color: 'var(--color-primary)' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', wordBreak: 'break-word' }}>
                          {item.label || item.domainName || item.planName}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {isDomain
                            ? 'Domain registration · 1 year'
                            : `Hosting · ${item.billingCycle}${item.attachedDomain ? ` · ${item.attachedDomain}` : ''}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                          {formatPriceWithCode(item.priceUSD || 0)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="btn btn-ghost"
                          style={{
                            marginTop: 4,
                            padding: '0.25rem 0.4rem',
                            minWidth: 0,
                            color: '#dc2626',
                            fontSize: 'var(--text-xs)',
                          }}
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div
                style={{
                  padding: '1.1rem 1.2rem',
                  borderRadius: 14,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Estimated total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                    {formatPriceWithCode(totalUSD)}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 0.85rem' }}>
                  Final price is confirmed at checkout using live server pricing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => navigate('/cart-checkout')}
                  >
                    Proceed to Checkout <ArrowRight size={14} />
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to="/services/domain-hosting" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      Continue shopping
                    </Link>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClear}>
                      Clear cart
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
