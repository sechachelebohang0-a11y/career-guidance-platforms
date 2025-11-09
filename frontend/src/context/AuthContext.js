// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 AuthProvider - Initializing auth:', { 
        token: !!token, 
        hasUserData: !!userData 
      });

      // Test backend connection first
      try {
        console.log('🔍 Testing backend connection...');
        const connectionTest = await authAPI.testConnection();
        
        if (connectionTest.success) {
          setBackendStatus('online');
          console.log('✅ Backend is online');
        } else {
          setBackendStatus('offline');
          console.warn('⚠️ Backend is offline');
        }
      } catch (error) {
        setBackendStatus('offline');
        console.error('❌ Backend connection test failed:', error);
      }

      // Restore user session only if backend is online and we have a token
      if (token && userData && backendStatus === 'online') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 AuthProvider - User restored from storage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // FIXED: getDashboardPath function with optional parameter
  const getDashboardPath = (userParam = null) => {
    // Use the parameter if provided, otherwise use the context user
    const currentUser = userParam || user || JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!currentUser) {
      console.log('🔍 No user found for dashboard path, redirecting to home');
      return '/';
    }
    
    console.log('🔍 Determining dashboard path for role:', currentUser.role);
    
    switch (currentUser.role) {
      case 'student':
        return '/student/dashboard';
      case 'institution':
        return '/institution/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        console.warn('⚠️ Unknown user role:', currentUser.role);
        return '/';
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔍 Login attempt for:', email);
      
      // Check backend status first
      if (backendStatus === 'offline') {
        return { 
          success: false, 
          message: 'Backend server is unavailable. Please make sure the server is running on port 5001.' 
        };
      }

      const response = await authAPI.login({ email, password });
      
      console.log('🔍 Login response:', response.data);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('🔍 Setting user state after login:', userData);
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check if the backend server is running on port 5001.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5001.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Check backend status first
      if (backendStatus === 'offline') {
        return { 
          success: false, 
          message: 'Backend server is unavailable. Please make sure the server is running on port 5001.' 
        };
      }

      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check if the backend server is running.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5001.';
      } else {
        errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const logout = () => {
    console.log('🔍 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    return !!token && !!userData;
  };

  const checkBackendStatus = async () => {
    try {
      const result = await authAPI.testConnection();
      setBackendStatus(result.success ? 'online' : 'offline');
      return result;
    } catch (error) {
      setBackendStatus('offline');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    isInitialized,
    backendStatus,
    checkBackendStatus,
    getDashboardPath // Now properly defined and flexible
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;