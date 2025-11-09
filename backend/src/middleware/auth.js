const jwt = require('jsonwebtoken');
const { getUsersRef } = require('../config/firebase'); // ✅ Use getter function

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔍 Auth Middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'career_guidance_platform_jwt_secret_2024_lesotho_maseru_nul_limkokwing'
    );

    console.log('🔍 Auth Middleware - Decoded user:', decoded.email);

    // ✅ FIX: Use getter function for users reference
    const usersRef = getUsersRef();
    const userDoc = await usersRef.doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = userDoc.data();
    
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Add user to request object
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role
    };

    console.log('🔍 Auth Middleware - User authenticated:', req.user.email);
    next();

  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { authenticateToken, authorize };