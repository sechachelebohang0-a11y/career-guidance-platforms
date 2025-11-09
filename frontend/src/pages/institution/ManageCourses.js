// src/pages/institution/ManageCourses.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { institutionAPI } from '../../services/api';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    faculty: '',
    duration: '',
    totalSeats: '',
    availableSeats: '',
    requirements: '',
    fees: '',
    isActive: true
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await institutionAPI.getCourses();
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await institutionAPI.getFaculties();
      if (response.data.success) {
        setFaculties(response.data.faculties);
      }
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        description: course.description,
        faculty: course.faculty,
        duration: course.duration,
        totalSeats: course.totalSeats.toString(),
        availableSeats: course.availableSeats.toString(),
        requirements: course.requirements,
        fees: course.fees ? course.fees.toString() : '',
        isActive: course.isActive
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        faculty: '',
        duration: '',
        totalSeats: '',
        availableSeats: '',
        requirements: '',
        fees: '',
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      const courseData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.availableSeats),
        fees: formData.fees ? parseFloat(formData.fees) : 0
      };

      if (editingCourse) {
        // Update course
        const response = await institutionAPI.updateCourse(editingCourse.id, courseData);
        if (response.data.success) {
          setSuccess('Course updated successfully!');
          fetchCourses();
          handleCloseDialog();
        }
      } else {
        // Add new course
        const response = await institutionAPI.addCourse(courseData);
        if (response.data.success) {
          setSuccess('Course added successfully!');
          fetchCourses();
          handleCloseDialog();
        }
      }
    } catch (error) {
      setError('Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await institutionAPI.deleteCourse(courseId);
        if (response.data.success) {
          setSuccess('Course deleted successfully!');
          fetchCourses();
        }
      } catch (error) {
        setError('Failed to delete course');
      }
    }
  };

  const handleToggleStatus = async (courseId, isActive) => {
    try {
      const response = await institutionAPI.deactivateCourse(courseId, { isActive: !isActive });
      if (response.data.success) {
        setSuccess(`Course ${!isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchCourses();
      }
    } catch (error) {
      setError('Failed to update course status');
    }
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
          Manage Courses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Course
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
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {course.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {course.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={course.faculty} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={course.duration} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={`${course.availableSeats}/${course.totalSeats} seats`} 
                        size="small" 
                        color={course.availableSeats > 0 ? 'success' : 'error'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={course.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={course.isActive ? 'success' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    {course.requirements && (
                      <Typography variant="caption" color="text.secondary">
                        Requirements: {course.requirements}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleOpenDialog(course)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(course.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={course.isActive}
                        onChange={() => handleToggleStatus(course.id, course.isActive)}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {courses.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Courses Added
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding your first course to attract students.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add First Course
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Faculty</InputLabel>
                <Select
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  label="Faculty"
                  required
                >
                  {faculties.map((faculty) => (
                    <MenuItem key={faculty.id} value={faculty.name}>
                      {faculty.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4 years, 2 semesters"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Seats"
                name="totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Seats"
                name="availableSeats"
                type="number"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fees"
                name="fees"
                type="number"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                InputProps={{
                  startAdornment: 'M'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                multiline
                rows={2}
                placeholder="e.g., High School Diploma, Minimum GPA 3.0"
              />
            </Grid>
            {editingCourse && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Course Active"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.description || !formData.faculty || !formData.duration || !formData.totalSeats || !formData.availableSeats}
          >
            {editingCourse ? 'Update' : 'Add'} Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCourses;