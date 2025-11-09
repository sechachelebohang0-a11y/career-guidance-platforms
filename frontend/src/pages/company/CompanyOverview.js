import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { companyAPI } from '../../services/api';

const CompanyOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyStats();
  }, []);

  const fetchCompanyStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data - replace with actual API call
      const mockStats = {
        activeJobs: 5,
        totalApplications: 42,
        qualifiedCandidates: 18,
        pendingReviews: 12,
        hiredThisMonth: 3,
        profileViews: 156
      };
      
      setStats(mockStats);
      
    } catch (error) {
      console.error('❌ Error fetching company stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stats cards data - all with the same beautiful color
  const statCards = [
    {
      title: 'Active Job Postings',
      value: stats?.activeJobs || 0,
      description: 'Currently active job listings',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Applications',
      value: stats?.totalApplications || 0,
      description: 'Applications received',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Qualified Candidates',
      value: stats?.qualifiedCandidates || 0,
      description: 'Candidates matching criteria',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      description: 'Applications awaiting review',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Hired This Month',
      value: stats?.hiredThisMonth || 0,
      description: 'Successful placements',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Profile Views',
      value: stats?.profileViews || 0,
      description: 'Company profile views',
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
          Welcome to Your Company Portal
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Post job opportunities, review qualified candidates, and manage your company profile from this dashboard.
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
              onClick={() => navigate('/company/post-job')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Post New Job
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new job posting
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
              onClick={() => navigate('/company/applications')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                View Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review candidate applications
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
              onClick={() => navigate('/company/profile')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Company Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update company information
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
              onClick={() => navigate('/company/applications')}
            >
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Manage Jobs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edit existing job postings
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CompanyOverview;