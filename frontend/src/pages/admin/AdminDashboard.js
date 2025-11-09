// src/pages/admin/AdminDashboard.js
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
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
  School as SchoolIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import admin pages
import AdminOverview from './AdminOverview';
import ManageInstitutions from './ManageInstitutions';
import ManageCompanies from './ManageCompanies';
import SystemReports from './SystemReports';
import ManageUsers from './ManageUsers';
import ManageAdmissions from './ManageAdmissions';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { 
      text: 'Overview', 
      
      path: '/admin/dashboard',
      value: 'dashboard'
    },
    { 
      text: 'Institutions', 
    
      path: '/admin/institutions',
      value: 'institutions'
    },
    { 
      text: 'Companies', 
      
      path: '/admin/companies',
      value: 'companies'
    },
    { 
      text: 'Users', 
      
      path: '/admin/users',
      value: 'users'
    },
    { 
      text: 'Admissions', 
      
      path: '/admin/admissions',
      value: 'admissions'
    },
    { 
      text: 'Reports', 
      
      path: '/admin/reports',
      value: 'reports'
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
            onClick={() => navigate('/admin/dashboard')}
          >
            Admin Portal
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
              label="Administrator"
              color="secondary"
              size="small"
              variant="outlined"
            />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
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
              <MenuItem onClick={handleProfileMenuClose}>
                <Typography variant="body2">Profile</Typography>
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
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="institutions" element={<ManageInstitutions />} />
            <Route path="companies" element={<ManageCompanies />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="admissions" element={<ManageAdmissions />} />
            <Route path="reports" element={<SystemReports />} />
            {/* Redirect to dashboard by default */}
            <Route path="/" element={<AdminOverview />} />
          </Routes>
        </Container>
      </Box>

      
    </Box>
  );
};

export default AdminDashboard;