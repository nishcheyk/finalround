import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiCallOptions {
  showLoadingToast?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
) {
  const {
    showLoadingToast = false,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (showLoadingToast) {
      toast.info('Processing...', { autoClose: false, toastId: 'loading' });
    }

    try {
      const result = await apiCall(...args);
      setState({ data: result, loading: false, error: null });
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (showLoadingToast) {
        toast.dismiss('loading');
      }
      
      return result;
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || errorMessage;
      setState({ data: null, loading: false, error: errorMsg });
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      if (showLoadingToast) {
        toast.dismiss('loading');
      }
      
      throw error;
    }
  }, [apiCall, showLoadingToast, showErrorToast, showSuccessToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setError,
    setData
  };
}

// Specialized hooks for common API patterns
export function useMutation<T = any>(
  mutationFn: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
) {
  return useApi(mutationFn, {
    showLoadingToast: true,
    showErrorToast: true,
    showSuccessToast: true,
    ...options
  });
}

export function useQuery<T = any>(
  queryFn: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
) {
  return useApi(queryFn, {
    showErrorToast: true,
    ...options
  });
}
