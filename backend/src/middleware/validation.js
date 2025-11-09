// middleware/validation.js - Update the handleValidationErrors function
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ Validation failed:', {
      method: req.method,
      path: req.path,
      body: req.body,
      errors: errors.array()
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }

  if (!errors.isEmpty()) {
    console.log('🔍 Validation errors:', errors.array());
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  
  
  next();
};

module.exports = { handleValidationErrors };
