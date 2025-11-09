// src/components/common/Navbar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'student': return 'primary';
      case 'institution': return 'secondary';
      case 'company': return 'success';
      default: return 'default';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Career Guidance Platform
        </Typography>

        {isAuthenticated() && user ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label={user.role} 
              color={getRoleColor(user.role)}
              size="small"
            />
            <Typography variant="body2">
              {user.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            {location.pathname !== '/login' && (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
            {location.pathname !== '/register' && (
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;