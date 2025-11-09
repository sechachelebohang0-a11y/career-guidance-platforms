import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Footer from './components/common/Footer';
import theme from './styles/theme';
import { authAPI } from './services/api';

// Import pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardRedirect from './pages/DashboardRedirect';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const result = await authAPI.testConnection();
      
      if (result.success) {
        setBackendStatus('connected');
        showSnackbar('✅ Successfully connected to backend', 'success');
      } else {
        setBackendStatus('disconnected');
        showSnackbar('❌ Backend connection failed', 'error');
      }
    } catch (error) {
      setBackendStatus('disconnected');
      showSnackbar('❌ Cannot connect to backend server', 'error');
      console.error('Backend connection error:', error);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'checking': return 'warning';
      default: return 'info';
    }
  };

  const getStatusMessage = () => {
    switch (backendStatus) {
      case 'connected': return 'Backend: Connected ✅';
      case 'disconnected': return 'Backend: Disconnected ❌';
      case 'checking': return 'Backend: Checking... 🔄';
      default: return 'Backend: Unknown';
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {/* Connection Status Banner */}
              {backendStatus !== 'connected' && (
                <Alert 
                  severity={getStatusColor()} 
                  sx={{ 
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  action={
                    backendStatus === 'checking' ? (
                      <CircularProgress size={20} />
                    ) : (
                      <span 
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={checkBackendConnection}
                      >
                        Retry
                      </span>
                    )
                  }
                >
                  {getStatusMessage()}
                </Alert>
              )}

              <Box sx={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/dashboard" element={<DashboardRedirect />} />

                  {/* Protected Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/*"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/institution/*"
                    element={
                      <ProtectedRoute allowedRoles={['institution']}>
                        <InstitutionDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/company/*"
                    element={
                      <ProtectedRoute allowedRoles={['company']}>
                        <CompanyDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </Router>

          {/* Global Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;