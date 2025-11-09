// src/pages/institution/ViewApplications.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { institutionAPI } from '../../services/api';

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, tabValue]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await institutionAPI.getApplications();
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    switch (tabValue) {
      case 1: // Pending
        filtered = filtered.filter(app => app.status === 'pending');
        break;
      case 2: // Admitted
        filtered = filtered.filter(app => app.status === 'admitted');
        break;
      case 3: // Rejected
        filtered = filtered.filter(app => app.status === 'rejected');
        break;
      default: // All
        break;
    }

    setFilteredApplications(filtered);
  };

  const handleOpenDialog = (application) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: application.status,
      notes: application.notes || ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
    setStatusUpdate({
      status: '',
      notes: ''
    });
  };

  const handleUpdateStatus = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await institutionAPI.manageApplication({
        applicationId: selectedApplication.id,
        status: statusUpdate.status,
        notes: statusUpdate.notes
      });

      if (response.data.success) {
        setSuccess('Application status updated successfully!');
        fetchApplications();
        handleCloseDialog();
      }
    } catch (error) {
      setError('Failed to update application status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getApplicationCount = (status) => {
    return applications.filter(app => app.status === status).length;
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
          Student Applications ({applications.length})
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchApplications}
        >
          Refresh
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

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${applications.length})`} />
          <Tab label={`Pending (${getApplicationCount('pending')})`} />
          <Tab label={`Admitted (${getApplicationCount('admitted')})`} />
          <Tab label={`Rejected (${getApplicationCount('rejected')})`} />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredApplications.map((application) => (
          <Grid item xs={12} key={application.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {application.student?.firstName} {application.student?.lastName}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={application.course?.name} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={application.status} 
                        size="small" 
                        color={getStatusColor(application.status)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={new Date(application.appliedAt).toLocaleDateString()} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" paragraph>
                      <strong>Email:</strong> {application.student?.email}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Phone:</strong> {application.student?.phone}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Previous Education:</strong> {application.previousEducation}
                    </Typography>
                    {application.motivationLetter && (
                      <Typography variant="body2" paragraph>
                        <strong>Motivation:</strong> {application.motivationLetter}
                      </Typography>
                    )}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDialog(application)}
                  >
                    Manage
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 
                ? 'No student applications yet.' 
                : `No ${['all', 'pending', 'admitted', 'rejected'][tabValue]} applications.`
              }
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Manage Application Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Application
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Student:</strong> {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Course:</strong> {selectedApplication.course?.name}
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="admitted">Admitted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="waiting_list">Waiting List</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Notes"
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                placeholder="Add any notes or comments for the student..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={!statusUpdate.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewApplications;