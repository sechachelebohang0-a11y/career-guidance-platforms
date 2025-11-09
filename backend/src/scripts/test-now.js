const admin = require('firebase-admin');

const serviceAccount = require('./src/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function test() {
  try {
    console.log('🔄 Testing Firestore with new rules...');
    
    // Test 1: List collections
    const collections = await db.listCollections();
    console.log('✅ Collections:', collections.map(c => c.id));
    
    // Test 2: Read from courses
    const coursesSnapshot = await db.collection('courses').get();
    console.log(`✅ Courses found: ${coursesSnapshot.size}`);
    
    // Test 3: Write a test document
    const testRef = db.collection('test').doc('connection');
    await testRef.set({
      message: 'Firebase connection test',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Write test passed');
    
    // Test 4: Read it back
    const testDoc = await testRef.get();
    console.log('✅ Read test passed:', testDoc.data());
    
    // Test 5: Clean up
    await testRef.delete();
    console.log('✅ Delete test passed');
    
    console.log('🎉 ALL TESTS PASSED! Firebase is working perfectly!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
  }
}

test();