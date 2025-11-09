// routes/institutions.js - UPDATED WITH SIMPLE VALIDATION
const express = require('express');
const { body } = require('express-validator');
const { 
  getInstitutionProfile,
  updateInstitutionProfile,
  addFaculty,
  getFaculties,
  updateFaculty,
  deleteFaculty,
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  deactivateCourse,
  getApplications,
  manageApplication,
  getDashboardStats
} = require('../controllers/institutionController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(authorize('institution'));

// Profile routes - SIMPLE VALIDATION
router.get('/profile', getInstitutionProfile);
router.put('/profile', 
  [
    body('name')
      .notEmpty().withMessage('Institution name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional({ checkFalsy: true })
      .isLength({ max: 25 }).withMessage('Phone number must be less than 25 characters'),
    body('address')
      .optional({ checkFalsy: true })
      .isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
    body('website')
      .optional({ checkFalsy: true })
      .isURL().withMessage('Please provide a valid website URL'),
    body('description')
      .optional({ checkFalsy: true })
      .isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
  ],
  handleValidationErrors,
  updateInstitutionProfile
);

// Faculty routes
router.get('/faculties', getFaculties);
router.post('/faculties',
  [
    body('name').notEmpty().withMessage('Faculty name is required'),
    body('description').optional().isLength({ max: 300 })
  ],
  handleValidationErrors,
  addFaculty
);

router.put('/faculties/:facultyId',
  [
    body('name').optional().isLength({ min: 2, max: 100 }),
    body('description').optional().isLength({ max: 300 })
  ],
  handleValidationErrors,
  updateFaculty
);

router.delete('/faculties/:facultyId', deleteFaculty);

// Course routes
router.get('/courses', getCourses);
router.post('/courses',
  [
    body('name').notEmpty().withMessage('Course name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('faculty').notEmpty().withMessage('Faculty is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
    body('availableSeats').isInt({ min: 0 }).withMessage('Available seats cannot be negative'),
    body('requirements').optional().isLength({ max: 500 }),
    body('fees').optional().isFloat({ min: 0 })
  ],
  handleValidationErrors,
  addCourse
);

router.put('/courses/:courseId',
  [
    body('name').optional().isLength({ min: 2, max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('faculty').optional().notEmpty(),
    body('duration').optional().notEmpty(),
    body('totalSeats').optional().isInt({ min: 1 }),
    body('availableSeats').optional().isInt({ min: 0 }),
    body('requirements').optional().isLength({ max: 500 }),
    body('fees').optional().isFloat({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  handleValidationErrors,
  updateCourse
);

router.delete('/courses/:courseId', deleteCourse);
router.put('/courses/:courseId/status', 
  [
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
  ],
  handleValidationErrors,
  deactivateCourse
);

// Application routes
router.get('/applications', getApplications);
router.put('/applications',
  [
    body('applicationId').notEmpty().withMessage('Application ID is required'),
    body('status').isIn(['pending', 'admitted', 'rejected', 'waiting_list', 'withdrawn']).withMessage('Invalid status'),
    body('notes').optional().isLength({ max: 300 })
  ],
  handleValidationErrors,
  manageApplication
);

// Dashboard and analytics
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;