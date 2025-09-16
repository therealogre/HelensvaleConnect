import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const { state } = useAuth();
  const location = useLocation();
  const { user, isAuthenticated, loading } = state;

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If specific role is required, check user role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user's actual role
    const roleRedirects = {
      'customer': '/dashboard/customer',
      'vendor': '/dashboard/welcome',
      'admin': '/dashboard/admin'
    };
    
    const defaultRedirect = user?.role ? roleRedirects[user.role] || '/dashboard' : '/';
    return <Navigate to={defaultRedirect} replace />;
  }

  // If user is authenticated but email is not verified (for sensitive operations)
  if (requireAuth && user && !user.isEmailVerified && location.pathname.includes('/settings')) {
    return (
      <Box p={3} textAlign="center">
        <h2>Email Verification Required</h2>
        <p>Please verify your email address to access account settings.</p>
        <button onClick={() => window.location.href = '/dashboard'}>
          Return to Dashboard
        </button>
      </Box>
    );
  }

  // All checks passed, render the protected component
  return children;
};

// Higher-order component for easier usage
export const withAuth = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const CustomerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="customer">
    {children}
  </ProtectedRoute>
);

export const VendorRoute = ({ children }) => (
  <ProtectedRoute requiredRole="vendor">
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
