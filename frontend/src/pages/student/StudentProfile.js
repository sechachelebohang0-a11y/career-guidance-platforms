// src/pages/student/StudentProfile.js
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
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('success');
  const [newQualification, setNewQualification] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching student profile...');
      
      const response = await studentAPI.getProfile();
      console.log('🔍 Profile response:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Profile fetched successfully:', response.data.profile);
        setProfile(response.data.profile);
        setFormData(response.data.profile);
      } else {
        console.error('❌ Failed to fetch profile:', response.data?.message);
        setMessage('Failed to load profile');
        setMessageSeverity('error');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setMessage('Failed to load profile. Please try again.');
      setMessageSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Add this helper function for phone validation
const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') return true; // Phone is optional
  
  const cleanedPhone = phone.replace(/\s/g, ''); // Remove all spaces
  const phoneRegex = /^(\+?266)?[5-6][0-9]{7}$/; // More flexible Lesotho format
  
  return phoneRegex.test(cleanedPhone);
};

 // In the handleSave function, update error handling:
const handleSave = async () => {
  setSaving(true);
  setMessage('');
  
  try {
    // Validate required fields
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setMessage('First name and last name are required');
      setMessageSeverity('error');
      setSaving(false);
      return;
    }

    console.log('🔍 Saving profile data:', formData);
    
    // Prepare clean data for API - match backend expectations
    const cleanData = {
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      phone: formData.phone?.trim() || '',
      dateOfBirth: formData.dateOfBirth || null,
      address: formData.address?.trim() || '',
      qualifications: formData.qualifications || [],
      skills: formData.skills || []
    };

    // Remove empty strings that might cause validation issues
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '' || cleanData[key] === null) {
        delete cleanData[key];
      }
    });

    console.log('📤 Sending cleaned data:', cleanData);
    
    const response = await studentAPI.updateProfile(cleanData);
    console.log('✅ Save response:', response);
    
    if (response.data && response.data.success) {
      console.log('✅ Profile updated successfully');
      setProfile(cleanData);
      setFormData(cleanData);
      setEditMode(false);
      setMessage('Profile updated successfully!');
      setMessageSeverity('success');
    } else {
      console.error('❌ Profile update failed:', response.data?.message);
      setMessage(response.data?.message || 'Failed to update profile');
      setMessageSeverity('error');
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    // Enhanced error logging
    console.log('🔍 Full error details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    let errorMessage = 'Failed to update profile';
    
    if (error.response?.data?.errors) {
      // Show validation errors
      const validationErrors = error.response.data.errors;
      errorMessage = 'Please fix the following errors: ' + 
        validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      // Handle case where error message is in different format
      errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data);
    } else if (error.response) {
      errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      errorMessage = error.message || 'Failed to update profile';
    }
    
    setMessage(errorMessage);
    setMessageSeverity('error');
  } finally {
    setSaving(false);
  }
};

  const handleCancel = () => {
    setFormData(profile);
    setEditMode(false);
    setMessage('');
  };

  const handleCloseMessage = () => {
    setMessage('');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Student Profile
        </Typography>
        {!editMode ? (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {message && (
        <Alert 
          severity={messageSeverity} 
          sx={{ mb: 2 }}
          onClose={handleCloseMessage}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  disabled={!editMode}
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
  <              TextField
                 fullWidth
                 label="Phone"
                 name="phone"
                 value={formData.phone || ''}
                 onChange={handleChange}
                 disabled={!editMode}
                 placeholder="+266 1234 5678 or 5000 0000"
                 error={editMode && formData.phone && !validatePhone(formData.phone)}
                 helperText={editMode && formData.phone && !validatePhone(formData.phone) ? 
                   "Please enter a valid Lesotho phone number (e.g., +266 5012 3456 or 5012 3456)" : ""}
                />
              </Grid>
              
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth || ''}
                  onChange={handleChange}
                  disabled={!editMode}
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
                  placeholder="Enter your current address"
                />
              </Grid>
            </Grid>

            {/* Qualifications Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Qualifications
            </Typography>
            {editMode ? (
              <Box>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    fullWidth
                    label="Add Qualification"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddQualification();
                      }
                    }}
                    placeholder="e.g., High School Diploma, Bachelor's Degree in Computer Science"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddQualification}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.qualifications?.map((qual, index) => (
                    <Chip
                      key={index}
                      label={qual}
                      onDelete={() => handleRemoveQualification(index)}
                      color="primary"
                    />
                  ))}
                  {(!formData.qualifications || formData.qualifications.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No qualifications added yet
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.qualifications?.map((qual, index) => (
                  <Chip key={index} label={qual} color="primary" variant="outlined" />
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No qualifications added
                  </Typography>
                )}
              </Box>
            )}

            {/* Skills Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Skills
            </Typography>
            {editMode ? (
              <Box>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    fullWidth
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g., JavaScript, Python, Communication, Leadership"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddSkill}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.skills?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSkill(index)}
                      color="secondary"
                    />
                  ))}
                  {(!formData.skills || formData.skills.length === 0) && (
                    <Typography variant="body2" color="text.secondary">
                      No skills added yet
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.skills?.map((skill, index) => (
                  <Chip key={index} label={skill} color="secondary" variant="outlined" />
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No skills added
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Qualifications
                </Typography>
                <Typography variant="body1">
                  {formData.qualifications?.length || 0} qualifications
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Skills
                </Typography>
                <Typography variant="body1">
                  {formData.skills?.length || 0} skills
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Transcripts
                </Typography>
                <Typography variant="body1">
                  {formData.transcripts?.length || 0} uploaded
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Certificates
                </Typography>
                <Typography variant="body1">
                  {formData.certificates?.length || 0} uploaded
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Debug Info Card - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Debug Information
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {JSON.stringify(formData, null, 2)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;