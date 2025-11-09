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
    console.log('📧 Client Email:', serviceAccount.client_email);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Initialize services - KEEP DATABASE CONNECTION
    db = admin.firestore();
    auth = admin.auth();
    
    console.log('✅ Firestore service initialized');
    console.log('✅ Firebase Auth initialized');
    
    // Test Firestore connection - KEEP DATABASE CONNECTION
    try {
      const collections = await db.listCollections();
      console.log('📁 Available collections:', collections.map(col => col.id));
    } catch (readError) {
      console.log('⚠️ Note: Firestore read access might be limited');
    }
    
    isInitialized = true;
    initializationError = null;
    console.log('🎉 Firebase initialization completed!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    initializationError = error;
    isInitialized = false;
    return false;
  }
};

// Initialize immediately - KEEP DATABASE CONNECTION
const initPromise = initializeFirebase();

// Define firebaseService object - KEEP ALL DATABASE REFERENCES
const firebaseService = {
  // Safe getters - KEEP DATABASE ACCESS
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
  
  // Collection references - KEEP ALL DATABASE COLLECTIONS
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