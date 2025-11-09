// src/pages/institution/ManageFaculties.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { institutionAPI } from '../../services/api';

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await institutionAPI.getFaculties();
      if (response.data.success) {
        setFaculties(response.data.faculties);
      }
    } catch (error) {
      setError('Failed to fetch faculties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData({
        name: faculty.name,
        description: faculty.description
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFaculty(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      if (editingFaculty) {
        // Update faculty
        const response = await institutionAPI.updateFaculty(editingFaculty.id, formData);
        if (response.data.success) {
          setSuccess('Faculty updated successfully!');
          fetchFaculties();
          handleCloseDialog();
        }
      } else {
        // Add new faculty
        const response = await institutionAPI.addFaculty(formData);
        if (response.data.success) {
          setSuccess('Faculty added successfully!');
          fetchFaculties();
          handleCloseDialog();
        }
      }
    } catch (error) {
      setError('Failed to save faculty');
    }
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        const response = await institutionAPI.deleteFaculty(facultyId);
        if (response.data.success) {
          setSuccess('Faculty deleted successfully!');
          fetchFaculties();
        }
      } catch (error) {
        setError('Failed to delete faculty');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Faculties
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Faculty
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {faculties.map((faculty) => (
          <Grid item xs={12} md={6} key={faculty.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {faculty.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {faculty.description || 'No description provided.'}
                    </Typography>
                    <Chip 
                      label={`${faculty.courseCount || 0} courses`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleOpenDialog(faculty)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(faculty.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(faculty.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {faculties.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Faculties Added
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start by adding your first faculty to organize your courses.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add First Faculty
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Faculty Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Faculty Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingFaculty ? 'Update' : 'Add'} Faculty
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageFaculties;