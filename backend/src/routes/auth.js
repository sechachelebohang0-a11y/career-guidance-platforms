const express = require('express');
const { body } = require('express-validator');
const { register, login, testAuth } = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validation');
const router = express.Router();

// Test endpoint
router.get('/test', testAuth);

router.post('/register', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'institution', 'company'])
  ],
  handleValidationErrors,
  register
);

router.post('/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  handleValidationErrors,
  login
);

module.exports = router;