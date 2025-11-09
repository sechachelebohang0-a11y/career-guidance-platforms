const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function checkConnection() {
  console.log('🔍 Checking Firebase Connection...');
  console.log('=================================');

  try {
    // Check if service account file exists
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('❌ serviceAccountKey.json not found');
      console.log('💡 Please place the service account file in backend/ folder');
      process.exit(1);
    }

    console.log('✅ serviceAccountKey.json found');
    
    const serviceAccount = require(serviceAccountPath);
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    console.log('🔑 Private Key ID:', serviceAccount.private_key_id);

    // Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    console.log('✅ Firebase Admin SDK initialized');

    // Test Firestore
    const db = admin.firestore();
    console.log('🔌 Testing Firestore connection...');
    
    const collections = await db.listCollections();
    console.log('✅ Firestore connected successfully!');
    console.log('📁 Collections:', collections.map(col => col.id));

    // Test Auth
    const auth = admin.auth();
    console.log('🔐 Testing Auth connection...');
    
    await auth.listUsers(1);
    console.log('✅ Firebase Auth connected successfully!');

    console.log('🎉 ALL CONNECTIONS SUCCESSFUL!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 7) {
      console.log('💡 Firestore not enabled. Please enable it in Firebase Console.');
    } else if (error.code === 16) {
      console.log('💡 Authentication failed. Check service account permissions.');
    }
  }
}

// Run the check
checkConnection();