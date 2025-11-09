const { execSync } = require('child_process');
require('dotenv').config();

console.log('🔧 Checking Firebase Project Setup...');

const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  console.log('❌ FIREBASE_PROJECT_ID not set in .env');
  process.exit(1);
}

console.log('Project ID:', projectId);

try {
  // Check if we can access Firestore (this is a basic test)
  console.log('📋 Testing Firestore access...');
  
  // This will try to list collections - if it fails, we know the issue
  const testScript = `
    const admin = require('firebase-admin');
    const serviceAccount = {
      projectId: '${projectId}',
      privateKey: '${process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')}',
      clientEmail: '${process.env.FIREBASE_CLIENT_EMAIL}'
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://${projectId}.firebaseio.com'
    });
    
    const db = admin.firestore();
    db.listCollections().then(collections => {
      console.log('✅ Firestore accessible. Collections:', collections.length);
      process.exit(0);
    }).catch(error => {
      console.log('❌ Firestore access failed:', error.message);
      process.exit(1);
    });
  `;
  
  // Write temp file and execute
  require('fs').writeFileSync('temp-test.js', testScript);
  execSync('node temp-test.js', { stdio: 'inherit' });
  require('fs').unlinkSync('temp-test.js');
  
} catch (error) {
  console.log('❌ Setup check failed');
}