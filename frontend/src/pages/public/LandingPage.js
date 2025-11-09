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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'For Institutions',
      description: 'Manage courses, faculties, and student applications efficiently.',
      role: 'institution',
      color: '#1976d2',
    },
    {
      title: 'For Students',
      description: 'Discover courses, apply to institutions, and find career opportunities.',
      role: 'student',
      color: '#2e7d32',
    },
    {
      title: 'For Companies',
      description: 'Find qualified graduates and post job opportunities.',
      role: 'company',
      color: '#ed6c02',
    },
    {
      title: 'For Administrators',
      description: 'Manage the entire platform and monitor system activities.',
      role: 'admin',
      color: '#d32f2f',
    },
  ];

  const stats = [
    { number: '50+', label: 'Institutions' },
    { number: '10,000+', label: 'Students' },
    { number: '200+', label: 'Companies' },
    { number: '5,000+', label: 'Successful Placements' },
  ];

  return (
    <>
      <Navbar />
      
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
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              py: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography component="h1" variant="h2" gutterBottom>
              Career Guidance Platform
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, maxWidth: 600 }}>
              Connecting Students, Institutions, and Employers in Lesotho
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ color: 'white', borderColor: 'white' }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
          Who Can Use This Platform?
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ color: feature.color }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/register', { state: { role: feature.role } })}
                  >
                    Register as {feature.title.split(' ')[1]}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How It Works */}
        <Paper sx={{ p: 4, mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  1. Register & Create Profile
                </Typography>
                <Typography>
                  Sign up based on your role and complete your profile with relevant information.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  2. Explore Opportunities
                </Typography>
                <Typography>
                  Students find courses, companies post jobs, institutions manage programs.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  3. Connect & Succeed
                </Typography>
                <Typography>
                  Get matched with the right opportunities and build your career path.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default LandingPage;