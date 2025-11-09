// src/pages/DashboardRedirect.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardRedirect = () => {
  const { user, loading, getDashboardPath } = useAuth();

  if (loading) {
    console.log('🔍 DashboardRedirect: Loading user data...');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('🔍 DashboardRedirect: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // FIXED: Now getDashboardPath can accept the user parameter
  const dashboardPath = getDashboardPath(user);
  console.log(`🔄 DashboardRedirect: Redirecting ${user.role} to: ${dashboardPath}`);
  
  return <Navigate to={dashboardPath} replace />;
};

export default DashboardRedirect;