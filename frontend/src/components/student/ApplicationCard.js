// src/components/student/ApplicationCard.js
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { School, CalendarToday, AccessTime } from '@mui/icons-material';

const ApplicationCard = ({ application }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'admitted': return 'Admitted';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Under Review';
      default: return status;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {application.course?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <School sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
              {application.institution?.name}
            </Typography>
          </Box>
          <Chip 
            label={getStatusText(application.status)} 
            color={getStatusColor(application.status)}
            size="small"
          />
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
            Applied: {new Date(application.appliedAt).toLocaleDateString()}
          </Typography>
          {application.updatedAt && (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
              Updated: {new Date(application.updatedAt).toLocaleDateString()}
            </Typography>
          )}
        </Box>

        {application.status === 'pending' && (
          <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;