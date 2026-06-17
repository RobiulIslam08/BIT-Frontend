// ============================================
// BIT SOFTWARE — App.jsx
// ============================================

import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@/app/store';
import { router } from '@/router';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HelmetProvider>
  );
}

export default App;
