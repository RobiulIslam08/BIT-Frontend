// ============================================
// BIT SOFTWARE — API HOOK
// ============================================
// API call-এর জন্য loading/error/data state management

import { useState, useCallback } from 'react';

/**
 * Generic API call hook
 * @param {Function} apiFunction - API function to call (e.g. servicesApi.getAll)
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(servicesApi.getAll);
 *   useEffect(() => { execute({ page: 1 }); }, []);
 */
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}
