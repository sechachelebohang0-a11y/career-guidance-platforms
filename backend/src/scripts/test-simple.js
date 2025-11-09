const admin = require('firebase-admin');
const serviceAccount = require('./src/config/serviceAccountKey.json');

console.log('🧪 Simple Firebase Test');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function test() {
  try {
    console.log('Testing Firestore...');
    // Just try to read collections (no write operation)
    const collections = await db.listCollections();
    console.log('✅ SUCCESS! Collections:', collections.map(c => c.id));
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Code:', error.code);
  }
}

test();