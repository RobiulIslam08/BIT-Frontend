// ============================================
// BIT SOFTWARE — AuthLayout
// ============================================

import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-accent-1)',
            }}>B</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)',
            }}>BIT Software</span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
