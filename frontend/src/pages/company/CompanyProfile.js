// src/pages/company/CompanyProfile.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import { companyAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await companyAPI.getProfile();
      if (response.data.success) {
        setProfile(response.data.profile);
        setFormData(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await companyAPI.updateProfile(formData);
      if (response.data.success) {
        setProfile(formData);
        setEditMode(false);
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditMode(false);
    setMessage('');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Company Profile
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip 
            label={profile?.isApproved ? 'Approved' : 'Pending Approval'} 
            color={profile?.isApproved ? 'success' : 'warning'}
          />
          {!editMode ? (
            <Button variant="contained" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {message && (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Industry"
              name="industry"
              value={formData.industry || ''}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Size"
              name="size"
              value={formData.size || ''}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone || ''}
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
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyProfile;