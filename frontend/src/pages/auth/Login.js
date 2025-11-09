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

  const { login, backendStatus, checkBackendStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Test backend connection when component mounts
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const result = await checkBackendStatus();
      
      if (result.success) {
        setConnectionStatus('connected');
        console.log('✅ Backend is connected and ready');
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
      setError('Cannot connect to server. Please check if the Render deployment is running.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleRetryConnection = () => {
    setTestingConnection(true);
    setConnectionStatus('checking');
    testConnection();
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
            {testingConnection && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  Testing connection to Render backend...
                </Box>
              </Alert>
            )}
            
            {connectionStatus === 'failed' && !testingConnection && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetryConnection}>
                    Retry
                  </Button>
                }
              >
                Cannot connect to server. Please check if the Render deployment is running.
              </Alert>
            )}
            
            {connectionStatus === 'connected' && !testingConnection && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Connected to Render backend successfully!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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
                disabled={loading || connectionStatus === 'failed'}
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
                disabled={loading || connectionStatus === 'failed'}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || connectionStatus === 'failed' || testingConnection}
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
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Login;