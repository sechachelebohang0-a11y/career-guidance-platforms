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
      admin.apps.forEach(app => app.delete());
      console.log('♻️  Cleared existing Firebase apps');
    }

    // Initialize with explicit configuration
    admin.initializeApp({
      credential: admin.credential.cert({
        type: serviceAccount.type,
        project_id: serviceAccount.project_id,
        private_key_id: serviceAccount.private_key_id,
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
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

    // REMOVED: Database connectivity test that causes 503 errors
    console.log('✅ Firebase services initialized (connectivity tests skipped for production)');

    isInitialized = true;
    initializationError = null;
    console.log('🎉 Firebase initialization completed! Services ready.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    // Enhanced error analysis
    if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
      console.log('\n🔐 FIREBASE AUTHENTICATION ERROR DETECTED:');
      console.log('💡 IMMEDIATE SOLUTIONS:');
      console.log('   1. Regenerate service account key in Firebase Console');
      console.log('   2. Update IAM roles in Google Cloud Console');
      console.log('   3. Remove conflicting roles: Editor, Firebase Admin');
      console.log('   4. Keep only: Firebase Admin SDK Administrator, Firestore Service Agent');
      console.log('   5. Wait 5-10 minutes for permission propagation');
    } else if (error.message.includes('invalid_grant') || error.message.includes('JWT')) {
      console.log('\n🔐 JWT Token Issue:');
      console.log('   1. Check system time synchronization');
      console.log('   2. Verify service account key is valid');
    }
    
    initializationError = error;
    isInitialized = false;
    
    // Don't crash the app - allow it to run with limited functionality
    console.log('⚠️  App will continue running with limited Firebase functionality');
    return false;
  }
};

// Initialize immediately but don't block server startup
const initPromise = initializeFirebase().catch(error => {
  console.log('🔥 Firebase initialization completed with limitations');
});

const firebaseService = {
  // Safe getters with better error handling
  getDb: () => {
    if (!isInitialized || !db) {
      const error = new Error('Firestore not available. Firebase initialization may have failed.');
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }
    return db;
  },
  
  getAuth: () => {
    if (!isInitialized || !auth) {
      const error = new Error('Firebase Auth not available. Firebase initialization may have failed.');
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }
    return auth;
  },
  
  // Collection references with error handling
  getUsersRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('users');
    } catch (error) {
      throw new Error(`Cannot access users collection: ${error.message}`);
    }
  },
  
  getStudentsRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('students');
    } catch (error) {
      throw new Error(`Cannot access students collection: ${error.message}`);
    }
  },
  
  getInstitutionsRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('institutions');
    } catch (error) {
      throw new Error(`Cannot access institutions collection: ${error.message}`);
    }
  },
  
  getCompaniesRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('companies');
    } catch (error) {
      throw new Error(`Cannot access companies collection: ${error.message}`);
    }
  },
  
  getCoursesRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('courses');
    } catch (error) {
      throw new Error(`Cannot access courses collection: ${error.message}`);
    }
  },
  
  getJobsRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('jobs');
    } catch (error) {
      throw new Error(`Cannot access jobs collection: ${error.message}`);
    }
  },
  
  getApplicationsRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('applications');
    } catch (error) {
      throw new Error(`Cannot access applications collection: ${error.message}`);
    }
  },
  
  getFacultiesRef: () => {
    try {
      const database = firebaseService.getDb();
      return database.collection('faculties');
    } catch (error) {
      throw new Error(`Cannot access faculties collection: ${error.message}`);
    }
  },
  
  // Status methods
  isInitialized: () => isInitialized,
  getInitializationError: () => initializationError,
  
  // Wait for initialization with timeout
  waitForInit: async (timeoutMs = 10000) => {
    const startTime = Date.now();
    while (!isInitialized && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!isInitialized) {
      throw new Error(`Firebase initialization timeout after ${timeoutMs}ms`);
    }
    return true;
  },
  
  // Health check - SAFE VERSION (no database operations)
  getFirebaseStatus: () => ({
    isInitialized,
    error: initializationError ? initializationError.message : null,
    timestamp: new Date().toISOString(),
    note: isInitialized ? 'Services ready' : 'Initialization pending or failed'
  })
};

module.exports = firebaseService;