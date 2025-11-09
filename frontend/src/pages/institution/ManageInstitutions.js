// src/pages/admin/ManageInstitutions.js
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { Edit, CheckCircle, Cancel, Add } from '@mui/icons-material';
import { adminAPI } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      // This would be replaced with actual API call
      // const response = await adminAPI.getInstitutions();
      // setInstitutions(response.data);
      
      // Mock data for demonstration
      setInstitutions([
        {
          id: '1',
          name: 'National University of Lesotho',
          email: 'admin@nul.ls',
          isApproved: true,
          courses: 45,
          applications: 1200,
        },
        {
          id: '2',
          name: 'Limkokwing University',
          email: 'info@limkokwing.ls',
          isApproved: true,
          courses: 38,
          applications: 800,
        },
      ]);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (institutionId) => {
    try {
      await adminAPI.manageInstitution({ institutionId, action: 'approve' });
      fetchInstitutions();
    } catch (error) {
      console.error('Error approving institution:', error);
    }
  };

  const handleSuspend = async (institutionId) => {
    try {
      await adminAPI.manageInstitution({ institutionId, action: 'suspend' });
      fetchInstitutions();
    } catch (error) {
      console.error('Error suspending institution:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Institutions
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Institution
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Institution Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>{institution.name}</TableCell>
                <TableCell>{institution.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={institution.isApproved ? 'Approved' : 'Pending'} 
                    color={institution.isApproved ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{institution.courses}</TableCell>
                <TableCell>{institution.applications}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleApprove(institution.id)}
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleSuspend(institution.id)}
                  >
                    <Cancel />
                  </IconButton>
                  <IconButton size="small" color="default">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageInstitutions;