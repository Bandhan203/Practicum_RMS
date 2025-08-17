import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (user?.role) {
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      case 'admin':
      case 'chef':
      case 'waiter':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/public" replace />;
    }
  }

  // Check if user's role is in allowed roles list
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on user's actual role
    switch (user?.role) {
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      case 'admin':
      case 'chef':
      case 'waiter':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/public" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      case 'admin':
      case 'chef':
      case 'waiter':
        return <Navigate to="/dashboard" replace />;
      default:
        return children;
    }
  }

  // User is not authenticated, show public route
  return children;
}
