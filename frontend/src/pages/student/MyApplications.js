import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar
} from '@mui/material';
import { Refresh, School, CheckCircle, Cancel } from '@mui/icons-material';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [hasMultipleAdmissions, setHasMultipleAdmissions] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching student applications...');
      
      const response = await studentAPI.getApplications();
      console.log('🔍 Applications response:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Applications fetched successfully:', response.data.applications);
        setApplications(response.data.applications || []);
        setHasMultipleAdmissions(response.data.hasMultipleAdmissions || false);
      } else {
        console.warn('⚠️ API response indicates failure:', response.data);
        setError(response.data?.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAcceptAdmission = (application) => {
    setSelectedApplication(application);
    setAcceptDialogOpen(true);
  };

  const confirmAcceptAdmission = async () => {
    try {
      if (!selectedApplication) return;

      const response = await studentAPI.acceptAdmissionOffer(selectedApplication.id);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Admission offer accepted successfully!',
          severity: 'success'
        });
        setAcceptDialogOpen(false);
        fetchApplications(); // Refresh applications
      }
    } catch (error) {
      console.error('Error accepting admission:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to accept admission offer',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredApplications = applications.filter(app => {
    switch (tabValue) {
      case 0: return true; // All
      case 1: return app.status === 'pending';
      case 2: return app.status === 'admitted';
      case 3: return app.status === 'rejected';
      case 4: return app.status === 'accepted';
      default: return true;
    }
  });

  const getApplicationCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      case 'accepted': return 'info';
      case 'waiting': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'admitted': return <CheckCircle color="success" />;
      case 'accepted': return <CheckCircle color="info" />;
      case 'rejected': return <Cancel color="error" />;
      default: return <School color="warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'admitted': return 'Admitted';
      case 'rejected': return 'Rejected';
      case 'accepted': return 'Accepted';
      case 'waiting': return 'Waiting List';
      default: return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          My Applications ({applications.length})
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchApplications}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {hasMultipleAdmissions && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Multiple Admission Offers!
          </Typography>
          <Typography>
            You have been admitted to multiple institutions. Please select one institution to accept.
            Choosing one will automatically withdraw your applications from other institutions.
          </Typography>
        </Alert>
      )}

      {applications.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You haven't applied to any courses yet. Browse available courses to get started.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All (${applications.length})`} />
          <Tab label={`Pending (${getApplicationCount('pending')})`} />
          <Tab label={`Admitted (${getApplicationCount('admitted')})`} />
          <Tab label={`Rejected (${getApplicationCount('rejected')})`} />
          <Tab label={`Accepted (${getApplicationCount('accepted')})`} />
        </Tabs>
      </Paper>

      <Box>
        {filteredApplications.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            {tabValue === 0 
              ? 'No applications found.' 
              : `No ${['all', 'pending', 'admitted', 'rejected', 'accepted'][tabValue]} applications.`
            }
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredApplications.map((application) => (
              <Grid item xs={12} key={application.id}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {application.course?.name || 'Unknown Course'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.institution?.name || 'Unknown Institution'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(application.status)}
                        <Chip 
                          label={getStatusText(application.status)} 
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Faculty:</strong> {application.course?.faculty || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {application.course?.duration || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Seats:</strong> {application.course?.availableSeats || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {application.motivationLetter && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Motivation Letter:</strong> {application.motivationLetter.substring(0, 100)}...
                        </Typography>
                      </Box>
                    )}

                    {application.supportingDocuments && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Supporting Documents:</strong> {application.supportingDocuments}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  {application.status === 'admitted' && (
                    <CardActions>
                      <Button 
                        variant="contained" 
                        color="success"
                        onClick={() => handleAcceptAdmission(application)}
                      >
                        Accept Admission Offer
                      </Button>
                      <Button variant="outlined">
                        View Details
                      </Button>
                    </CardActions>
                  )}

                  {application.status === 'accepted' && (
                    <CardActions>
                      <Button variant="contained" color="info" disabled>
                        Offer Accepted
                      </Button>
                      <Button variant="outlined">
                        View Details
                      </Button>
                    </CardActions>
                  )}

                  {(application.status === 'pending' || application.status === 'waiting') && (
                    <CardActions>
                      <Button variant="outlined" disabled>
                        {application.status === 'waiting' ? 'On Waiting List' : 'Under Review'}
                      </Button>
                      <Button variant="outlined">
                        View Details
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Accept Admission Dialog */}
      <Dialog
        open={acceptDialogOpen}
        onClose={() => setAcceptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Accept Admission Offer
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <>
              <Typography variant="body1" gutterBottom>
                You are about to accept the admission offer for:
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedApplication.course?.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                at {selectedApplication.institution?.name}
              </Typography>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Accepting this offer will automatically:
                </Typography>
                <ul>
                  <li>Withdraw your applications from all other institutions</li>
                  <li>Promote waiting list students to the main list in other courses</li>
                  <li>This action cannot be undone</li>
                </ul>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmAcceptAdmission}
            variant="contained" 
            color="success"
          >
            Confirm Acceptance
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

export default MyApplications;