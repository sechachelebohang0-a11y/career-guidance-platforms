import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { studentAPI } from '../../services/api';

const AvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    institution: '',
    faculty: '',
    search: '',
  });
  
  // Modal states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    previousEducation: '',
    yearOfCompletion: new Date().getFullYear(),
    motivationLetter: '',
    supportingDocuments: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentAPI.getCourses();
      console.log('Courses response:', response);
      
      if (response.data && response.data.success) {
        setCourses(response.data.courses || []);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (filters.institution) {
      filtered = filtered.filter(course => 
        course.institution?.name?.toLowerCase().includes(filters.institution.toLowerCase())
      );
    }

    if (filters.faculty) {
      filtered = filtered.filter(course => 
        course.faculty?.toLowerCase().includes(filters.faculty.toLowerCase())
      );
    }

    if (filters.search) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleApplyClick = (course) => {
    // Check if student qualifies for the course
    if (!course.isQualified) {
      setSnackbar({
        open: true,
        message: 'You do not meet the requirements for this course',
        severity: 'error'
      });
      return;
    }

    setSelectedCourse(course);
    setApplicationForm({
      fullName: '',
      email: '',
      phone: '',
      previousEducation: '',
      yearOfCompletion: new Date().getFullYear(),
      motivationLetter: '',
      supportingDocuments: ''
    });
    setApplyModalOpen(true);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setDetailsModalOpen(true);
  };

  const handleApplySubmit = async () => {
    try {
      // Basic validation
      if (!applicationForm.fullName || !applicationForm.email || !applicationForm.phone || !applicationForm.motivationLetter) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }

      const applicationData = {
        courseId: selectedCourse.id,
        institutionId: selectedCourse.institutionId,
        ...applicationForm,
        appliedAt: new Date().toISOString()
      };

      const response = await studentAPI.applyForCourse(applicationData);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Application submitted successfully!',
          severity: 'success'
        });
        setApplyModalOpen(false);
        fetchCourses(); // Refresh to update application status
      }
    } catch (err) {
      console.error('Application error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to apply for course';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleFormChange = (field) => (event) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const educationLevels = [
    'High School Diploma',
    'Certificate',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Courses"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Filter by Institution"
              value={filters.institution}
              onChange={(e) => handleFilterChange('institution', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Filter by Faculty"
              value={filters.faculty}
              onChange={(e) => handleFilterChange('faculty', e.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card sx={{ 
              opacity: course.isQualified ? 1 : 0.7,
              position: 'relative'
            }}>
              {!course.isQualified && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'warning.main',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  Not Qualified
                </Box>
              )}
              
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.name || 'Unnamed Course'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {course.institution?.name || 'No Institution'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {course.description || 'No description available.'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={course.faculty || 'General'} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`${course.duration || 'N/A'}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`${course.availableSeats || 0} seats left`} 
                    size="small" 
                    color={(course.availableSeats || 0) > 0 ? 'success' : 'error'}
                    sx={{ mb: 1 }}
                  />
                  {course.isQualified && (
                    <Chip 
                      label="Qualified" 
                      size="small" 
                      color="success"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>

                {course.requirements && (
                  <Typography variant="caption" color="text.secondary">
                    Requirements: {Array.isArray(course.requirements) ? course.requirements.join(', ') : course.requirements}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Tooltip 
                  title={!course.isQualified ? "You don't meet the course requirements" : ""}
                >
                  <span>
                    <Button 
                      size="small" 
                      variant="contained"
                      disabled={!course.isQualified || (course.availableSeats || 0) === 0}
                      onClick={() => handleApplyClick(course)}
                    >
                      {(course.availableSeats || 0) > 0 ? 'Apply Now' : 'No Seats Available'}
                    </Button>
                  </span>
                </Tooltip>
                <Button 
                  size="small"
                  onClick={() => handleViewDetails(course)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && !loading && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No courses found matching your criteria.
        </Typography>
      )}

      {/* Apply Modal */}
      <Dialog 
        open={applyModalOpen} 
        onClose={() => setApplyModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for {selectedCourse?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedCourse?.institution?.name}
          </Typography>
          
          {selectedCourse && !selectedCourse.isQualified && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You do not meet the requirements for this course. Your application may be rejected.
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={applicationForm.fullName}
                onChange={handleFormChange('fullName')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={applicationForm.email}
                onChange={handleFormChange('email')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={applicationForm.phone}
                onChange={handleFormChange('phone')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Previous Education *</InputLabel>
                <Select
                  value={applicationForm.previousEducation}
                  onChange={handleFormChange('previousEducation')}
                  label="Previous Education *"
                >
                  {educationLevels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Year of Completion</InputLabel>
                <Select
                  value={applicationForm.yearOfCompletion}
                  onChange={handleFormChange('yearOfCompletion')}
                  label="Year of Completion"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Supporting Documents (Optional)"
                placeholder="List any additional documents you're submitting..."
                value={applicationForm.supportingDocuments}
                onChange={handleFormChange('supportingDocuments')}
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivation Letter *"
                placeholder="Explain why you want to join this course and why you're a good candidate..."
                value={applicationForm.motivationLetter}
                onChange={handleFormChange('motivationLetter')}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleApplySubmit}
            variant="contained"
            disabled={!applicationForm.fullName || !applicationForm.email || !applicationForm.phone || !applicationForm.motivationLetter}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Details Modal */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCourse?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Institution:</strong> {selectedCourse?.institution?.name || 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Faculty:</strong> {selectedCourse?.faculty || 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Duration:</strong> {selectedCourse?.duration || 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Available Seats:</strong> {selectedCourse?.availableSeats || 0}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Qualification Status:</strong> 
            <Chip 
              label={selectedCourse?.isQualified ? "Qualified" : "Not Qualified"} 
              color={selectedCourse?.isQualified ? "success" : "warning"}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Description</Typography>
          <Typography variant="body1" paragraph>
            {selectedCourse?.description || 'No description available.'}
          </Typography>

          {selectedCourse?.requirements && (
            <>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Requirements</Typography>
              <ul>
                {Array.isArray(selectedCourse.requirements) ? (
                  selectedCourse.requirements.map((req, index) => (
                    <li key={index}>
                      <Typography variant="body1">{req}</Typography>
                    </li>
                  ))
                ) : (
                  <li>
                    <Typography variant="body1">{selectedCourse.requirements}</Typography>
                  </li>
                )}
              </ul>
            </>
          )}

          {selectedCourse?.curriculum && (
            <>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Curriculum</Typography>
              <ul>
                {Array.isArray(selectedCourse.curriculum) ? (
                  selectedCourse.curriculum.map((item, index) => (
                    <li key={index}>
                      <Typography variant="body1">{item}</Typography>
                    </li>
                  ))
                ) : (
                  <li>
                    <Typography variant="body1">{selectedCourse.curriculum}</Typography>
                  </li>
                )}
              </ul>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setDetailsModalOpen(false);
              handleApplyClick(selectedCourse);
            }}
            disabled={!selectedCourse?.isQualified || (selectedCourse?.availableSeats || 0) === 0}
          >
            Apply Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default AvailableCourses;