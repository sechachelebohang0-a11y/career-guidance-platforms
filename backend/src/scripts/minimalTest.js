const admin = require('firebase-admin');

console.log('🧪 Minimal Firebase test...');

// Initialize with just project ID
admin.initializeApp({
  projectId: 'career-guidance-platform-fb672'
});

const db = admin.firestore();

// Simple test - just try to connect
db.collection('test').get()
  .then(() => {
    console.log('✅ Firebase connection successful!');
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ Connection failed:', error.message);
    
    if (error.code === 7) {
      console.log('💡 Missing permissions - check Firestore rules');
    } else if (error.code === 16) {
      console.log('💡 Authentication failed - check credentials');
    }
    
    process.exit(1);
  });