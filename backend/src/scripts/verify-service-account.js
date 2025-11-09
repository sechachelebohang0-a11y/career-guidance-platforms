const admin = require('firebase-admin');
require('dotenv').config();

console.log('🔍 Verifying Service Account Configuration...');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log('Project ID:', serviceAccount.projectId);
console.log('Client Email:', serviceAccount.clientEmail);
console.log('Private Key Length:', serviceAccount.privateKey.length);
console.log('Private Key Starts With:', serviceAccount.privateKey.substring(0, 50));

// Test if we can create a credential
try {
  const credential = admin.credential.cert(serviceAccount);
  console.log('✅ Service account credential created successfully');
} catch (error) {
  console.log('❌ Service account credential creation failed:', error.message);
}