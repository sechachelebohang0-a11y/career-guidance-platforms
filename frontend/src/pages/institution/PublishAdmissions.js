// src/pages/institution/PublishAdmissions.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Publish as PublishIcon } from '@mui/icons-material';
import { institutionAPI } from '../../services/api';

const PublishAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishData, setPublishData] = useState({
    courseId: '',
    admissionDate: '',
    deadline: '',
    requirements: '',
    notes: ''
  });

  useEffect(() => {
    fetchAdmissions();
    fetchCourses();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      // This would typically come from a separate admissions API
      const response = await institutionAPI.getApplications();
      if (response.data.success) {
        // Filter to show only admitted students for admissions management
        const admittedApplications = response.data.applications.filter(
          app => app.status === 'admitted'
        );
        setAdmissions(admittedApplications);
      }
    } catch (error) {
      setError('Failed to fetch admissions data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await institutionAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleOpenDialog = () => {
    setPublishData({
      courseId: '',
      admissionDate: '',
      deadline: '',
      requirements: '',
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePublishAdmission = async () => {
    try {
      setError('');
      setSuccess('');

      // This would typically call a separate admissions API
      // For now, we'll simulate the action
      console.log('Publishing admission:', publishData);
      
      setSuccess('Admission published successfully!');
      setDialogOpen(false);
      fetchAdmissions(); // Refresh data
    } catch (error) {
      setError('Failed to publish admission');
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
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
          Publish Admissions
        </Typography>
        <Button
          variant="contained"
          startIcon={<PublishIcon />}
          onClick={handleOpenDialog}
        >
          Publish New Admission
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Admitted Students */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admitted Students ({admissions.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Students who have been admitted to your courses.
              </Typography>

              {admissions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" align="center" py={4}>
                  No students admitted yet. Start by reviewing applications.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {admissions.map((admission) => (
                    <Grid item xs={12} md={6} key={admission.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {admission.student?.firstName} {admission.student?.lastName}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Chip 
                              label={getCourseName(admission.courseId)} 
                              size="small" 
                              sx={{ mr: 1, mb: 1 }}
                            />
                            <Chip 
                              label="Admitted" 
                              size="small" 
                              color="success"
                              sx={{ mb: 1 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Email: {admission.student?.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {admission.student?.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Admitted on: {new Date(admission.updatedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Admission Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admission Statistics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Total Admitted: {admissions.length}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Courses with Admissions: {new Set(admissions.map(a => a.courseId)).size}
                </Typography>
                <Typography variant="body2">
                  Latest Admission: {
                    admissions.length > 0 
                      ? new Date(Math.max(...admissions.map(a => new Date(a.updatedAt)))).toLocaleDateString()
                      : 'N/A'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => window.open('/institution/applications', '_self')}
                >
                  Review Applications
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => window.open('/institution/courses', '_self')}
                >
                  Manage Courses
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleOpenDialog}
                >
                  Publish New Admission Round
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Publish Admission Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Publish New Admission
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Course</InputLabel>
            <Select
              value={publishData.courseId}
              onChange={(e) => setPublishData({ ...publishData, courseId: e.target.value })}
              label="Course"
            >
              {courses.filter(course => course.isActive).map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Admission Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={publishData.admissionDate}
            onChange={(e) => setPublishData({ ...publishData, admissionDate: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Application Deadline"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={publishData.deadline}
            onChange={(e) => setPublishData({ ...publishData, deadline: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Requirements"
            value={publishData.requirements}
            onChange={(e) => setPublishData({ ...publishData, requirements: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="List any specific requirements for this admission round..."
          />

          <TextField
            fullWidth
            label="Additional Notes"
            value={publishData.notes}
            onChange={(e) => setPublishData({ ...publishData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            placeholder="Any additional information for applicants..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handlePublishAdmission}
            variant="contained"
            disabled={!publishData.courseId || !publishData.admissionDate || !publishData.deadline}
          >
            Publish Admission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishAdmissions;