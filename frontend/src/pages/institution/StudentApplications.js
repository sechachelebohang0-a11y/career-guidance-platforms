// src/pages/institution/StudentApplications.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { institutionAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await institutionAPI.getApplications();
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await institutionAPI.manageApplication({
        applicationId,
        status: newStatus,
      });
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Applications
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  {application.student?.firstName} {application.student?.lastName}
                </TableCell>
                <TableCell>{application.course?.name}</TableCell>
                <TableCell>
                  {new Date(application.appliedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={application.status} 
                    color={
                      application.status === 'admitted' ? 'success' :
                      application.status === 'rejected' ? 'error' : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="admitted">Admit</MenuItem>
                      <MenuItem value="rejected">Reject</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {applications.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography variant="body1">
            No student applications found.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StudentApplications;