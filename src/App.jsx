// ============================================
// BIT SOFTWARE — App.jsx
// ============================================

import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '@/app/store';
import { router } from '@/router';
import { ToastProvider } from '@/components/common/Toast/Toast';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </GoogleOAuthProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
