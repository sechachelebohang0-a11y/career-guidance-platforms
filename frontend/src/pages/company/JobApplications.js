// src/pages/company/JobApplications.js
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
} from '@mui/material';
import { companyAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await companyAPI.getJobApplications();
      if (response.data.success) {
        setApplications(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Job Applications
      </Typography>

      {applications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No job applications found. Post a job to start receiving applications.
          </Typography>
        </Paper>
      ) : (
        applications.map((job) => (
          <Paper key={job.id} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {job.qualifiedCandidates || 0} qualified candidates
            </Typography>
            
            {job.qualifiedStudents && job.qualifiedStudents.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Match Score</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {job.qualifiedStudents.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {student.student?.firstName} {student.student?.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${student.matchScore}%`} 
                            color={student.matchScore > 80 ? 'success' : student.matchScore > 60 ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label="Qualified" color="info" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default JobApplications;