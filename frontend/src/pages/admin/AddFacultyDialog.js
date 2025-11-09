import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material';

const AddFacultyDialog = ({ open, onClose, institution, onAddFaculty }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (formData.name && institution) {
      onAddFaculty(institution.id, formData);
      setFormData({ name: '', description: '' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Faculty to {institution?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Faculty Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
          disabled={!formData.name}
        >
          Add Faculty
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFacultyDialog;