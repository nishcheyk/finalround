import React, { ComponentType, useState, useCallback } from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface WithLoadingProps {
  loadingMessage?: string;
  showSpinner?: boolean;
  fullScreen?: boolean;
}

export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingProps = {}
) {
  const {
    loadingMessage = "Loading...",
    showSpinner = true,
    fullScreen = false
  } = options;

  return function LoadingComponent(props: P) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(loadingMessage);

    const startLoading = useCallback((message?: string) => {
      setIsLoading(true);
      if (message) {
        setLoadingText(message);
      }
    }, []);

    const stopLoading = useCallback(() => {
      setIsLoading(false);
      setLoadingText(loadingMessage);
    }, [loadingMessage]);

    const setLoadingMessage = useCallback((message: string) => {
      setLoadingText(message);
    }, []);

    // Show loading spinner if loading and spinner is enabled
    if (isLoading && showSpinner) {
      return (
        <LoadingSpinner 
          message={loadingText} 
          fullScreen={fullScreen} 
        />
      );
    }

    return (
      <WrappedComponent
        {...props}
        isLoading={isLoading}
        startLoading={startLoading}
        stopLoading={stopLoading}
        setLoadingMessage={setLoadingMessage}
      />
    );
  };
}

// Convenience HOCs for common loading patterns
export const withFullScreenLoading = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { fullScreen: true, showSpinner: true });

export const withInlineLoading = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { fullScreen: false, showSpinner: true });

export const withLoadingState = <P extends object>(Component: ComponentType<P>) =>
  withLoading(Component, { showSpinner: false });
