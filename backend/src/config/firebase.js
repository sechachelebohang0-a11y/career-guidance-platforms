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

    // Validate service account
    if (!serviceAccount.private_key || serviceAccount.private_key.includes('YOUR_PRIVATE_KEY')) {
      throw new Error('Invalid private key in service account');
    }

    // Initialize Firebase Admin with better error handling
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    
    // Initialize services
    db = admin.firestore();
    auth = admin.auth();
    
    console.log('✅ Firestore service initialized');
    console.log('✅ Firebase Auth initialized');
    
    // Test connection with simple operation
    try {
      const collections = await db.listCollections();
      console.log('📁 Available collections:', collections.map(col => col.id));
      isInitialized = true;
      initializationError = null;
      console.log('🎉 Firebase initialization completed!');
    } catch (testError) {
      console.error('❌ Firestore connection test failed:', testError.message);
      throw testError;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    initializationError = error;
    isInitialized = false;
    
    // Provide specific error messages
    if (error.message.includes('private')) {
      console.error('💡 Solution: Check your service account private key format');
    } else if (error.message.includes('auth')) {
      console.error('💡 Solution: Verify service account permissions in Google Cloud Console');
    }
    
    return false;
  }
};

// Initialize immediately
const initPromise = initializeFirebase();

module.exports = {
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
  
  getAdmin: () => admin,
  
  // Collection references
  getUsersRef: () => {
    const database = module.exports.getDb();
    return database.collection('users');
  },
  
  getStudentsRef: () => {
    const database = module.exports.getDb();
    return database.collection('students');
  },
  
  getInstitutionsRef: () => {
    const database = module.exports.getDb();
    return database.collection('institutions');
  },
  
  getCompaniesRef: () => {
    const database = module.exports.getDb();
    return database.collection('companies');
  },
  
  getCoursesRef: () => {
    const database = module.exports.getDb();
    return database.collection('courses');
  },
  
  getJobsRef: () => {
    const database = module.exports.getDb();
    return database.collection('jobs');
  },
  
  