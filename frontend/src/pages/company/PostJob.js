// src/pages/company/PostJob.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
} from '@mui/material';
import { companyAPI } from '../../services/api';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [],
    qualifications: [],
    deadline: '',
    location: '',
    salary: '',
    type: 'full-time',
    category: '',
  });
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentQualification, setCurrentQualification] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, currentRequirement.trim()],
      });
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const addQualification = () => {
    if (currentQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, currentQualification.trim()],
      });
      setCurrentQualification('');
    }
  };

  const removeQualification = (index) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await companyAPI.postJob(formData);
      if (response.data.success) {
        setMessage('Job posted successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          requirements: [],
          qualifications: [],
          deadline: '',
          location: '',
          salary: '',
          type: 'full-time',
          category: '',
        });
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Post New Job
      </Typography>

      {message && (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $50,000 - $70,000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Job Type"
                >
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Application Deadline"
                name="deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.deadline}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ mb: 2 }}>
                {formData.requirements.map((req, index) => (
                  <Chip
                    key={index}
                    label={req}
                    onDelete={() => removeRequirement(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Add Requirement"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button onClick={addRequirement} variant="outlined">
                  Add
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Qualifications
              </Typography>
              <Box sx={{ mb: 2 }}>
                {formData.qualifications.map((qual, index) => (
                  <Chip
                    key={index}
                    label={qual}
                    onDelete={() => removeQualification(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Add Qualification"
                  value={currentQualification}
                  onChange={(e) => setCurrentQualification(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addQualification();
                    }
                  }}
                />
                <Button onClick={addQualification} variant="outlined">
                  Add
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PostJob;