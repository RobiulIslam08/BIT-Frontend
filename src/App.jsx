// ============================================
// BIT SOFTWARE — App.jsx
// ============================================

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '@/app/store';
import { router } from '@/router';
import { ToastProvider } from '@/components/common/Toast/Toast';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { trackPageView } from '@/utils/analytics';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  // Google Analytics — initial load + protiti route change-e page view track kora hoy
  useEffect(() => {
    let lastPath = '';

    const send = (location) => {
      const path = `${location.pathname}${location.search}`;
      if (path === lastPath) return;
      lastPath = path;
      trackPageView(path);
    };

    // Prothom load
    send(window.location);

    // Route change (SPA navigation)
    const unsubscribe = router.subscribe((state) => {
      if (state.navigation.state === 'idle') {
        send(state.location);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <HelmetProvider>
      <Provider store={store}>
        <CurrencyProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </GoogleOAuthProvider>
        </CurrencyProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
