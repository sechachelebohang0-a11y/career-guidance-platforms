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
    }

    console.log('✅ Loaded service account for project:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);

    // Initialize Firebase Admin with explicit settings
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    
    // Configure Firestore with optimized settings
    db.settings({
      ignoreUndefinedProperties: true,
      preferRest: false // Force gRPC connection
    });
    
    console.log('✅ Firestore service initialized');
    console.log('✅ Firebase Auth initialized');
    
    // Test Firestore connection with specific error handling
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // Try different operations to pinpoint the issue
      console.log('   Testing collection listing...');
      const collections = await db.listCollections();
      console.log('   ✅ Collection listing successful');
      console.log('   📁 Available collections:', collections.map(col => col.id));
      
      // Test reading from an existing collection
      console.log('   Testing document read...');
      const usersSnapshot = await db.collection('users').limit(1).get();
      console.log(`   ✅ Document read successful - Found ${usersSnapshot.size} users`);
      
      console.log('🎉 All Firestore tests passed! Database is fully accessible.');
      
    } catch (error) {
      console.log('🔐 Detailed Firebase Error Analysis:');
      console.log('   Error Code:', error.code);
      console.log('   Error Message:', error.message);
      
      if (error.code === 16) {
        console.log('💡 UNAUTHENTICATED Error Solutions:');
        console.log('   Your service account has the correct roles but there might be:');
        console.log('   1. ROLE CONFLICT - Remove these conflicting roles:');
        console.log('      - Editor (conflicts with Firebase-specific roles)');
        console.log('      - Firebase Admin (redundant)');
        console.log('      - Firebase Authentication Admin (redundant)');
        console.log('   2. Keep only these essential roles:');
        console.log('      - Firebase Admin SDK Administrator Service Agent');
        console.log('      - Cloud Datastore Owner');
        console.log('      - Firestore Service Agent');
        console.log('      - Service Account Token Creator');
        console.log('   3. Wait 10-15 minutes for permission propagation');
        console.log('   4. Try regenerating the service account key');
      }
      
      if (error.details) {
        console.log('   Additional Details:', error.details);
      }
      
      console.log('🔧 App will continue running. Some features may be limited until Firebase is fully configured.');
    }
    
    isInitialized = true;
    initializationError = null;
    console.log('🎉 Firebase initialization completed!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('   Stack trace:', error.stack);
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