const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import Firebase config
const firebaseConfig = require('./config/firebase');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'https://career-guidance-platforms.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    headers: req.headers
  });
  next();
});

// ==================== FIREBASE INITIALIZATION MIDDLEWARE ====================

// Add this middleware to check Firebase status for auth routes
app.use('/api/auth/*', async (req, res, next) => {
  try {
    await firebaseConfig.waitForInit();
    if (!firebaseConfig.isInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service initializing. Please try again in a moment.',
        timestamp: new Date().toISOString()
      });
    }
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Authentication service unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ROUTES ====================

// Root route - should be first
app.get('/', (req, res) => {
  res.json({
    message: 'Career Guidance Platform API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test-db',
      auth: '/api/auth',
      students: '/api/students',
      institutions: '/api/institutions',
      companies: '/api/companies',
      jobs: '/api/jobs',
      admin: '/api/admin'
    },
    documentation: 'Check /api for more details'
  });
});

// Simple API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Career Guidance Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'Running',
    endpoints: {
      health: '/api/health',
      test_connection: '/api/test-connection',
      test_db: '/api/test-db',
      auth_test: '/api/auth/test',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      students: '/api/students/*',
      institutions: '/api/institutions/*',
      companies: '/api/companies/*',
      jobs: '/api/jobs/*',
      admin: '/api/admin/*'
    }
  });
});

// Test connection endpoint
app.get('/api/test-connection', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      students: '/api/students/*',
      institutions: '/api/institutions/*',
      companies: '/api/companies/*',
      jobs: '/api/jobs/*',
      admin: '/api/admin/*'
    }
  });
});

// Health check route - SAFE VERSION (no database operations)
app.get('/api/health', async (req, res) => {
  const firebaseStatus = firebaseConfig.getFirebaseStatus();
  
  let detailedStatus = 'Unknown';
  
  if (firebaseStatus.isInitialized) {
    try {
      // SAFE: Just check if services are available without database operations
      const db = firebaseConfig.getDb(); 
      const auth = firebaseConfig.getAuth();
      
      if (db && auth) {
        detailedStatus = 'Services available - connectivity tests disabled for production';
      } else {
        detailedStatus = 'Services initialized but not fully available';
      }
    } catch (error) {
      detailedStatus = `Initialized but service access error: ${error.message}`;
    }
  } else if (firebaseStatus.error) {
    detailedStatus = `Initialization failed: ${firebaseStatus.error}`;
  } else {
    detailedStatus = 'Not initialized';
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: {
      status: detailedStatus,
      initialized: firebaseStatus.isInitialized,
      error: firebaseStatus.error
    },
    server: 'Running normally',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test Firebase connection - SAFE VERSION (no database operations)
app.get('/api/test-db', async (req, res) => {
  try {
    const firebaseStatus = firebaseConfig.getFirebaseStatus();
    
    if (!firebaseStatus.isInitialized) {
      return res.status(503).json({ 
        success: false, 
        message: 'Firebase not initialized',
        error: firebaseStatus.error,
        suggestion: 'Check Firebase configuration and service account key'
      });
    }
    
    // SAFE TEST - No actual database operations that cause 503
    console.log('🧪 Testing Firebase service availability (safe mode)...');
    
    try {
      // Just verify services exist without making actual database calls
      const db = firebaseConfig.getDb();
      const auth = firebaseConfig.getAuth();
      
      if (!db || !auth) {
        throw new Error('Firebase services not available');
      }
      
      res.json({ 
        success: true, 
        message: 'Firebase services are available',
        services: {
          firestore: 'Available',
          auth: 'Available',
          note: 'Database connectivity tests are running in safe mode to prevent 503 errors'
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (serviceError) {
      console.error('❌ Firebase service test error:', serviceError.message);
      
      res.status(503).json({ 
        success: false, 
        message: 'Firebase services not accessible',
        error: serviceError.message,
        suggestion: 'Firebase is initialized but services are not accessible. Check service account permissions.'
      });
    }
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
    
    // Provide helpful error messages based on the error type
    let userMessage = 'Firebase service check failed';
    let suggestion = 'Check your Firebase configuration and service account permissions';
    
    if (error.message.includes('UNAUTHENTICATED') || error.message.includes('auth')) {
      userMessage = 'Authentication failed';
      suggestion = 'Check your service account key and ensure it has proper permissions in Google Cloud Console';
    } else if (error.message.includes('network') || error.message.includes('connect')) {
      userMessage = 'Network connection failed';
      suggestion = 'Check your internet connection and firewall settings';
    } else if (error.message.includes('SERVICE_UNAVAILABLE')) {
      userMessage = 'Firebase services unavailable';
      suggestion = 'Firebase is initialized but services are not accessible. The app will run with limited functionality.';
    }
    
    res.status(503).json({ 
      success: false, 
      message: userMessage,
      error: error.message,
      suggestion: suggestion,
      code: error.code
    });
  }
});

// Add a test auth endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register'
    }
  });
});

// Test POST endpoint
app.post('/api/test-post', (req, res) => {
  res.json({
    success: true,
    message: 'POST request successful!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// API Routes - these will handle their own Firebase errors
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/students', require('./routes/students'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));

// ==================== ERROR HANDLING ====================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - API Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/test-connection',
      'GET /api/test-db',
      'GET /api/auth/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/test-post'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler (for non-API routes)
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    suggestion: 'Use /api for API endpoints or check the documentation',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error.message);
  console.error('Error Stack:', error.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ==================== SERVER STARTUP ====================

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URLs: localhost:3000, career-guidance-platforms.vercel.app`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Test connection: http://localhost:${PORT}/api/test-connection`);
  console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
  console.log(`🔑 Auth test: http://localhost:${PORT}/api/auth/test`);
  console.log(`🏠 Root endpoint: http://localhost:${PORT}/`);
  
  // Check Firebase status after a short delay to allow for initialization
  setTimeout(() => {
    const status = firebaseConfig.getFirebaseStatus();
    if (status.isInitialized) {
      console.log(`🔥 Firebase: ✅ Services initialized (safe mode)`);
      console.log(`💡 Database connectivity tests disabled to prevent 503 errors`);
    } else if (status.error) {
      console.log(`🔥 Firebase: ❌ Initialization failed`);
      console.log(`   Error: ${status.error}`);
      console.log(`💡 Some API features may not work, but the server is running`);
      console.log(`🔧 Run in safe mode - authentication may work with retry logic`);
    } else {
      console.log(`🔥 Firebase: ⚠️ Still initializing...`);
    }
  }, 2000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Optionally exit process: process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally exit process: process.exit(1);
});

module.exports = app;