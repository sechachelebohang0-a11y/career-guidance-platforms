const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

console.log('🔍 Firebase Diagnostic Tool\n');

async function diagnose() {
  try {
    // Check service account file
    const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
    console.log('1. Checking service account file...');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('❌ serviceAccountKey.json not found at:', serviceAccountPath);
      return;
    }
    
    const serviceAccount = require(serviceAccountPath);
    console.log('✅ Service account file found');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);
    
    // Try to initialize
    console.log('\n2. Initializing Firebase Admin...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized');
    
    // Test Firestore
    console.log('\n3. Testing Firestore...');
    const db = admin.firestore();
    
    // Simple list collections test
    const collections = await db.listCollections();
    console.log('✅ Firestore connection successful');
    console.log('   Available collections:', collections.map(col => col.id));
    
    console.log('\n🎉 All diagnostics passed! Firebase is configured correctly.');
    
  } catch (error) {
    console.log('\n❌ Diagnostic failed:');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    
    if (error.message.includes('UNAUTHENTICATED')) {
      console.log('\n💡 Solution:');
      console.log('   - Regenerate your service account key in Firebase Console');
      console.log('   - Ensure Firestore API is enabled in Google Cloud Console');
      console.log('   - Check if your project has Firebase enabled');
    }
  }
}

diagnose();