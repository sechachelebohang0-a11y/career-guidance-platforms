// src/pages/institution/InstitutionDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  CssBaseline,
  Container,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { institutionAPI } from '../../services/api';

// Import institution components
import InstitutionProfile from './InstitutionProfile';
import ManageFaculties from './ManageFaculties';
import ManageCourses from './ManageCourses';
import ViewApplications from './ViewApplications';
import PublishAdmissions from './PublishAdmissions';

// Institution Overview Component
const InstitutionOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstitutionStats();
  }, []);

  const fetchInstitutionStats = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching institution dashboard stats...');
      
      const response = await institutionAPI.getDashboardStats();
      console.log('🔍 Institution stats response:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Institution stats fetched successfully:', response.data.stats);
        setStats(response.data.stats);
      } else {
        console.warn('⚠️ API response indicates failure:', response.data);
        setError(response.data?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching institution stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      description: 'Courses offered',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

      path: '/institution/courses'
    },
    {
      title: 'Active Courses',
      value: stats?.activeCourses || 0,
      description: 'Currently active courses',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      path: '/institution/courses'
    },
    {
      title: 'Total Applications',
      value: stats?.totalApplications || 0,
      description: 'All time applications',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      path: '/institution/applications'
    },
    {
      title: 'Pending Applications',
      value: stats?.applicationsByStatus?.pending || 0,
      description: 'Applications under review',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      path: '/institution/applications'
    },
    {
      title: 'Admitted Students',
      value: stats?.applicationsByStatus?.admitted || 0,
      description: 'Successful admissions',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      path: '/institution/applications'
    },
    {
      title: 'Faculties',
      value: stats?.totalFaculties || 0,
      description: 'Academic departments',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      
      path: '/institution/faculties'
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}>
          Welcome, {user?.name || 'Institution'}!
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Manage your courses, faculties, and student applications from your dashboard.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: card.color,
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="h2" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 1,
                        fontSize: { xs: '2.5rem', md: '3rem' },
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {card.value}
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: '600',
                        mb: 1,
                        fontSize: '1.1rem'
                      }}
                    >
                      {card.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        opacity: 0.9,
                        fontSize: '0.9rem'
                      }}
                    >
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>
                    
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}
              onClick={() => navigate('/institution/courses')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Manage Courses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add or edit courses
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}
              onClick={() => navigate('/institution/faculties')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Manage Faculties
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add or edit faculties
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}
              onClick={() => navigate('/institution/applications')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                View Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage student applications
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                }
              }}
              onClick={() => navigate('/institution/admissions')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Publish Admissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage admissions
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Main InstitutionDashboard Component
const InstitutionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const menuItems = [
    { 
      text: 'Dashboard', 
      
      path: '/institution/dashboard',
      value: 'dashboard'
    },
    { 
      text: 'Profile', 
      
      path: '/institution/profile',
      value: 'profile'
    },
    { 
      text: 'Faculties', 
      
      path: '/institution/faculties',
      value: 'faculties'
    },
    { 
      text: 'Courses', 
      
      path: '/institution/courses',
      value: 'courses'
    },
    { 
      text: 'Applications', 
       
      path: '/institution/applications',
      value: 'applications'
    },
    { 
      text: 'Admissions', 
       
      path: '/institution/admissions',
      value: 'admissions'
    },
  ];

  // Get current tab value based on route
  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => currentPath.includes(item.value));
    return currentItem ? currentItem.value : 'dashboard';
  };

  const handleTabChange = (event, newValue) => {
    const selectedItem = menuItems.find(item => item.value === newValue);
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          {/* Logo/Brand */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              mr: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => navigate('/institution/dashboard')}
          >
            Institution Portal
          </Typography>

          {/* Navigation Tabs */}
          <Tabs 
            value={getCurrentTab()} 
            onChange={handleTabChange}
            textColor="inherit"
            sx={{ 
              flexGrow: 1,
              '& .MuiTab-root': { 
                minHeight: 64,
                fontSize: '0.875rem',
                fontWeight: 500,
                minWidth: 'auto',
                px: 2
              }
            }}
          >
            {menuItems.map((item) => (
              <Tab 
                key={item.value}
                value={item.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                    {item.text}
                  </Box>
                }
              />
            ))}
          </Tabs>

          {/* User Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="Institution"
              color="primary"
              size="small"
              variant="outlined"
            />
            
            
            
            {/* User Profile */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              id="primary-search-account-menu"
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/institution/profile'); }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Institution Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Routes>
            <Route path="dashboard" element={<InstitutionOverview />} />
            <Route path="profile" element={<InstitutionProfile />} />
            <Route path="faculties" element={<ManageFaculties />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="applications" element={<ViewApplications />} />
            <Route path="admissions" element={<PublishAdmissions />} />
            {/* Redirect to dashboard by default */}
            <Route path="/" element={<InstitutionOverview />} />
          </Routes>
        </Container>
      </Box>

      
    </Box>
  );
};

export default InstitutionDashboard;