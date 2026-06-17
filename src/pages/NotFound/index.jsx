// BIT SOFTWARE — 404 Page
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: 800, lineHeight: 1 }}>
            <span className="text-gradient">404</span>
          </h1>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="h3" style={{ marginBottom: '0.75rem' }}>Page Not Found</h2>
          <p className="body-base" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary"><Home size={16} /> Go Home</Link>
            <button onClick={() => window.history.back()} className="btn btn-secondary"><ArrowLeft size={16} /> Go Back</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
