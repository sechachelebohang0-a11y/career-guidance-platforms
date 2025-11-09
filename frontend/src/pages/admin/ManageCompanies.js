// src/pages/admin/ManageCompanies.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Business, 
  Block, 
  Refresh, 
  Delete,
  Edit,
  Visibility
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionDialog, setActionDialog] = useState({ open: false, company: null, action: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, company: null });
  const [editDialog, setEditDialog] = useState({ open: false, company: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getCompanies();
      
      if (response.data && response.data.success) {
        setCompanies(response.data.companies || []);
      } else {
        setError(response.data?.message || 'Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId) => {
    try {
      const response = await adminAPI.approveCompany(companyId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Company approved successfully!',
          severity: 'success'
        });
        fetchCompanies();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to approve company',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, company: null, action: '' });
  };

  const handleSuspend = async (companyId) => {
    try {
      const response = await adminAPI.suspendCompany(companyId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Company suspended successfully!',
          severity: 'success'
        });
        fetchCompanies();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to suspend company',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, company: null, action: '' });
  };

  const handleReject = async (companyId) => {
    try {
      const response = await adminAPI.rejectCompany(companyId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Company rejected successfully!',
          severity: 'success'
        });
        fetchCompanies();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reject company',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, company: null, action: '' });
  };

  const handleDelete = async (companyId) => {
    try {
      const response = await adminAPI.deleteCompany(companyId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Company deleted successfully!',
          severity: 'success'
        });
        fetchCompanies();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete company',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, company: null, action: '' });
  };

  const handleUpdate = async (companyId, updateData) => {
    try {
      const response = await adminAPI.updateCompany(companyId, updateData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Company updated successfully!',
          severity: 'success'
        });
        fetchCompanies();
        setEditDialog({ open: false, company: null });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update company',
        severity: 'error'
      });
    }
  };

  const openActionDialog = (company, action) => {
    setActionDialog({ open: true, company, action });
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, company: null, action: '' });
  };

  const openViewDialog = (company) => {
    setViewDialog({ open: true, company });
  };

  const closeViewDialog = () => {
    setViewDialog({ open: false, company: null });
  };

  const openEditDialog = (company) => {
    setEditDialog({ open: true, company });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, company: null });
  };

  const confirmAction = () => {
    const { company, action } = actionDialog;
    if (!company) return;

    switch (action) {
      case 'approve':
        handleApprove(company.id);
        break;
      case 'suspend':
        handleSuspend(company.id);
        break;
      case 'reject':
        handleReject(company.id);
        break;
      case 'delete':
        handleDelete(company.id);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'suspended': return 'Suspended';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getActionMessage = (action, companyName) => {
    switch (action) {
      case 'approve':
        return `Are you sure you want to approve "${companyName}"? This will allow them to post jobs and access all company features.`;
      case 'suspend':
        return `Are you sure you want to suspend "${companyName}"? They will not be able to post new jobs or access company features.`;
      case 'reject':
        return `Are you sure you want to reject "${companyName}"? This action cannot be undone and the company will need to re-apply.`;
      case 'delete':
        return `Are you sure you want to permanently delete "${companyName}"? This will remove all company data and cannot be undone.`;
      default:
        return `Are you sure you want to perform this action on "${companyName}"?`;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter companies based on search and status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: companies.length,
    pending: companies.filter(c => c.status === 'pending').length,
    approved: companies.filter(c => c.status === 'approved').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Companies ({companies.length})
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchCompanies}
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

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Companies
              </Typography>
              <Typography variant="h4">{statusCounts.all}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">{statusCounts.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">{statusCounts.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Suspended
              </Typography>
              <Typography variant="h4" color="error.main">{statusCounts.suspended}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Companies"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or industry..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {['all', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
                <Chip
                  key={status}
                  label={`${status.charAt(0).toUpperCase() + status.slice(1)} (${statusCounts[status]})`}
                  clickable
                  color={filterStatus === status ? 'primary' : 'default'}
                  onClick={() => setFilterStatus(status)}
                  variant={filterStatus === status ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {filteredCompanies.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No companies found matching your criteria.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Job Postings</TableCell>
              <TableCell>Registered Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {company.name}
                      </Typography>
                      {company.website && company.website !== 'N/A' && (
                        <Typography variant="caption" color="text.secondary">
                          {company.website}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={company.industry} 
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>{company.contactPerson || 'N/A'}</TableCell>
                <TableCell>{company.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(company.status)} 
                    color={getStatusColor(company.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={company.jobPostingsCount || 0} 
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => openViewDialog(company)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>

                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => openEditDialog(company)}
                      title="Edit Company"
                    >
                      <Edit />
                    </IconButton>

                    {company.status === 'pending' && (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => openActionDialog(company, 'approve')}
                        title="Approve Company"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    
                    {company.status === 'approved' && (
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => openActionDialog(company, 'suspend')}
                        title="Suspend Company"
                      >
                        <Block />
                      </IconButton>
                    )}
                    
                    {company.status === 'suspended' && (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => openActionDialog(company, 'approve')}
                        title="Re-activate Company"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    
                    {(company.status === 'pending' || company.status === 'suspended') && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openActionDialog(company, 'reject')}
                        title="Reject Company"
                      >
                        <Cancel />
                      </IconButton>
                    )}

                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => openActionDialog(company, 'delete')}
                      title="Delete Company"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.action === 'approve' && 'Approve Company'}
          {actionDialog.action === 'suspend' && 'Suspend Company'}
          {actionDialog.action === 'reject' && 'Reject Company'}
          {actionDialog.action === 'delete' && 'Delete Company'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {getActionMessage(actionDialog.action, actionDialog.company?.name)}
          </Typography>
          {actionDialog.company && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">Company Details:</Typography>
              <Typography variant="body2">Email: {actionDialog.company.email}</Typography>
              <Typography variant="body2">Industry: {actionDialog.company.industry}</Typography>
              <Typography variant="body2">Contact: {actionDialog.company.contactPerson || 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button 
            onClick={confirmAction}
            color={
              actionDialog.action === 'approve' ? 'success' : 
              actionDialog.action === 'delete' || actionDialog.action === 'reject' ? 'error' : 'warning'
            }
            variant="contained"
          >
            {actionDialog.action === 'approve' && 'Approve'}
            {actionDialog.action === 'suspend' && 'Suspend'}
            {actionDialog.action === 'reject' && 'Reject'}
            {actionDialog.action === 'delete' && 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Company Dialog */}
      <Dialog open={viewDialog.open} onClose={closeViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Company Details</DialogTitle>
        <DialogContent>
          {viewDialog.company && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
                <Typography variant="body1">{viewDialog.company.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{viewDialog.company.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Industry</Typography>
                <Typography variant="body1">{viewDialog.company.industry}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Contact Person</Typography>
                <Typography variant="body1">{viewDialog.company.contactPerson || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography variant="body1">{viewDialog.company.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Website</Typography>
                <Typography variant="body1">{viewDialog.company.website || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1">{viewDialog.company.description || 'No description provided'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          {editDialog.company && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  defaultValue={editDialog.company.name}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={editDialog.company.email}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  defaultValue={editDialog.company.industry}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  defaultValue={editDialog.company.contactPerson}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button 
            onClick={() => handleUpdate(editDialog.company.id, {})}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageCompanies;