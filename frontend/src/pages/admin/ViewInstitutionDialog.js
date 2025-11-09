// src/pages/admin/AdminOverview.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { Refresh, People, School, Business, LibraryBooks, Work, Assignment, PendingActions } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Unified StatsCard component with consistent primary color
const StatsCard = ({ title, value, subtitle, icon }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="h6" component="div" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              padding: 2,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await adminAPI.getDashboardStats();
      
      if (response.data && response.data.success) {
        setStats(response.data.stats);
      } else {
        setError(response.data?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      if (error.response?.status === 404) {
        setError('Dashboard endpoint not found. Check backend configuration.');
      } else if (error.response?.status === 401) {
        setError('Unauthorized. Please check admin permissions.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Server might be busy.');
      } else if (!error.response) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(error.response?.data?.message || 'Failed to load dashboard statistics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          System Overview
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchDashboardStats}
          variant="contained"
          disabled={refreshing}
          sx={{
            minWidth: 120
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* No Data Alert */}
      {!stats && !loading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No statistics data available. Please try refreshing.
        </Alert>
      )}

      {/* Statistics Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle="Registered Users"
            icon={<People fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Students"
            value={stats?.totalStudents || 0}
            subtitle="Active Students"
            icon={<School fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Institutions"
            value={stats?.totalInstitutions || 0}
            subtitle={`${stats?.verifiedInstitutions || 0} verified`}
            icon={<Business fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Companies"
            value={stats?.totalCompanies || 0}
            subtitle={`${stats?.verifiedCompanies || 0} verified`}
            icon={<Business fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Courses"
            value={stats?.totalCourses || 0}
            subtitle={`${stats?.activeCourses || 0} active`}
            icon={<LibraryBooks fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Jobs"
            value={stats?.totalJobs || 0}
            subtitle="Active Job Postings"
            icon={<Work fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Applications"
            value={stats?.totalApplications || 0}
            subtitle="Total Applications"
            icon={<Assignment fontSize="large" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Reviews"
            value={(stats?.pendingInstitutions || 0) + (stats?.pendingCompanies || 0)}
            subtitle="Awaiting Approval"
            icon={<PendingActions fontSize="large" />}
          />
        </Grid>
      </Grid>

      {/* System Status Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mt: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          System Status
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {stats ? `Last updated: ${new Date().toLocaleString()}` : 'No data available'}
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" component="div" color="primary" fontWeight="bold">
                  {stats?.pendingInstitutions || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Pending Institutions
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" component="div" color="primary" fontWeight="bold">
                  {stats?.pendingCompanies || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Pending Companies
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" component="div" color="primary" fontWeight="bold">
                  {stats?.totalUsers || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Total System Users
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminOverview;