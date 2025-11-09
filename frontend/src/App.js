// src/App.js (Updated with Footer)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Footer from './components/common/Footer';
import theme from './styles/theme';

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

// In your App.js - Add this function to handle dashboard routing
const getDashboardRoute = (user) => {
  if (!user) return '/';
  switch (user.role) {
    case 'admin': return '/admin/dashboard';
    case 'student': return '/student/dashboard';
    case 'institution': return '/institution/dashboard';
    case 'company': return '/company/dashboard';
    default: return '/';
  }
};

// Use it in your login success handler
// navigate(getDashboardRoute(userData));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;