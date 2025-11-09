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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { studentAPI } from '../../services/api';

const JobOpportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching job opportunities...');
      
      const response = await studentAPI.getJobs();
      console.log('🔍 Jobs response:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Jobs fetched successfully:', response.data.jobs);
        setJobs(response.data.jobs || []);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      setError('Failed to load job opportunities. Please try again.');
      // Set empty array as fallback
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job =>
      job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job?.requirements?.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredJobs(filtered);
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleApply = async () => {
    try {
      if (!selectedJob?.id) {
        setSnackbar({
          open: true,
          message: 'No job selected to apply for',
          severity: 'error'
        });
        return;
      }

      console.log(`🔍 Applying for job: ${selectedJob.id}`);
      
      const response = await studentAPI.applyForJob(selectedJob.id);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Job application submitted successfully!',
          severity: 'success'
        });
        setApplyModalOpen(false);
        fetchJobs(); // Refresh jobs list
      }
    } catch (err) {
      console.error('❌ Job application error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to apply for job',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Negotiable';
    if (typeof salary === 'object') {
      return `M${salary.min?.toLocaleString() || '0'} - M${salary.max?.toLocaleString() || '0'}`;
    }
    return `M${salary?.toLocaleString() || '0'}`;
  };

  const isJobActive = (job) => {
    if (!job) return false;
    if (!job.deadline) return true;
    return new Date(job.deadline) > new Date();
  };

  const getJobTitle = (job) => {
    return job?.title || 'Untitled Position';
  };

  const getCompanyName = (job) => {
    return job?.company?.name || 'Company Not Specified';
  };

  const getJobLocation = (job) => {
    return job?.location || 'Location not specified';
  };

  const getJobDescription = (job) => {
    return job?.description || 'No description available.';
  };

  const getJobRequirements = (job) => {
    return job?.requirements || [];
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
      <Typography variant="h4" gutterBottom>
        Job Opportunities
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          label="Search Jobs by title, company, or skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Jobs Grid */}
      <Grid container spacing={3}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} md={6} key={job?.id || Math.random()}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {getJobTitle(job)}
                </Typography>
                <Typography variant="body1" color="primary" gutterBottom>
                  {getCompanyName(job)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getJobLocation(job)}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={job?.type || 'Full-time'} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={formatSalary(job?.salary)} 
                    size="small" 
                    color="success"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={isJobActive(job) ? 'Active' : 'Expired'} 
                    size="small" 
                    color={isJobActive(job) ? 'success' : 'error'}
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Typography variant="body2" paragraph>
                  {getJobDescription(job).length > 150 
                    ? `${getJobDescription(job).substring(0, 150)}...` 
                    : getJobDescription(job)}
                </Typography>

                {getJobRequirements(job).length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    <strong>Skills:</strong> {getJobRequirements(job).slice(0, 3).join(', ')}
                    {getJobRequirements(job).length > 3 && '...'}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  disabled={!isJobActive(job)}
                  onClick={() => handleApplyClick(job)}
                >
                  {isJobActive(job) ? 'Apply Now' : 'Expired'}
                </Button>
                <Button 
                  size="small"
                  onClick={() => handleViewDetails(job)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredJobs.length === 0 && !loading && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          {searchTerm ? 'No jobs found matching your search.' : 'No job opportunities available at the moment.'}
        </Typography>
      )}

      {/* Job Details Modal */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedJob ? getJobTitle(selectedJob) : 'Job Details'}
        </DialogTitle>
        <DialogContent>
          {selectedJob ? (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Company:</strong> {getCompanyName(selectedJob)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> {getJobLocation(selectedJob)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {selectedJob?.type || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Salary:</strong> {formatSalary(selectedJob?.salary)}
              </Typography>
              {selectedJob?.deadline && (
                <Typography variant="body1" gutterBottom>
                  <strong>Application Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}
                </Typography>
              )}
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Job Description</Typography>
              <Typography variant="body1" paragraph>
                {getJobDescription(selectedJob)}
              </Typography>

              {getJobRequirements(selectedJob).length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Requirements</Typography>
                  <ul>
                    {getJobRequirements(selectedJob).map((req, index) => (
                      <li key={index}>
                        <Typography variant="body1">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selectedJob?.responsibilities && selectedJob.responsibilities.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Responsibilities</Typography>
                  <ul>
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index}>
                        <Typography variant="body1">{resp}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No job details available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
          {selectedJob && (
            <Button 
              variant="contained"
              onClick={() => {
                setDetailsModalOpen(false);
                handleApplyClick(selectedJob);
              }}
              disabled={!isJobActive(selectedJob)}
            >
              Apply Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Apply Confirmation Modal */}
      <Dialog 
        open={applyModalOpen} 
        onClose={() => setApplyModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Apply for {selectedJob ? getJobTitle(selectedJob) : 'Job'}
        </DialogTitle>
        <DialogContent>
          {selectedJob ? (
            <>
              <Typography variant="body1" paragraph>
                You are about to apply for the position of <strong>{getJobTitle(selectedJob)}</strong> at <strong>{getCompanyName(selectedJob)}</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your profile information will be shared with the employer. Make sure your profile is up to date.
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No job selected to apply for.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyModalOpen(false)}>Cancel</Button>
          {selectedJob && (
            <Button 
              onClick={handleApply}
              variant="contained"
            >
              Confirm Application
            </Button>
          )}
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

export default JobOpportunities;