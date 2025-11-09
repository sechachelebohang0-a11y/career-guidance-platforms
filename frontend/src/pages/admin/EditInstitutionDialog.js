import React, { useState, useEffect } from 'react';
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

const EditInstitutionDialog = ({ open, onClose, institution, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    contactPerson: '',
    description: '',
    status: '',
  });

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        website: institution.website || '',
        contactPerson: institution.contactPerson || '',
        description: institution.description || '',
        status: institution.status || 'pending',
      });
    }
  }, [institution]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (institution) {
      onUpdate(institution.id, formData);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Institution: {institution?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Institution Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              select
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
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
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Update Institution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInstitutionDialog;