// src/components/common/LoadingSpinner.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
    >
      <CircularProgress size={40} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;