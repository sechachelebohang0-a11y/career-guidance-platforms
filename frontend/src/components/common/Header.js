import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useScrollTrigger,
  Slide
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <HideOnScroll {...props}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 0 }}>
              Career Guidance
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, ml: 4, display: { xs: 'none', md: 'flex' } }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ 
                mx: 1,
                backgroundColor: isActiveRoute('/') ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              Home
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                  Welcome, {user.email}
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    mx: 1,
                    backgroundColor: isActiveRoute('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Dashboard
                </Button>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    mx: 1,
                    backgroundColor: isActiveRoute('/login') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;