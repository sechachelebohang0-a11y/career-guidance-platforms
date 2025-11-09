// src/pages/auth/Unauthorized.js
import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
            <WarningIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You don't have permission to access this page. Please contact an administrator if you believe this is an error.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Unauthorized;