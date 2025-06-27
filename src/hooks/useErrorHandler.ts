import { useState, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface ErrorState {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((
    err: Error | PostgrestError | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      retryable = false
    } = options;

    let errorState: ErrorState;

    if (typeof err === 'string') {
      errorState = {
        message: err,
        timestamp: new Date()
      };
    } else if ('code' in err && 'message' in err) {
      // PostgrestError
      errorState = {
        message: err.message,
        code: err.code,
        details: err.details,
        timestamp: new Date()
      };
    } else {
      // Regular Error
      errorState = {
        message: err.message,
        timestamp: new Date()
      };
    }

    setError(errorState);

    if (logError) {
      console.error('Application Error:', errorState);
    }

    if (showToast) {
      // Could integrate with a toast notification system
      console.warn('Error Toast:', errorState.message);
    }

    return errorState;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    if (!retryFn) return;

    setIsRetrying(true);
    try {
      const result = await retryFn();
      clearError();
      return result;
    } catch (err) {
      handleError(err as Error, { retryable: false });
    } finally {
      setIsRetrying(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retry,
    isRetrying
  };
};

// Specialized error handlers for common scenarios
export const useApiErrorHandler = () => {
  const { handleError, ...rest } = useErrorHandler();

  const handleApiError = useCallback((err: any) => {
    if (err?.code === 'PGRST116') {
      return handleError('No data found', { showToast: false });
    }
    
    if (err?.code === 'PGRST301') {
      return handleError('Unauthorized access', { retryable: false });
    }

    if (err?.message?.includes('JWT')) {
      return handleError('Session expired. Please log in again.', { retryable: false });
    }

    return handleError(err, { retryable: true });
  }, [handleError]);

  return {
    handleApiError,
    handleError,
    ...rest
  };
};