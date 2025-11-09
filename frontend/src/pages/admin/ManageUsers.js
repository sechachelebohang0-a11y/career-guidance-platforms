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
  Block, 
  CheckCircle, 
  Refresh, 
  Delete,
  Visibility
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionDialog, setActionDialog] = useState({ open: false, user: null, action: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getUsers();
      
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data?.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, active) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, active);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `User ${active ? 'activated' : 'suspended'} successfully!`,
          severity: 'success'
        });
        fetchUsers();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user status',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, user: null, action: '' });
  };

  const handleResetPassword = async (userId) => {
    try {
      const response = await adminAPI.resetUserPassword(userId);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Password reset initiated successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reset password',
        severity: 'error'
      });
    }
    setActionDialog({ open: false, user: null, action: '' });
  };

  const openActionDialog = (user, action) => {
    setActionDialog({ open: true, user, action });
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, user: null, action: '' });
  };

  const openViewDialog = (user) => {
    setViewDialog({ open: true, user });
  };

  const closeViewDialog = () => {
    setViewDialog({ open: false, user: null });
  };

  const confirmAction = () => {
    const { user, action } = actionDialog;
    if (!user) return;

    switch (action) {
      case 'activate':
        handleStatusUpdate(user.id, true);
        break;
      case 'suspend':
        handleStatusUpdate(user.id, false);
        break;
      case 'resetPassword':
        handleResetPassword(user.id);
        break;
      default:
        break;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'institution': return 'primary';
      case 'company': return 'secondary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleCounts = {
    all: users.length,
    student: users.filter(u => u.role === 'student').length,
    institution: users.filter(u => u.role === 'institution').length,
    company: users.filter(u => u.role === 'company').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Users ({users.length})
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchUsers}
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
                Total Users
              </Typography>
              <Typography variant="h4">{roleCounts.all}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Students
              </Typography>
              <Typography variant="h4" color="success.main">{roleCounts.student}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Institutions
              </Typography>
              <Typography variant="h4" color="primary.main">{roleCounts.institution}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Companies
              </Typography>
              <Typography variant="h4" color="secondary.main">{roleCounts.company}</Typography>
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
              label="Search Users"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {['all', 'student', 'institution', 'company', 'admin'].map(role => (
                <Chip
                  key={role}
                  label={`${role.charAt(0).toUpperCase() + role.slice(1)} (${roleCounts[role]})`}
                  clickable
                  color={filterRole === role ? 'primary' : 'default'}
                  onClick={() => setFilterRole(role)}
                  variant={filterRole === role ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {filteredUsers.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No users found matching your criteria.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registered Date</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.name || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Active' : 'Suspended'} 
                    color={getStatusColor(user.isActive)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => openViewDialog(user)}
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>

                    {user.isActive ? (
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => openActionDialog(user, 'suspend')}
                        title="Suspend User"
                      >
                        <Block />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => openActionDialog(user, 'activate')}
                        title="Activate User"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}

                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => openActionDialog(user, 'resetPassword')}
                      title="Reset Password"
                    >
                      <Refresh />
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
          {actionDialog.action === 'activate' && 'Activate User'}
          {actionDialog.action === 'suspend' && 'Suspend User'}
          {actionDialog.action === 'resetPassword' && 'Reset Password'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionDialog.action === 'activate' && `Are you sure you want to activate "${actionDialog.user?.email}"?`}
            {actionDialog.action === 'suspend' && `Are you sure you want to suspend "${actionDialog.user?.email}"?`}
            {actionDialog.action === 'resetPassword' && `Are you sure you want to reset password for "${actionDialog.user?.email}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button 
            onClick={confirmAction}
            color={
              actionDialog.action === 'activate' ? 'success' : 
              actionDialog.action === 'suspend' ? 'error' : 'primary'
            }
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewDialog.open} onClose={closeViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewDialog.user && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography variant="body1">{viewDialog.user.name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{viewDialog.user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                <Typography variant="body1">{viewDialog.user.role}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Typography variant="body1">{viewDialog.user.isActive ? 'Active' : 'Suspended'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Registered Date</Typography>
                <Typography variant="body1">
                  {viewDialog.user.createdAt ? new Date(viewDialog.user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Last Login</Typography>
                <Typography variant="body1">
                  {viewDialog.user.lastLogin ? new Date(viewDialog.user.lastLogin).toLocaleDateString() : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
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

export default ManageUsers;