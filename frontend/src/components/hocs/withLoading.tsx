import React, { ComponentType, useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface WithLoadingProps {
  fullScreen?: boolean;
  showSpinner?: boolean;
  message?: string;
}

export function withLoading<P extends object>(
  Component: ComponentType<P>,
  options: WithLoadingProps = {}
) {
  const {
    fullScreen = false,
    showSpinner = true,
    message = 'Loading...'
  } = options;

  return function WithLoadingComponent(props: P) {
    const [isLoading, setIsLoading] = useState(false);

    const setLoading = (loading: boolean) => {
      setIsLoading(loading);
    };

    // Expose loading state to wrapped component
    const enhancedProps = {
      ...props,
      isLoading,
      setLoading
    };

    if (isLoading && showSpinner) {
      return (
        <LoadingSpinner
          message={message}
          fullScreen={fullScreen}
        />
      );
    }

    return <Component {...enhancedProps} />;
  };
}

// Convenience HOCs for common use cases
export const withFullScreenLoading = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { fullScreen: true, showSpinner: true });

export const withInlineLoading = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { fullScreen: false, showSpinner: true });

export const withLoadingState = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { showSpinner: false });
