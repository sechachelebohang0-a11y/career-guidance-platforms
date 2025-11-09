const admin = require('firebase-admin');

// If the app is already initialized, use that instance
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Update path

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Handle the error appropriately for your application
  }
}

const db = admin.firestore();
module.exports = { admin, db };