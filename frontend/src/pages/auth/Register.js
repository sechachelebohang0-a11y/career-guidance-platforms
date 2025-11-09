// src/pages/auth/Register.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const Register = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    institutionName: '',
    address: '',
    website: '',
    companyName: '',
    industry: '',
    size: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, backendStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.role) {
      setFormData(prev => ({ ...prev, role: location.state.role }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
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
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="role"
              label="I am a"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="institution">Institution</MenuItem>
              <MenuItem value="company">Company</MenuItem>
            </TextField>
          </>
        );
      case 1:
        if (formData.role === 'student') {
          return (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Student Information
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </>
          );
        } else if (formData.role === 'institution') {
          return (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Institution Information
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                name="institutionName"
                label="Institution Name"
                value={formData.institutionName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="address"
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                fullWidth
                name="website"
                label="Website"
                value={formData.website}
                onChange={handleChange}
                disabled={loading}
              />
            </>
          );
        } else {
          return (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Company Information
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                name="companyName"
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="industry"
                label="Industry"
                value={formData.industry}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                select
                name="size"
                label="Company Size"
                value={formData.size}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="1-10">1-10 employees</MenuItem>
                <MenuItem value="11-50">11-50 employees</MenuItem>
                <MenuItem value="51-200">51-200 employees</MenuItem>
                <MenuItem value="201-500">201-500 employees</MenuItem>
                <MenuItem value="501+">501+ employees</MenuItem>
              </TextField>
            </>
          );
        }
      default:
        return 'Unknown step';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (backendStatus === 'offline') {
      setError('Cannot connect to server. Please make sure the backend is running on port 5001.');
      return;
    }

    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      userData: {}
    };

    if (formData.role === 'student') {
      userData.userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };
    } else if (formData.role === 'institution') {
      userData.userData = {
        name: formData.institutionName,
        address: formData.address,
        phone: formData.phone,
        website: formData.website
      };
    } else {
      userData.userData = {
        name: formData.companyName,
        industry: formData.industry,
        size: formData.size
      };
    }

    const result = await register(userData);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Registration successful! Please login with your credentials.' }
      });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const steps = ['Account Information', 'Profile Details'];

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
            minHeight: '80vh'
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold">
              Create Account
            </Typography>

            {backendStatus === 'offline' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Cannot connect to server. Please ensure the backend is running on port 5001.
              </Alert>
            )}

            <Stepper activeStep={step} sx={{ mb: 4, mt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={step === 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {getStepContent(step)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  disabled={step === 0 || loading}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || backendStatus === 'offline'}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 
                  step === steps.length - 1 ? 'Register' : 'Next'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Register;