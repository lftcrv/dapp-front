import { useState, useCallback } from 'react';
import { Result } from './error-handler';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export const createInitialState = <T>(initialData?: T): AsyncState<T> => ({
  data: initialData || null,
  isLoading: false,
  error: null,
});

export const useAsyncState = <T>(initialData?: T) => {
  const [state, setState] = useState<AsyncState<T>>(
    createInitialState(initialData),
  );

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  const handleResult = useCallback(
    (result: Result<T>) => {
      if (result.success && result.data) {
        setData(result.data);
      } else if (result.error) {
        setError(result.error);
      }
    },
    [setData, setError],
  );

  return {
    ...state,
    setLoading,
    setError,
    setData,
    handleResult,
  };
};
