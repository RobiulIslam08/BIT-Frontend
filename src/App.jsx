// ============================================
// BIT SOFTWARE — App.jsx
// ============================================

import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@/app/store';
import { router } from '@/router';
import { ToastProvider } from '@/components/common/Toast/Toast';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
