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
    let serviceAccount;
    
    // For Render deployment - check environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('🚀 Using Firebase service account from environment variables');
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Loaded service account for project:', serviceAccount.project_id);
        console.log('📧 Client Email:', serviceAccount.client_email);
      } catch (parseError) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${parseError.message}`);
      }
    } else {
      // For local development - use service account file from config folder
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
      
      console.log('🔍 Looking for service account at:', serviceAccountPath);
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`serviceAccountKey.json not found at: ${serviceAccountPath}`);
      }

      serviceAccount = require(serviceAccountPath);
      console.log('✅ Loaded service account for project:', serviceAccount.project_id);
      console.log('📧 Client Email:', serviceAccount.client_email);
    }

    // Initialize Firebase Admin with more options
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    
    // Configure Firestore settings
    db.settings({ 
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true
    });
    
    console.log('✅ Firestore service initialized');
    console.log('✅ Firebase Auth initialized');
    
    // Test Firestore connection with comprehensive error handling
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // Try a simple operation first
      const testDoc = db.collection('_test_connection').doc('test');
      await testDoc.set({ test: true, timestamp: new Date() });
      await testDoc.delete();
      
      // Then list collections
      const collections = await db.listCollections();
      console.log('📁 Available collections:', collections.map(col => col.id));
      console.log('🎉 Firebase connection test successful!');
      
    } catch (readError) {
      console.log('🔐 Firebase Connection Error Analysis:');
      console.log('   Error Code:', readError.code);
      console.log('   Error Message:', readError.message);
      
      if (readError.code === 16 || readError.message.includes('UNAUTHENTICATED')) {
        console.log('💡 UNAUTHENTICATED Error Solutions:');
        console.log('   1. Go to Google Cloud Console → IAM & Admin → IAM');
        console.log('   2. Find service account:', serviceAccount.client_email);
        console.log('   3. Add these roles:');
        console.log('      - Firebase Admin SDK Administrator Service Agent');
        console.log('      - Cloud Datastore Owner');
        console.log('      - Firestore Service Agent');
        console.log('      - Service Account Token Creator');
        console.log('      - Service Account User');
        console.log('   4. Wait 5-10 minutes for permissions to propagate');
      } else if (readError.code === 7 || readError.message.includes('PERMISSION_DENIED')) {
        console.log('💡 PERMISSION_DENIED Error Solutions:');
        console.log('   1. Enable Firestore API in Google Cloud Console');
        console.log('   2. Check if Firestore database is created in Firebase Console');
        console.log('   3. Verify project billing is enabled');
      }
      
      console.log('🔧 App will continue running with limited database functionality');
    }
    
    isInitialized = true;
    initializationError = null;
    console.log('🎉 Firebase initialization completed!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('   Stack:', error.stack);
    initializationError = error;
    isInitialized = false;
    return false;
  }
};

// Initialize immediately
const initPromise = initializeFirebase();

// Define firebaseService object
const firebaseService = {
  // Safe getters
  getDb: () => {
    if (!db) {
      throw new Error('Firestore not available. Check Firebase initialization.');
    }
    return db;
  },
  
  getAuth: () => {
    if (!auth) {
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