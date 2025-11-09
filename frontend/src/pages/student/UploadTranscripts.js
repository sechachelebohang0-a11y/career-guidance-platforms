// src/pages/student/UploadTranscripts.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';

const UploadTranscripts = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      // Simulate file upload - replace with actual file upload logic
      const newDocuments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
        uploadedAt: new Date(),
      }));

      setDocuments(prev => [...prev, ...newDocuments]);
      
      // Call API to update student documents
      const transcriptUrls = newDocuments.filter(doc => 
        doc.type.includes('pdf') || doc.name.includes('transcript')
      ).map(doc => doc.url);

      const certificateUrls = newDocuments.filter(doc => 
        !doc.type.includes('pdf') && !doc.name.includes('transcript')
      ).map(doc => doc.url);

      await studentAPI.uploadTranscript({
        transcriptUrl: transcriptUrls[0], // Assuming one main transcript
        certificateUrls,
      });

      setMessage('Documents uploaded successfully!');
    } catch (error) {
      setMessage('Failed to upload documents');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Documents
      </Typography>

      {message && (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Transcripts and Certificates
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload your academic transcripts, certificates, and other supporting documents.
          These will be used for course applications and job matching.
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select Files'}
          <input
            type="file"
            hidden
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
          />
        </Button>
      </Paper>

      {documents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Documents ({documents.length})
          </Typography>
          <List>
            {documents.map((document) => (
              <ListItem
                key={document.id}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => handleDeleteDocument(document.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={document.name}
                  secondary={`Uploaded: ${document.uploadedAt.toLocaleDateString()} • ${(document.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default UploadTranscripts;