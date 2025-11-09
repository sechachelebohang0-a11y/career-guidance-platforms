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
} from '@mui/material';
import {
  AccountCircle,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import student components
import StudentProfile from './StudentProfile';
import AvailableCourses from './AvailableCourses';
import MyApplications from './MyApplications';
import JobOpportunities from './JobOpportunities';
import StudentNotifications from './StudentNotifications';
import UploadTranscripts from './UploadTranscripts';

// Import your API
import { studentAPI } from '../../services/api';

// Student Overview Component
const StudentOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching student dashboard stats...');
      
      const response = await studentAPI.getStats();
      console.log('🔍 Student stats response:', response);
      
      if (response.data && response.data.success) {
        console.log('✅ Student stats fetched successfully:', response.data.stats);
        setStats(response.data.stats);
      } else {
        console.warn('⚠️ API response indicates failure:', response.data);
        setError(response.data?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching student stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stats cards data - all with the same course application color
  const statCards = [
    {
      title: 'Course Applications',
      value: stats?.totalCourseApplications || 0,
      description: 'Total courses applied to',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Job Applications',
      value: stats?.totalJobApplications || 0,
      description: 'Total jobs applied to',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Admitted',
      value: stats?.admittedApplications || 0,
      description: 'Successful applications',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Pending',
      value: stats?.pendingApplications || 0,
      description: 'Applications under review',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Rejected',
      value: stats?.rejectedApplications || 0,
      description: 'Unsuccessful applications',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Profile Complete',
      value: '85%', // You can calculate this based on profile completion
      description: 'Your profile progress',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
          Welcome back, {user?.firstName || 'Student'}!
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Welcome to your career guidance portal. Track your progress and explore new opportunities.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards Grid - 3 per row */}
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
            >
              <CardContent sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                {/* Content - Centered without icons */}
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
              onClick={() => navigate('/student/courses')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Browse Courses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore available courses
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
              onClick={() => navigate('/student/jobs')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Find Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover job opportunities
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
              onClick={() => navigate('/student/applications')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                My Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your applications
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
              onClick={() => navigate('/student/upload')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Upload Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submit your transcripts
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Main StudentDashboard Component
const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/dashboard',
      value: 'dashboard'
    },
    { 
      text: 'Profile', 
      icon: <PersonIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/profile',
      value: 'profile'
    },
    { 
      text: 'Courses', 
      icon: <SchoolIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/courses',
      value: 'courses'
    },
    { 
      text: 'Applications', 
      icon: <AssignmentIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/applications',
      value: 'applications'
    },
    { 
      text: 'Jobs', 
      icon: <WorkIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/jobs',
      value: 'jobs'
    },
    { 
      text: 'Upload', 
      icon: <UploadIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/student/upload',
      value: 'upload'
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
            onClick={() => navigate('/student/dashboard')}
          >
            Student Portal
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
              label="Student"
              color="primary"
              size="small"
              variant="outlined"
            />
            
            {/* Notifications */}
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
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
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/student/profile'); }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/student/notifications'); }}>
                <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">Notifications</Typography>
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
            >
              <MenuItem onClick={() => { handleNotificationMenuClose(); navigate('/student/notifications'); }}>
                <Typography variant="body2">View All Notifications</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Typography variant="body2">Application Update - Computer Science</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationMenuClose}>
                <Typography variant="body2">New Job Opportunity - Frontend Developer</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Routes>
            <Route path="dashboard" element={<StudentOverview />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="courses" element={<AvailableCourses />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="jobs" element={<JobOpportunities />} />
            <Route path="upload" element={<UploadTranscripts />} />
            <Route path="notifications" element={<StudentNotifications />} />
            {/* Redirect to dashboard by default */}
            <Route path="/" element={<StudentOverview />} />
          </Routes>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Career Guidance Platform - Student Portal
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

// DEFAULT EXPORT - This line is crucial!
export default StudentDashboard;