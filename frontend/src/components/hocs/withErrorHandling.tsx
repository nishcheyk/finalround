import React, { ComponentType, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Box, Alert, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface WithErrorHandlingProps {
  showErrorBoundary?: boolean;
  onError?: (error: Error) => void;
}

export function withErrorHandling<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorHandlingProps = {}
) {
  const { showErrorBoundary = true, onError } = options;

  return function ErrorHandledComponent(props: P) {
    const [error, setError] = useState<Error | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const handleError = useCallback((err: Error) => {
      console.error('Error in component:', err);
      setError(err);
      
      // Show toast notification
      toast.error(err.message || 'An error occurred');
      
      // Call custom error handler if provided
      if (onError) {
        onError(err);
      }
    }, [onError]);

    const handleRetry = useCallback(() => {
      setIsRetrying(true);
      setError(null);
      
      // Simulate retry delay
      setTimeout(() => {
        setIsRetrying(false);
      }, 1000);
    }, []);

    const clearError = useCallback(() => {
      setError(null);
    }, []);

    // If there's an error and we want to show error boundary
    if (error && showErrorBoundary) {
      return (
        <Box p={3}>
          <Alert 
            severity="error" 
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            }
          >
            {error.message || 'Something went wrong'}
          </Alert>
        </Box>
      );
    }

    return (
      <WrappedComponent 
        {...props} 
        onError={handleError}
        clearError={clearError}
        isRetrying={isRetrying}
      />
    );
  };
}

// Convenience HOC for API error handling
export const withApiErrorHandling = <P extends object>(Component: ComponentType<P>) =>
  withErrorHandling(Component, { showErrorBoundary: true });
