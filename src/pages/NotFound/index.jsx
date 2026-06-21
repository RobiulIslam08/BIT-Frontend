// ============================================
// BIT SOFTWARE — 404 Page (Premium Redesign)
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" description="The page you are looking for does not exist." />
      <section style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'var(--color-primary)', opacity: 0.03, filter: 'blur(150px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: 'var(--radius-xl)',
              background: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem', color: 'var(--color-primary)',
            }}>
              <Search size={32} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 15vw, 8rem)',
              fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem',
            }}>
              <span className="text-gradient">404</span>
            </h1>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="h3" style={{ marginBottom: '0.75rem' }}>Page Not Found</h2>
            <p className="body-base" style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary btn-lg"><Home size={18} /> Go Home</Link>
              <button onClick={() => window.history.back()} className="btn btn-secondary btn-lg"><ArrowLeft size={18} /> Go Back</button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
