import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Safe API call wrapper
  const safeApiCall = async (apiFunction, fallbackData = []) => {
    try {
      const response = await apiFunction();
      return response.data || fallbackData;
    } catch (error) {
      console.warn('API call failed:', error.message);
      return fallbackData;
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching student notifications...');
      
      // Try to get real notifications first
      const notificationsData = await safeApiCall(
        () => studentAPI.getNotifications(),
        []
      );

      let realNotifications = [];
      
      if (notificationsData.success) {
        realNotifications = notificationsData.notifications || [];
        console.log('✅ Real notifications:', realNotifications);
      } else {
        console.log('⚠️ Using fallback notification generation');
        // Generate fallback notifications if real ones fail
        realNotifications = await generateFallbackNotifications();
      }

      setNotifications(realNotifications);
      
    } catch (err) {
      console.error('❌ Error in fetchNotifications:', err);
      setError('Failed to load notifications. Please try again.');
      // Set empty array as fallback
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback notifications when API fails
  const generateFallbackNotifications = async () => {
    console.log('🔄 Generating fallback notifications...');
    
    const fallbackNotifications = [
      {
        id: 'fallback_1',
        title: 'Welcome to Career Portal',
        message: 'Start exploring courses and job opportunities that match your profile.',
        type: 'welcome',
        timestamp: new Date(),
        read: false,
      },
      {
        id: 'fallback_2',
        title: 'Complete Your Profile',
        message: 'Add your qualifications and skills to get better job matches.',
        type: 'profile_reminder',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
      },
      {
        id: 'fallback_3',
        title: 'Explore Available Courses',
        message: 'Check out the latest courses from top institutions.',
        type: 'course_recommendation',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
      }
    ];

    return fallbackNotifications;
  };

  const markAsRead = async (notificationId) => {
    try {
      setActionLoading(true);
      console.log(`🔍 Marking notification as read: ${notificationId}`);
      
      // Try to call API, but don't fail if it doesn't work
      try {
        await studentAPI.markNotificationAsRead(notificationId);
        console.log('✅ Notification marked as read via API');
      } catch (apiError) {
        console.warn('⚠️ API call failed, updating locally only:', apiError.message);
      }
      
      // Update local state regardless of API success
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);
      setError('Failed to update notification');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      console.log('🔍 Marking all notifications as read...');
      
      // Try to call API, but don't fail if it doesn't work
      try {
        await studentAPI.markAllNotificationsAsRead();
        console.log('✅ All notifications marked as read via API');
      } catch (apiError) {
        console.warn('⚠️ API call failed, updating locally only:', apiError.message);
      }
      
      // Update local state regardless of API success
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);
      setError('Failed to update notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setActionLoading(true);
      console.log(`🔍 Deleting notification: ${notificationId}`);
      
      // Try to call API, but don't fail if it doesn't work
      try {
        await studentAPI.deleteNotification(notificationId);
        console.log('✅ Notification deleted via API');
      } catch (apiError) {
        console.warn('⚠️ API call failed, deleting locally only:', apiError.message);
      }
      
      // Update local state regardless of API success
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      setError('Failed to delete notification');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  const handleMenuOpen = (event, notification) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔍 Notification clicked:', notification.type);
    
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'job_match':
        navigate('/student/jobs');
        break;
      case 'admission_update':
      case 'interview_ready':
        navigate('/student/applications');
        break;
      case 'course_recommendation':
      case 'welcome':
      case 'profile_reminder':
        navigate('/student/courses');
        break;
      default:
        // Default navigation
        navigate('/student/dashboard');
        break;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job_match': return 'primary';
      case 'admission_update': return 'success';
      case 'interview_ready': return 'warning';
      case 'course_recommendation': return 'info';
      case 'welcome': return 'secondary';
      case 'profile_reminder': return 'info';
      default: return 'default';
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case 'job_match': return 'Job Match';
      case 'admission_update': return 'Admission';
      case 'interview_ready': return 'Interview';
      case 'course_recommendation': return 'Course';
      case 'welcome': return 'Welcome';
      case 'profile_reminder': return 'Profile';
      default: return type.replace('_', ' ') || 'Notification';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      return 'Recent';
    } catch (error) {
      return 'Recent';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading notifications...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Notifications
          {unreadCount > 0 && (
            <Chip 
              label={unreadCount} 
              color="error" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button 
              variant="contained" 
              onClick={markAllAsRead}
              disabled={actionLoading}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchNotifications}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper>
        <List>
          {notifications.map((notification) => (
            <ListItem 
              key={notification.id} 
              divider
              sx={{ 
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                      {notification.title || 'Notification'}
                    </Typography>
                    <Chip
                      label={getNotificationLabel(notification.type)}
                      size="small"
                      color={getNotificationColor(notification.type)}
                    />
                    {!notification.read && (
                      <Chip label="New" size="small" color="error" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {notification.message || 'No message content'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </>
                }
              />
              
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, notification);
                }}
                disabled={actionLoading}
              >
                ⋮
              </IconButton>
            </ListItem>
          ))}
        </List>

        {notifications.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Notifications about job matches, application updates, and course recommendations will appear here.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={fetchNotifications}
              disabled={loading}
            >
              Check for New Notifications
            </Button>
          </Box>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem 
            onClick={() => markAsRead(selectedNotification.id)}
            disabled={actionLoading}
          >
            Mark as Read
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => deleteNotification(selectedNotification?.id)}
          disabled={actionLoading}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudentNotifications;