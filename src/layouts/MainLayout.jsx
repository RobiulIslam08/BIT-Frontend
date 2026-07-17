// ============================================
// BIT SOFTWARE — MainLayout (Public Pages)
// ============================================

import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar/Navbar';
import { Footer } from '@/components/common/Footer/Footer';
import { ScrollToTopOnNavigate, ScrollToTopButton } from '@/components/common/ScrollToTop';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

export function MainLayout() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTopOnNavigate />
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </>
  );
}
