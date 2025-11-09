// src/components/admin/StatsCard.js
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, subtitle, trend, trendValue }) => {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="overline">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;