// ============================================
// BIT SOFTWARE — AuthLayout (Public Auth Pages)
// Handles global navbar and footer around login/register
// ============================================

import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar/Navbar';
import { Footer } from '@/components/common/Footer/Footer';
import { ScrollToTopOnNavigate, ScrollToTopButton } from '@/components/common/ScrollToTop';
import { ScrollProgress } from '@/components/animations/ScrollProgress';

export function AuthLayout() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTopOnNavigate />
      <Navbar />
      <main style={{
        paddingTop: 'var(--nav-height)',
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        paddingTop: 'calc(var(--nav-height) + 3rem)',
        paddingBottom: '4rem',
      }}>
        <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
