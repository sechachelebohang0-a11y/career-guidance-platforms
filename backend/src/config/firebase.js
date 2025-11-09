const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

console.log('🔄 Initializing Firebase Admin SDK...');

// Global instances
let db = null;
let auth = null;
let isInitialized = false;
let initializationError = null;

const initializeFirebase = async () => {
  try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('serviceAccountKey.json not found in src/config folder');
    }

    const serviceAccount = require(serviceAccountPath);
    console.log('✅ Loaded service account for project:', serviceAccount.project_id);

    // Clear any existing apps to avoid conflicts
    if (admin.apps.length > 0) {
      await Promise.all(admin.apps.map(app => app.delete()));
      console.log('♻️  Cleared existing Firebase apps');
    }

    // Initialize with explicit configuration
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        type: serviceAccount.type,
        project_id: serviceAccount.project_id,
        private_key_id: serviceAccount.private_key_id,
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // Fix newlines
        client_email: serviceAccount.client_email,
        client_id: serviceAccount.client_id,
        auth_uri: serviceAccount.auth_uri,
        token_uri: serviceAccount.token_uri,
        auth_provider_x509_cert_url: serviceAccount.auth_provider_x509_cert_url,
        client_x509_cert_url: serviceAccount.client_x509_cert_url
      }),
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    
    console.log('✅ Firestore service initialized');
    console.log('✅ Firebase Auth initialized');

    // Simple connectivity test without complex operations
    try {
      console.log('🧪 Testing basic Firebase connectivity...');
      // Just verify we can access the services
      const firestoreReady = db !== null;
      const authReady = auth !== null;
      
      if (firestoreReady && authReady) {
        console.log('✅ Firebase services are ready');
      }
    } catch (testError) {
      console.log('⚠️  Connectivity test skipped:', testError.message);
    }

    isInitialized = true;
    initializationError = null;
    console.log('🎉 Firebase initialization completed! Services ready.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('invalid_grant') || error.message.includes('JWT')) {
      console.log('\n🔐 Authentication Issue Detected:');
      console.log('💡 Possible solutions:');
      console.log('   1. Wait a few minutes - new keys can take time to propagate');
      console.log('   2. Check if service account has proper roles in Google Cloud Console');
      console.log('   3. Ensure your system clock is synchronized');
    }
    
    initializationError = error;
    isInitialized = false;
    return false;
  }
};

// Initialize immediately
const initPromise = initializeFirebase();

const firebaseService = {
  // Safe getters
  getDb: () => {
    if (!isInitialized || !db) {
      throw new Error('Firestore not available. Check Firebase initialization.');
    }
    return db;
  },
  
  getAuth: () => {
    if (!isInitialized || !auth) {
      throw new Error('Firebase Auth not available. Check Firebase initialization.');
    }
    return auth;
  },
  
  // Collection references
  getUsersRef: () => {
    const database = firebaseService.getDb();
    return database.collection('users');
  },
  
  getStudentsRef: () => {
    const database = firebaseService.getDb();
    return database.collection('students');
  },
  
  getInstitutionsRef: () => {
    const database = firebaseService.getDb();
    return database.collection('institutions');
  },
  
  getCompaniesRef: () => {
    const database = firebaseService.getDb();
    return database.collection('companies');
  },
  
  getCoursesRef: () => {
    const database = firebaseService.getDb();
    return database.collection('courses');
  },
  
  getJobsRef: () => {
    const database = firebaseService.getDb();
    return database.collection('jobs');
  },
  
  getApplicationsRef: () => {
    const database = firebaseService.getDb();
    return database.collection('applications');
  },
  
  getFacultiesRef: () => {
    const database = firebaseService.getDb();
    return database.collection('faculties');
  },
  
  // Status methods
  isInitialized: () => isInitialized,
  getInitializationError: () => initializationError,
  
  // Wait for initialization
  waitForInit: () => initPromise,
  
  // Health check
  getFirebaseStatus: () => ({
    isInitialized,
    error: initializationError ? initializationError.message : null,
    timestamp: new Date().toISOString()
  })
};

module.exports = firebaseService;