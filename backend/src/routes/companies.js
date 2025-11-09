const express = require('express');
const { body } = require('express-validator');
const { 
  getCompanyProfile,
  updateCompanyProfile,
  postJob,
  getJobApplications
} = require('../controllers/companyController');
const { authenticateToken, authorize } = require('../middleware/auth'); // ✅ Use new middleware
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ✅ FIX: Apply auth middleware to all routes
router.use(authenticateToken);
router.use(authorize('company'));

router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.post('/jobs',
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('deadline').isISO8601(),
    body('location').notEmpty()
  ],
  handleValidationErrors,
  postJob
);
router.get('/jobs/applications', getJobApplications);

module.exports = router;