// src/pages/admin/SystemReports.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SystemReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getSystemReports();
      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Reports
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {reports?.totalUsers || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary">
              {reports?.totalStudents || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {reports?.totalInstitutions || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Institutions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {reports?.totalCompanies || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Companies
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Verified Institutions</TableCell>
              <TableCell align="right">{reports?.verifiedInstitutions || 0}</TableCell>
              <TableCell>Out of {reports?.totalInstitutions || 0} total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Verified Companies</TableCell>
              <TableCell align="right">{reports?.verifiedCompanies || 0}</TableCell>
              <TableCell>Out of {reports?.totalCompanies || 0} total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Courses</TableCell>
              <TableCell align="right">{reports?.activeCourses || 0}</TableCell>
              <TableCell>Out of {reports?.totalCourses || 0} total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Job Postings</TableCell>
              <TableCell align="right">{reports?.totalJobs || 0}</TableCell>
              <TableCell>Active job opportunities</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SystemReports;