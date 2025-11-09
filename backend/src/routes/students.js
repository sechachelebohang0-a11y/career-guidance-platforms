// routes/students.js - Updated with better validation
const express = require('express');
const { body } = require('express-validator');
const { 
  getStudentProfile,
  updateStudentProfile,
  getAvailableCourses,
  applyForCourse,
  getApplications,
  uploadTranscript,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getJobs,
  applyForJob,
  getJobDetails,
  updateStudentDocuments,
  getStudentStats,
  acceptAdmissionOffer
} = require('../controllers/studentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(authorize('student'));

// Profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', 
  [
    // Make validation more flexible for testing
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1-50 characters')
      .trim(),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1-50 characters')
      .trim(),
    body('phone')
      .optional()
      .matches(/^[+]?[\d\s\-()]{10,}$/).withMessage('Please enter a valid phone number')
      .trim(),
    body('address')
      .optional()
      .isLength({ max: 200 }).withMessage('Address must be less than 200 characters')
      .trim(),
    body('dateOfBirth')
      .optional()
      .isDate().withMessage('Please enter a valid date (YYYY-MM-DD)'),
    body('qualifications')
      .optional()
      .isArray().withMessage('Qualifications must be an array'),
    body('skills')
      .optional()
      .isArray().withMessage('Skills must be an array')
  ],
  handleValidationErrors,
  updateStudentProfile
);

// Course routes
router.get('/courses', getAvailableCourses);
router.post('/applications',
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('institutionId').notEmpty().withMessage('Institution ID is required'),
    body('fullName').notEmpty().withMessage('Full name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('previousEducation').notEmpty().withMessage('Previous education is required').trim(),
    body('motivationLetter').notEmpty().withMessage('Motivation letter is required').trim()
  ],
  handleValidationErrors,
  applyForCourse
);
router.get('/applications', getApplications);
router.post('/applications/:applicationId/accept', acceptAdmissionOffer);

// Job routes
router.get('/jobs', getJobs);
router.get('/jobs/:jobId', getJobDetails);
router.post('/jobs/:jobId/apply', applyForJob);

// Document routes
router.post('/transcripts',
  [
    body('transcriptUrl')
      .optional()
      .isURL().withMessage('Transcript URL must be a valid URL'),
    body('certificateUrls')
      .optional()
      .isArray().withMessage('Certificate URLs must be an array')
  ],
  handleValidationErrors,
  uploadTranscript
);
router.put('/documents', updateStudentDocuments);

// Notification routes
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', deleteNotification);

// Dashboard stats
router.get('/stats', getStudentStats);

module.exports = router;