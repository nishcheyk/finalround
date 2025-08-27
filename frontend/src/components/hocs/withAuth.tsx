import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import LoadingSpinner from '../LoadingSpinner';

interface WithAuthProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  loadingMessage?: string;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthProps = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = '/login',
    loadingMessage = 'Checking authentication...'
  } = options;

  return function WithAuthComponent(props: P) {
    const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

    // Show loading while checking auth state
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }

    // Handle authentication requirements
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }

    // Handle admin requirements
    if (requireAdmin && (!user || !user.isAdmin)) {
      return <Navigate to="/" replace />;
    }

    // Redirect authenticated users away from auth pages
    if (!requireAuth && isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    // Render the component with auth context
    const enhancedProps = {
      ...props,
      user,
      isAuthenticated
    };

    return <Component {...enhancedProps} />;
  };
}

// Convenience HOCs for common use cases
export const withPublicAccess = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: false, redirectTo: '/' });

export const withUserAccess = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, redirectTo: '/login' });

export const withAdminAccess = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, requireAdmin: true, redirectTo: '/login' });
