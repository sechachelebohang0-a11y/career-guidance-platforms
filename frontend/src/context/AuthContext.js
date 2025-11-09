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
  const [authServiceStatus, setAuthServiceStatus] = useState('checking');
  const [lastAuthCheck, setLastAuthCheck] = useState(null);

  // Enhanced retry function with timeout
  const apiWithRetry = async (apiCall, maxRetries = 3, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if ((error.response?.status === 503 || error.code === 'ECONNABORTED' || !error.response) && attempt < maxRetries) {
          const delay = delayMs * attempt;
          console.log(`⏱️ Retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  // Direct auth test - try to make a simple auth call
  const testAuthDirectly = async () => {
    try {
      console.log('🔐 Testing authentication service directly...');
      // Try to call a simple auth endpoint that doesn't require full initialization
      const response = await apiWithRetry(() => authAPI.testConnection(), 2, 1000);
      return { success: true, direct: true };
    } catch (error) {
      console.log('❌ Direct auth test failed, trying health check...');
      
      // Fallback to health check
      try {
        const healthResponse = await apiWithRetry(() => authAPI.healthCheck(), 1, 1000);
        const firebaseReady = healthResponse.data.firebase?.initialized;
        
        if (firebaseReady) {
          return { success: true, viaHealthCheck: true };
        } else {
          return { 
            success: false, 
            reason: 'Firebase not initialized in health check',
            firebaseStatus: healthResponse.data.firebase
          };
        }
      } catch (healthError) {
        return { 
          success: false, 
          reason: 'Health check also failed',
          error: healthError.message 
        };
      }
    }
  };

  // Check authentication service status with multiple strategies
  const checkAuthService = async () => {
    const now = new Date();
    setLastAuthCheck(now);
    
    try {
      console.log('🔐 Checking authentication service status...');
      
      // Strategy 1: Direct connection test
      const directResult = await testAuthDirectly();
      
      if (directResult.success) {
        setAuthServiceStatus('ready');
        console.log('✅ Authentication service is ready');
        return true;
      } else {
        console.log('🔄 Authentication service not ready:', directResult.reason);
        
        // Strategy 2: Try to make a test login (with test credentials)
        // This will actually test if Firebase Auth is working
        try {
          console.log('🧪 Testing auth with dummy request...');
          // We'll use a timeout to avoid long waits
          const testPromise = authAPI.login({ 
            email: 'test@test.com', 
            password: 'wrongpassword' 
          });
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth test timeout')), 5000)
          );
          
          const response = await Promise.race([testPromise, timeoutPromise]);
          
          // If we get any response (even error), auth service is responding
          if (response) {
            setAuthServiceStatus('ready');
            console.log('✅ Auth service responding (got response)');
            return true;
          }
        } catch (authTestError) {
          // If we get a 400/401, it means auth service is working but credentials are wrong
          if (authTestError.response?.status === 400 || authTestError.response?.status === 401) {
            setAuthServiceStatus('ready');
            console.log('✅ Auth service is working (got expected error)');
            return true;
          }
          
          // If we get 503 or timeout, service is still starting
          if (authTestError.response?.status === 503 || authTestError.message === 'Auth test timeout') {
            setAuthServiceStatus('starting');
            console.log('🔄 Auth service still starting...');
            return false;
          }
        }
        
        setAuthServiceStatus('starting');
        return false;
      }
    } catch (error) {
      console.log('❌ Auth service check failed completely:', error.message);
      setAuthServiceStatus('unavailable');
      return false;
    }
  };

  // Force auth service to ready state after reasonable time (fallback)
  const enableFallbackMode = () => {
    console.log('🔄 Enabling fallback mode - assuming auth service is ready');
    setAuthServiceStatus('ready');
  };

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
        const connectionTest = await apiWithRetry(() => authAPI.testConnection());
        
        if (connectionTest.success) {
          setBackendStatus('online');
          console.log('✅ Backend is online');
          
          // Now check authentication service status
          const authReady = await checkAuthService();
          
          if (!authReady) {
            // Set timeout to enable fallback mode after 3 minutes
            setTimeout(() => {
              if (authServiceStatus !== 'ready') {
                console.log('⏰ 3-minute timeout reached, enabling fallback mode');
                enableFallbackMode();
              }
            }, 180000); // 3 minutes
          }
        } else {
          setBackendStatus('offline');
          console.warn('⚠️ Backend is offline');
        }
      } catch (error) {
        setBackendStatus('offline');
        console.error('❌ Backend connection test failed:', error);
      }

      // Restore user session if we have credentials
      if (token && userData) {
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

  const getDashboardPath = (userParam = null) => {
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
      console.log('🔐 Login attempt for:', email);
      
      // If auth service is "starting" but we've been trying for a while, force attempt
      const shouldForceAttempt = authServiceStatus === 'starting' && lastAuthCheck && 
        (new Date() - lastAuthCheck) > 120000; // 2 minutes
      
      if (backendStatus === 'offline' && !shouldForceAttempt) {
        return { 
          success: false, 
          message: 'Backend server is starting up. Please try again in a moment.',
          retryable: true
        };
      }

      if (authServiceStatus !== 'ready' && !shouldForceAttempt) {
        // Re-check auth service status
        const authReady = await checkAuthService();
        if (!authReady) {
          return { 
            success: false, 
            message: 'Authentication service is starting up. Please try again in a moment.',
            retryable: true
          };
        }
      }

      console.log('🚀 Attempting login despite service status...');
      const response = await apiWithRetry(() => authAPI.login({ email, password }));
      
      console.log('🔍 Login response:', response.data);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('🔍 Setting user state after login:', userData);
        setUser(userData);
        setAuthServiceStatus('ready'); // Mark as ready since login worked
        
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
      let retryable = false;
      
      if (error.response?.status === 503) {
        errorMessage = 'Authentication service is starting up. Please try again in a moment.';
        retryable = true;
        setAuthServiceStatus('starting');
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. The service might be starting up.';
        retryable = true;
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. The backend might be deploying.';
        retryable = true;
      } else if (error.response?.status === 400 || error.response?.status === 401) {
        // These are actual auth errors, not service errors
        errorMessage = error.response?.data?.message || 'Invalid email or password';
        setAuthServiceStatus('ready'); // Service is working if we get proper auth errors
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      }
      
      return { 
        success: false, 
        message: errorMessage,
        retryable
      };
    }
  };

  const register = async (userData) => {
    try {
      // Similar logic to login for auth service check
      const shouldForceAttempt = authServiceStatus === 'starting' && lastAuthCheck && 
        (new Date() - lastAuthCheck) > 120000;

      if (backendStatus === 'offline' && !shouldForceAttempt) {
        return { 
          success: false, 
          message: 'Backend server is starting up. Please try again in a moment.',
          retryable: true
        };
      }

      if (authServiceStatus !== 'ready' && !shouldForceAttempt) {
        const authReady = await checkAuthService();
        if (!authReady) {
          return { 
            success: false, 
            message: 'Authentication service is starting up. Please try again in a moment.',
            retryable: true
          };
        }
      }

      const response = await apiWithRetry(() => authAPI.register(userData));
      setAuthServiceStatus('ready'); // Mark as ready since registration worked
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      let retryable = false;
      
      if (error.response?.status === 503) {
        errorMessage = 'Authentication service is starting up. Please try again in a moment.';
        retryable = true;
        setAuthServiceStatus('starting');
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. The service might be starting up.';
        retryable = true;
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. The backend might be deploying.';
        retryable = true;
      } else {
        errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      }
      
      return { 
        success: false, 
        message: errorMessage,
        retryable
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
      const result = await apiWithRetry(() => authAPI.testConnection());
      setBackendStatus(result.success ? 'online' : 'offline');
      
      if (result.success) {
        await checkAuthService();
      }
      
      return result;
    } catch (error) {
      setBackendStatus('offline');
      return { success: false, error: error.message };
    }
  };

  const checkAuthServiceStatus = async () => {
    return await checkAuthService();
  };

  const forceAuthReady = () => {
    setAuthServiceStatus('ready');
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
    authServiceStatus,
    checkBackendStatus,
    checkAuthServiceStatus,
    forceAuthReady,
    getDashboardPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;