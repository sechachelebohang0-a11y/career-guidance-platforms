// src/components/common/Footer.js
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 2,
        mt: 'auto',
        fontSize: '0.75rem',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          {/* Platform Name and Copyright */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
              Career Guidance Platform
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              © {new Date().getFullYear()} All rights reserved.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Link href="/student/courses" color="inherit" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Students
              </Link>
              <Link href="/institution/courses" color="inherit" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Institutions
              </Link>
              <Link href="/company/post-job" color="inherit" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Companies
              </Link>
              <Link href="/privacy" color="inherit" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Privacy
              </Link>
              <Link href="/terms" color="inherit" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Terms
              </Link>
            </Box>
          </Grid>

          {/* Social Links */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconButton 
                size="small"
                sx={{ 
                  color: 'white', 
                  padding: 0.5,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
                aria-label="Facebook"
              >
                <Facebook sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton 
                size="small"
                sx={{ 
                  color: 'white', 
                  padding: 0.5,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
                aria-label="Twitter"
              >
                <Twitter sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton 
                size="small"
                sx={{ 
                  color: 'white', 
                  padding: 0.5,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
                aria-label="LinkedIn"
              >
                <LinkedIn sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton 
                size="small"
                sx={{ 
                  color: 'white', 
                  padding: 0.5,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
                aria-label="Instagram"
              >
                <Instagram sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Contact - Single line */}
        <Box sx={{ textAlign: 'center', mt: 1, opacity: 0.8 }}>
          <Typography variant="caption">
            Maseru, Lesotho • +266 1234 5678 • info@careerguidance.ls
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;