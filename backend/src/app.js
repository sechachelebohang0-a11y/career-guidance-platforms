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
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL].filter(Boolean),
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

// Simple API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Career Guidance Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'Running'
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

// Health check route
app.get('/api/health', async (req, res) => {
  const firebaseStatus = firebaseConfig.getFirebaseStatus();
  
  let detailedStatus = 'Unknown';
  let collections = [];
  
  if (firebaseStatus.isInitialized) {
    try {
      const db = firebaseConfig.getDb();
      const collectionsList = await db.listCollections();
      collections = collectionsList.map(col => col.id);
      detailedStatus = 'Connected and responsive';
    } catch (error) {
      detailedStatus = `Initialized but error: ${error.message}`;
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
      error: firebaseStatus.error,
      collections: collections
    },
    server: 'Running normally'
  });
});

// Test Firebase connection
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
    
    const db = firebaseConfig.getDb();
    
    console.log('🧪 Testing Firestore connection...');
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    
    res.json({ 
      success: true, 
      message: 'Firestore connection successful',
      collections: collectionNames,
      count: collectionNames.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test error:', error.message);
    
    let userMessage = 'Database connection test failed';
    let suggestion = 'Check your Firebase configuration and service account permissions';
    
    if (error.message.includes('UNAUTHENTICATED') || error.message.includes('auth')) {
      userMessage = 'Authentication failed';
      suggestion = 'Check your service account key and ensure it has proper permissions in Google Cloud Console';
    } else if (error.message.includes('network') || error.message.includes('connect')) {
      userMessage = 'Network connection failed';
      suggestion = 'Check your internet connection and firewall settings';
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/students', require('./routes/students'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    headers: req.headers
  });
  next();
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

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
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

// Start server
const PORT = process.env.PORT || 5001;

// Wait for Firebase initialization before starting server
firebaseConfig.waitForInit().then((success) => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔌 Test connection: http://localhost:${PORT}/api/test-connection`);
    console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
    console.log(`🔧 API Base: http://localhost:${PORT}/api`);
    console.log(`🔑 Auth test: http://localhost:${PORT}/api/auth/test`);
    
    const status = firebaseConfig.getFirebaseStatus();
    if (status.isInitialized) {
      console.log(`🔥 Firebase: ✅ Connected and ready`);
    } else if (status.error) {
      console.log(`🔥 Firebase: ❌ Initialization failed`);
      console.log(`   Error: ${status.error}`);
      console.log(`💡 Some API features may not work, but the server is running`);
    } else {
      console.log(`🔥 Firebase: ⚠️ Still initializing...`);
    }
  });
}).catch((error) => {
  console.error('💥 Failed to initialize Firebase:', error);
  console.log('⚠️ Starting server anyway, but Firebase features will not work');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} (without Firebase)`);
    console.log(`💡 Please fix Firebase configuration to enable full functionality`);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reaso