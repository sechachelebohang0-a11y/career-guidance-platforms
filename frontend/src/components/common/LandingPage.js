import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkIcon from '@mui/icons-material/Work';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'For Students',
      description: 'Discover higher learning institutions, apply for courses, and upload your transcripts for career opportunities.',
      button: 'Student Registration',
      role: 'student'
    },
    {
      icon: <BusinessCenterIcon sx={{ fontSize: 40 }} />,
      title: 'For Institutions',
      description: 'Manage courses, faculties, and student applications. Connect with qualified graduates.',
      button: 'Institution Registration',
      role: 'institution'
    },
    {
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      title: 'For Companies',
      description: 'Post job opportunities and find qualified candidates based on academic performance and skills.',
      button: 'Company Registration',
      role: 'company'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Career Guidance Platform
          </Typography>
          {user ? (
            <Box>
              <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))`,
          height: 400,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Career Guidance Platform
          </Typography>
          <Typography variant="h5" color="inherit" paragraph sx={{ maxWidth: 600 }}>
            Connecting Students with Higher Education and Employment Opportunities in Lesotho
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6, fontWeight: 'bold' }}>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3" fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => navigate('/register', { state: { role: feature.role } })}
                  >
                    {feature.button}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[200],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Career Guidance Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;