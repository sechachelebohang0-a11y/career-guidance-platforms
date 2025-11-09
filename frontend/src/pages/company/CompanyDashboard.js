// src/pages/company/CompanyDashboard.js
import React, { useState } from 'react';
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
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import company pages
import CompanyOverview from './CompanyOverview';
import PostJob from './PostJob';
import JobApplications from './JobApplications';
import CompanyProfile from './CompanyProfile';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { 
      text: 'Overview', 
      icon: <DashboardIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/company/dashboard',
      value: 'dashboard'
    },
    { 
      text: 'Post Job', 
      icon: <WorkIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/company/post-job',
      value: 'post-job'
    },
    { 
      text: 'Applications', 
      icon: <PeopleIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/company/applications',
      value: 'applications'
    },
    { 
      text: 'Profile', 
      icon: <BusinessIcon sx={{ fontSize: 18, mr: 1 }} />, 
      path: '/company/profile',
      value: 'profile'
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
            onClick={() => navigate('/company/dashboard')}
          >
            Company Portal
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
                fontWeight: 500
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label="Company"
              color="success"
              size="small"
              variant="outlined"
            />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name || user?.email}
            </Typography>
            
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
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/company/profile'); }}>
                <Typography variant="body2">Company Profile</Typography>
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
            <Route path="dashboard" element={<CompanyOverview />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="applications" element={<JobApplications />} />
            <Route path="profile" element={<CompanyProfile />} />
            {/* Redirect to dashboard by default */}
            <Route path="/" element={<CompanyOverview />} />
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
            © {new Date().getFullYear()} Career Guidance Platform - Company Portal
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default CompanyDashboard;
