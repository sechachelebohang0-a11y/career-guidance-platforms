import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [authServiceStatus, setAuthServiceStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetry, setAutoRetry] = useState(false);
  const [showForceAttemptDialog, setShowForceAttemptDialog] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const { login, backendStatus, authServiceStatus: contextAuthStatus, checkBackendStatus, checkAuthServiceStatus, forceAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    testConnection();
    
    // Timer to show how long we've been waiting
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setAuthServiceStatus(contextAuthStatus);
  }, [contextAuthStatus]);

  // Auto-retry when auth service is starting
  useEffect(() => {
    let retryTimer;
    
    if (autoRetry && authServiceStatus === 'starting' && retryCount < 10) {
      retryTimer = setTimeout(() => {
        console.log(`🔄 Auto-retry attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        handleTestAuthService();
      }, 10000); // Retry every 10 seconds instead of 5
    }

    // If we've been waiting too long, suggest force attempt
    if (timeElapsed > 180 && authServiceStatus === 'starting') { // 3 minutes
      setShowForceAttemptDialog(true);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [autoRetry, authServiceStatus, retryCount, timeElapsed]);

  const testConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const result = await checkBackendStatus();
      
      if (result.success) {
        setConnectionStatus('connected');
        console.log('✅ Backend is connected and ready');
        
        // Now test auth service
        await handleTestAuthService();
      } else {
        setConnectionStatus('failed');
        console.error('❌ Backend connection failed');
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('❌ Connection test error:', error);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestAuthService = async () => {
    try {
      const result = await checkAuthServiceStatus();
      if (result) {
        setAuthServiceStatus('ready');
        setAutoRetry(false);
      } else {
        setAuthServiceStatus('starting');
        setAutoRetry(true); // Start auto-retry
      }
    } catch (error) {
      setAuthServiceStatus('unavailable');
      console.error('❌ Auth service test error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (connectionStatus === 'failed') {
      setError('Backend service is starting up. Please try again in a moment.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      if (result.retryable) {
        setRetryCount(prev => prev + 1);
        setAutoRetry(true);
      }
    }
    
    setLoading(false);
  };

  const handleForceAttempt = () => {
    setShowForceAttemptDialog(false);
    forceAuthReady();
    setAuthServiceStatus('ready');
    setError('Service status overridden. Try logging in again.');
  };

  const handleRetryConnection = () => {
    setTestingConnection(true);
    setConnectionStatus('checking');
    setAuthServiceStatus('checking');
    setRetryCount(0);
    setAutoRetry(false);
    setTimeElapsed(0);
    testConnection();
  };

  const getStatusMessage = () => {
    if (connectionStatus === 'failed') {
      return '⚠️ Backend service is starting up...';
    }
    
    if (authServiceStatus === 'starting') {
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      return `🔄 Authentication service is starting up... (${minutes}m ${seconds}s)`;
    }
    
    if (authServiceStatus === 'ready' && connectionStatus === 'connected') {
      return '✅ All services are ready!';
    }
    
    if (connectionStatus === 'connected') {
      return '✅ Connected to backend successfully!';
    }
    
    return '🔄 Testing connection to Render backend...';
  };

  const getStatusSeverity = () => {
    if (connectionStatus === 'failed') return 'warning';
    if (authServiceStatus === 'starting') {
      if (timeElapsed > 120) return 'warning'; // After 2 minutes, show warning
      return 'info';
    }
    if (authServiceStatus === 'ready' && connectionStatus === 'connected') return 'success';
    return 'info';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Sign In
            </Typography>
            
            {/* Connection Status */}
            <Alert severity={getStatusSeverity()} sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {(testingConnection || authServiceStatus === 'starting') && (
                  <CircularProgress size={16} />
                )}
                {getStatusMessage()}
              </Box>
              
              {/* Progress indicator for auth service startup */}
              {authServiceStatus === 'starting' && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Waiting for authentication services... {formatTime(timeElapsed)}
                    {retryCount > 0 && ` • Auto-retry ${retryCount}/10`}
                    {timeElapsed > 120 && ` • Taking longer than expected`}
                  </Typography>
                </Box>
              )}
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                {authServiceStatus === 'starting' && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    The system is automatically retrying every 10 seconds...
                  </Typography>
                )}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || testingConnection}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={16} />
                    Signing In...
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
              <Box textAlign="center">
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>

            {/* Service Status Info */}
            {(connectionStatus === 'failed' || authServiceStatus === 'starting') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Service Status:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Backend: {connectionStatus === 'failed' ? '🔄 Starting...' : '✅ Connected'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Authentication: {authServiceStatus === 'starting' ? '🔄 Starting...' : authServiceStatus === 'ready' ? '✅ Ready' : '❌ Unavailable'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Render deployments can take 2-3 minutes to fully start all services.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleRetryConnection}
                    sx={{ flex: 1 }}
                  >
                    Check Status
                  </Button>
                  {timeElapsed > 120 && (
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => setShowForceAttemptDialog(true)}
                      sx={{ flex: 1 }}
                    >
                      Force Attempt
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Force Attempt Dialog */}
      <Dialog open={showForceAttemptDialog} onClose={() => setShowForceAttemptDialog(false)}>
        <DialogTitle>Service Taking Longer Than Expected</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The authentication service has been starting for over 3 minutes. This is longer than usual.
            
            You can:
            <br />
            • Wait a bit longer (sometimes takes 5+ minutes)
            <br />
            • Force attempt login (may work if service is ready but status detection failed)
            <br />
            • Check your Render deployment logs for errors
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForceAttemptDialog(false)}>Wait More</Button>
          <Button onClick={handleForceAttempt} variant="contained">
            Force Login Attempt
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;