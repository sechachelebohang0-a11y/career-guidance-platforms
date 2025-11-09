// src/pages/institution/InstitutionProfile.js - UPDATED
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { institutionAPI } from '../../services/api';

const InstitutionProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await institutionAPI.getProfile();
      if (response.data.success) {
        setProfile(response.data.profile);
        setFormData(response.data.profile);
      } else {
        setMessage('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to load profile');
      setErrorDetails(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (message || errorDetails) {
      setMessage('');
      setErrorDetails('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setErrorDetails('');
    setFieldErrors({});

    try {
      // Simple validation
      const validationErrors = {};
      
      if (!formData.name?.trim()) {
        validationErrors.name = 'Institution name is required';
      }

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setMessage('Please fix the validation errors');
        setSaving(false);
        return;
      }

      // Prepare data
      const submitData = {
        name: formData.name?.trim(),
        phone: formData.phone || '',
        website: formData.website || '',
        address: formData.address || '',
        description: formData.description || '',
      };

      console.log('🔄 Submitting profile data:', submitData);

      const response = await institutionAPI.updateProfile(submitData);
      
      if (response.data.success) {
        setProfile(response.data.profile || submitData);
        setEditMode(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
        setErrorDetails(response.data.message || 'Server returned an error');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      console.error('🔍 Error response:', error.response?.data);
      
      setMessage('Failed to update profile');
      
      if (error.response?.status === 400 || error.response?.status === 422) {
        const serverData = error.response.data;
        
        console.log('📋 Server error details:', serverData);

        if (serverData.errors && Array.isArray(serverData.errors)) {
          const formattedErrors = {};
          serverData.errors.forEach(err => {
            const fieldName = err.field || err.path || err.param;
            const errorMessage = err.message || err.msg;
            
            if (fieldName) {
              formattedErrors[fieldName] = errorMessage;
            }
          });
          
          setFieldErrors(formattedErrors);
          setErrorDetails('Please check the highlighted fields');
        } else if (serverData.message) {
          setErrorDetails(serverData.message);
        } else {
          setErrorDetails('Validation failed. Please check your input.');
        }
      } else if (error.response) {
        setErrorDetails(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setErrorDetails('Network error: Could not connect to server');
      } else {
        setErrorDetails(error.message || 'An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditMode(false);
    setMessage('');
    setErrorDetails('');
    setFieldErrors({});
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Institution Profile
        </Typography>
        {!editMode ? (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }} disabled={saving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave} 
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {message && (
        <Alert 
          severity={message.includes('successfully') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => {
            setMessage('');
            setErrorDetails('');
          }}
        >
          {message}
          {errorDetails && !message.includes('successfully') && (
            <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
              {errorDetails}
            </Box>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Institution Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institution Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name || 'Required'}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone || 'Optional'}
                  placeholder="+266 2231 5767"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!fieldErrors.website}
                  helperText={fieldErrors.website || 'Optional'}
                  placeholder="https://www.example.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address || 'Optional'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description || 'Optional - describe your institution'}
                  placeholder="Brief description of your institution..."
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Institution Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {profile?.status || 'Active'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Registration Date
                </Typography>
                <Typography variant="body1">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstitutionProfile;