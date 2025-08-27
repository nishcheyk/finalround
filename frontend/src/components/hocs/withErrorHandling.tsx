import React, { ComponentType, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface WithErrorHandlingProps {
  showErrorBoundary?: boolean;
  autoHideDuration?: number;
  position?: 'top' | 'bottom';
}

export function withErrorHandling<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorHandlingProps = {}
) {
  const {
    showErrorBoundary = true,
    autoHideDuration = 6000,
    position = 'top'
  } = options;

  return function WithErrorHandlingComponent(props: P) {
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
      setOpen(true);
    };

    const clearError = () => {
      setError(null);
      setOpen(false);
    };

    const handleClose = () => {
      setOpen(false);
    };

    // Expose error handling to wrapped component
    const enhancedProps = {
      ...props,
      error,
      handleError,
      clearError
    };

    return (
      <>
        <Component {...enhancedProps} />
        
        {showErrorBoundary && (
          <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ 
              vertical: position === 'top' ? 'top' : 'bottom', 
              horizontal: 'center' 
            }}
          >
            <Alert 
              onClose={handleClose} 
              severity="error" 
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}
      </>
    );
  };
}

// Convenience HOCs for common use cases
export const withTopErrorHandling = <P extends object>(Component: ComponentType<P>) =>
  withErrorHandling(Component, { position: 'top' });

export const withBottomErrorHandling = <P extends object>(Component: ComponentType<P>) =>
  withErrorHandling(Component, { position: 'bottom' });

export const withPersistentErrorHandling = <P extends object>(Component: ComponentType<P>) =>
  withErrorHandling(Component, { autoHideDuration: 0 });
