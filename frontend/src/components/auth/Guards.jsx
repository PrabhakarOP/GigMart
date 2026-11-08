import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';
import { dashboardPathFor } from '../../lib/format';

/**
 * Generic Protected Route based on role
 */
export function RoleRoute({ allow = [], children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen message="Verifying session..." id="guard-loading-screen" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow.length > 0 && !allow.includes(user.role)) {
    return <Navigate to={dashboardPathFor(user.role)} replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  return <RoleRoute allow={['WORKER', 'PROVIDER', 'ADMIN']}>{children}</RoleRoute>;
}

export function ProviderRoute({ children }) {
  return <RoleRoute allow={['PROVIDER']}>{children}</RoleRoute>;
}

export function WorkerRoute({ children }) {
  return <RoleRoute allow={['WORKER']}>{children}</RoleRoute>;
}

export function AdminRoute({ children }) {
  return <RoleRoute allow={['ADMIN']}>{children}</RoleRoute>;
}

/**
 * GuestRoute: Redirect logged-in users to their respective dashboard
 */
export function GuestRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingScreen message="Checking authorization..." id="guest-guard-loading" />;
  }

  if (user) {
    const from = location.state?.from?.pathname || dashboardPathFor(user.role);
    return <Navigate to={from} replace />;
  }

  return children;
}

