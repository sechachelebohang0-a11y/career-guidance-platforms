import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';

const AddCourseDialog = ({ open, onClose, institution, faculty, onAddCourse }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    totalSeats: '',
    requirements: '',
    fees: '',
    facultyId: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (formData.name && institution && formData.facultyId) {
      onAddCourse(institution.id, formData.facultyId, formData);
      setFormData({ 
        name: '', 
        description: '', 
        duration: '', 
        totalSeats: '', 
        requirements: '', 
        fees: '',
        facultyId: '' 
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add Course to {institution?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Course Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 4 years"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Seats"
              name="totalSeats"
              type="number"
              value={formData.totalSeats}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fees"
              name="fees"
              type="number"
              value={formData.fees}
              onChange={handleChange}
              placeholder="0.00"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Faculty"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              select
              required
            >
              <MenuItem value="">Select Faculty</MenuItem>
              {/* Faculties would be populated from API */}
              <MenuItem value="engineering">Engineering</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="arts">Arts & Sciences</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.facultyId}
        >
          Add Course
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCourseDialog;