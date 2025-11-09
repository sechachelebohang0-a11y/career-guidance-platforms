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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);

  const { register, backendStatus, checkBackendStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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
      setError('Backend service is starting up. Please try again in a moment.');
      return;
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare data for API
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
    };

    const result = await register(submitData);
    
    if (result.success) {
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please sign in.' 
        } 
      });
    } else {
      setError(result.message);
      if (result.retryable) {
        setRetryCount(prev => prev + 1);
      }
    }
    
    setLoading(false);
  };

  const handleRetryConnection = () => {
    setTestingConnection(true);
    setConnectionStatus('checking');
    setRetryCount(0);
    testConnection();
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return '✅ Connected to Render backend successfully!';
      case 'failed':
        return '⚠️ Backend service is starting up...';
      case 'checking':
        return '🔄 Testing connection to Render backend...';
      default:
        return 'Checking connection...';
    }
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Create Account
            </Typography>
            
            {/* Connection Status */}
            {testingConnection && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  {getStatusMessage()}
                </Box>
              </Alert>
            )}
            
            {connectionStatus === 'failed' && !testingConnection && (
              <Alert 
                severity="warning" 
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetryConnection}>
                    Retry
                  </Button>
                }
              >
                <Box>
                  <Typography variant="body2" gutterBottom>
                    {getStatusMessage()}
                  </Typography>
                  <Typography variant="caption" display="block">
                    This usually takes 1-2 minutes after deployment. Retry attempts: {retryCount}
                  </Typography>
                </Box>
              </Alert>
            )}
            
            {connectionStatus === 'connected' && !testingConnection && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {getStatusMessage()}
              </Alert>
            )}

            {error && connectionStatus !== 'failed' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading || connectionStatus === 'failed'}
                />
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading || connectionStatus === 'failed'}
                />
              </Box>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || connectionStatus === 'failed'}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || connectionStatus === 'failed'}
                />
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || connectionStatus === 'failed'}
                />
              </Box>

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                  disabled={loading || connectionStatus === 'failed'}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="institution">Institution</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading || connectionStatus === 'failed'}
              />

              <TextField
                margin="normal"
                fullWidth
                id="dateOfBirth"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading || connectionStatus === 'failed'}
              />

              <TextField
                margin="normal"
                fullWidth
                id="address"
                label="Address"
                name="address"
                autoComplete="street-address"
                multiline
                rows={2}
                value={formData.address}
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
                    Creating Account...
                  </Box>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <Box textAlign="center">
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>

            {/* Service Status Info */}
            {connectionStatus === 'failed' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Service Status:</strong> Backend is starting up...
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  • Render deployments can take 1-2 minutes to fully start
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Authentication services initialize automatically
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Try refreshing or retrying in a moment
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Register;