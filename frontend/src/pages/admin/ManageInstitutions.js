// src/pages/admin/ManageInstitutions.js
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
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddFacultyDialog from './AddFacultyDialog';
import AddCourseDialog from './AddCourseDialog';
import ViewInstitutionDialog from './ViewInstitutionDialog';
import EditInstitutionDialog from './EditInstitutionDialog';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionDialog, setActionDialog] = useState({ open: false, institution: null, action: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, institution: null });
  const [editDialog, setEditDialog] = useState({ open: false, institution: null });
  const [addFacultyDialog, setAddFacultyDialog] = useState({ open: false, institution: null });
  const [addCourseDialog, setAddCourseDialog] = useState({ open: false, institution: null, faculty: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, institution: null });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getInstitutions();
      
      if (response.data && response.data.success) {
        setInstitutions(response.data.institutions || []);
      } else {
        setError(response.data?.message || 'Failed to fetch institutions');
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError('Failed to load institutions. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (institutionId) => {
    try {
      const response = await adminAPI.approveInstitution(institutionId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Institution approved successfully!',
          severity: 'success'
        });
        fetchInstitutions();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to approve institution',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, institution: null, action: '' });
    handleCloseMenu();
  };

  const handleSuspend = async (institutionId) => {
    try {
      const response = await adminAPI.suspendInstitution(institutionId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Institution suspended successfully!',
          severity: 'success'
        });
        fetchInstitutions();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to suspend institution',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, institution: null, action: '' });
    handleCloseMenu();
  };

  const handleReject = async (institutionId) => {
    try {
      const response = await adminAPI.rejectInstitution(institutionId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Institution rejected successfully!',
          severity: 'success'
        });
        fetchInstitutions();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reject institution',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, institution: null, action: '' });
    handleCloseMenu();
  };

  const handleDelete = async (institutionId) => {
    try {
      const response = await adminAPI.deleteInstitution(institutionId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Institution deleted successfully!',
          severity: 'success'
        });
        fetchInstitutions();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete institution',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, institution: null, action: '' });
    handleCloseMenu();
  };

  const handleUpdate = async (institutionId, updateData) => {
    try {
      const response = await adminAPI.updateInstitution(institutionId, updateData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Institution updated successfully!',
          severity: 'success'
        });
        fetchInstitutions();
        setEditDialog({ open: false, institution: null });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update institution',
        severity: 'error'
      });
    }
    handleCloseMenu();
  };

  const handleAddFaculty = async (institutionId, facultyData) => {
    try {
      const response = await adminAPI.addFaculty(institutionId, facultyData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Faculty added successfully!',
          severity: 'success'
        });
        setAddFacultyDialog({ open: false, institution: null });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add faculty',
        severity: 'error'
      });
    }
    handleCloseMenu();
  };

  const handleAddCourse = async (institutionId, facultyId, courseData) => {
    try {
      const response = await adminAPI.addCourse(institutionId, facultyId, courseData);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Course added successfully!',
          severity: 'success'
        });
        setAddCourseDialog({ open: false, institution: null, faculty: null });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add course',
        severity: 'error'
      });
    }
    handleCloseMenu();
  };

  const openActionDialog = (institution, action) => {
    setActionDialog({ open: true, institution, action });
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, institution: null, action: '' });
  };

  const openViewDialog = (institution) => {
    setViewDialog({ open: true, institution });
  };

  const closeViewDialog = () => {
    setViewDialog({ open: false, institution: null });
  };

  const openEditDialog = (institution) => {
    setEditDialog({ open: true, institution });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, institution: null });
  };

  const openAddFacultyDialog = (institution) => {
    setAddFacultyDialog({ open: true, institution });
  };

  const closeAddFacultyDialog = () => {
    setAddFacultyDialog({ open: false, institution: null });
  };

  const openAddCourseDialog = (institution, faculty) => {
    setAddCourseDialog({ open: true, institution, faculty });
  };

  const closeAddCourseDialog = () => {
    setAddCourseDialog({ open: false, institution: null, faculty: null });
  };

  const handleOpenMenu = (event, institution) => {
    setActionMenu({ anchorEl: event.currentTarget, institution });
  };

  const handleCloseMenu = () => {
    setActionMenu({ anchorEl: null, institution: null });
  };

  const confirmAction = () => {
    const { institution, action } = actionDialog;
    if (!institution) return;

    switch (action) {
      case 'approve':
        handleApprove(institution.id);
        break;
      case 'suspend':
        handleSuspend(institution.id);
        break;
      case 'reject':
        handleReject(institution.id);
        break;
      case 'delete':
        handleDelete(institution.id);
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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter institutions based on search and status
  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || institution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: institutions.length,
    pending: institutions.filter(i => i.status === 'pending').length,
    approved: institutions.filter(i => i.status === 'approved').length,
    suspended: institutions.filter(i => i.status === 'suspended').length,
    rejected: institutions.filter(i => i.status === 'rejected').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Manage Institutions
        </Typography>
        
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Institutions
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statusCounts.all}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Review
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statusCounts.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statusCounts.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statusCounts.approved + statusCounts.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Institutions"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or contact..."
              sx={{ borderRadius: 2 }}
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
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {filteredInstitutions.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No institutions found matching your criteria.
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Institution</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Contact Info</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Statistics</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Registration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstitutions.map((institution) => (
              <TableRow 
                key={institution.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}
                    >
                      {institution.name?.charAt(0).toUpperCase() || 'I'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {institution.name}
                      </Typography>
                      {institution.website && (
                        <Typography variant="caption" color="primary" sx={{ textDecoration: 'none' }}>
                          {institution.website}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {institution.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {institution.phone || 'No phone'}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {institution.contactPerson || 'No contact person'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusText(institution.status)} 
                    color={getStatusColor(institution.status)}
                    sx={{ 
                      fontWeight: 'bold',
                      borderRadius: 1,
                      minWidth: 100
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Chip 
                      label={`${institution.coursesCount || 0} Courses`} 
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                    <Chip 
                      label={`${institution.facultiesCount || 0} Faculties`} 
                      variant="outlined"
                      size="small"
                      color="secondary"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title="More Actions">
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={(e) => handleOpenMenu(e, institution)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Actions
                      </Button>
                    </Tooltip>
                    
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      onClick={() => openViewDialog(institution)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      View
                    </Button>

                    {institution.status === 'pending' && (
                      <Button 
                        size="small" 
                        variant="contained"
                        color="success"
                        onClick={() => openActionDialog(institution, 'approve')}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Approve
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: 3 }
        }}
      >
        <MenuItem onClick={() => { openViewDialog(actionMenu.institution); handleCloseMenu(); }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => { openEditDialog(actionMenu.institution); handleCloseMenu(); }}>
          Edit Institution
        </MenuItem>
        <MenuItem onClick={() => { openAddFacultyDialog(actionMenu.institution); handleCloseMenu(); }}>
          Add Faculty
        </MenuItem>
        <MenuItem onClick={() => { openAddCourseDialog(actionMenu.institution, null); handleCloseMenu(); }}>
          Add Course
        </MenuItem>
        
        {actionMenu.institution?.status === 'pending' && (
          <MenuItem onClick={() => { openActionDialog(actionMenu.institution, 'approve'); }}>
            <Typography color="success.main">Approve Institution</Typography>
          </MenuItem>
        )}
        
        {actionMenu.institution?.status === 'approved' && (
          <MenuItem onClick={() => { openActionDialog(actionMenu.institution, 'suspend'); }}>
            <Typography color="warning.main">Suspend Institution</Typography>
          </MenuItem>
        )}
        
        {actionMenu.institution?.status === 'suspended' && (
          <MenuItem onClick={() => { openActionDialog(actionMenu.institution, 'approve'); }}>
            <Typography color="success.main">Activate Institution</Typography>
          </MenuItem>
        )}
        
        {(actionMenu.institution?.status === 'pending' || actionMenu.institution?.status === 'suspended') && (
          <MenuItem onClick={() => { openActionDialog(actionMenu.institution, 'reject'); }}>
            <Typography color="error">Reject Institution</Typography>
          </MenuItem>
        )}

        <MenuItem onClick={() => { openActionDialog(actionMenu.institution, 'delete'); }}>
          <Typography color="error">Delete Institution</Typography>
        </MenuItem>
      </Menu>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          {actionDialog.action === 'approve' && 'Approve Institution'}
          {actionDialog.action === 'suspend' && 'Suspend Institution'}
          {actionDialog.action === 'reject' && 'Reject Institution'}
          {actionDialog.action === 'delete' && 'Delete Institution'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography>
            {actionDialog.action === 'approve' && `Are you sure you want to approve "${actionDialog.institution?.name}"?`}
            {actionDialog.action === 'suspend' && `Are you sure you want to suspend "${actionDialog.institution?.name}"?`}
            {actionDialog.action === 'reject' && `Are you sure you want to reject "${actionDialog.institution?.name}"?`}
            {actionDialog.action === 'delete' && `Are you sure you want to delete "${actionDialog.institution?.name}"? This will also remove all associated faculties and courses.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeActionDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmAction}
            color={
              actionDialog.action === 'approve' ? 'success' : 
              actionDialog.action === 'reject' || actionDialog.action === 'delete' ? 'error' : 'warning'
            }
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Components */}
      <ViewInstitutionDialog
        open={viewDialog.open}
        onClose={closeViewDialog}
        institution={viewDialog.institution}
      />

      <EditInstitutionDialog
        open={editDialog.open}
        onClose={closeEditDialog}
        institution={editDialog.institution}
        onUpdate={handleUpdate}
      />

      <AddFacultyDialog
        open={addFacultyDialog.open}
        onClose={closeAddFacultyDialog}
        institution={addFacultyDialog.institution}
        onAddFaculty={handleAddFaculty}
      />

      <AddCourseDialog
        open={addCourseDialog.open}
        onClose={closeAddCourseDialog}
        institution={addCourseDialog.institution}
        faculty={addCourseDialog.faculty}
        onAddCourse={handleAddCourse}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageInstitutions;