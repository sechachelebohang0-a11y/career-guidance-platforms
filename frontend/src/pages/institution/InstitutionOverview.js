import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { institutionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const InstitutionOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstitutionData();
  }, []);

  const fetchInstitutionData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileResponse, coursesResponse, applicationsResponse] = await Promise.all([
        institutionAPI.getProfile(),
        institutionAPI.getCourses(),
        institutionAPI.getApplications(),
      ]);

      setStats({
        courses: coursesResponse.data.courses?.length || 0,
        applications: applicationsResponse.data.applications?.length || 0,
        pendingApplications: applicationsResponse.data.applications?.filter(app => app.status === 'pending').length || 0,
        approvedApplications: applicationsResponse.data.applications?.filter(app => app.status === 'approved').length || 0,
        rejectedApplications: applicationsResponse.data.applications?.filter(app => app.status === 'rejected').length || 0,
        profile: profileResponse.data.profile,
      });
    } catch (error) {
      console.error('Error fetching institution data:', error);
      setError('Failed to load institution data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stats cards data - all with the same beautiful color
  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.courses || 0,
      description: 'Courses offered by your institution',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Applications',
      value: stats?.applications || 0,
      description: 'Applications received',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingApplications || 0,
      description: 'Applications awaiting review',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Approved Applications',
      value: stats?.approvedApplications || 0,
      description: 'Successfully approved applications',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Rejected Applications',
      value: stats?.rejectedApplications || 0,
      description: 'Applications not accepted',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Admission Rate',
      value: stats?.applications ? `${Math.round((stats.approvedApplications / stats.applications) * 100) || 0}%` : '0%',
      description: 'Percentage of approved applications',
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
          Welcome to Your Institution Portal
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Manage your courses, review student applications, and update your institution profile 
          from this dashboard.
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
              onClick={() => navigate('/institution/applications')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Review Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Process student applications
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
              onClick={() => navigate('/institution/profile')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Institution Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update institution information
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
              onClick={() => navigate('/institution/courses')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Add New Course
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create new course offering
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InstitutionOverview;