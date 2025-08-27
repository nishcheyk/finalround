import React, { ComponentType } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

interface WithAuthProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthProps = {}
) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = '/login'
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, isLoading } = useAppSelector(state => state.auth);
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (isLoading) {
      return <LoadingSpinner message="Checking authentication..." />;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If admin access is required but user is not admin
    if (requireAdmin && (!user || !user.isAdmin)) {
      return <Navigate to="/" replace />;
    }

    // If user is authenticated but shouldn't be (e.g., login page)
    if (!requireAuth && isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Convenience HOCs for common use cases
export const withPublicAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: false, redirectTo: '/' });

export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, requireAdmin: true, redirectTo: '/login' });

export const withUserAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, redirectTo: '/login' });
