const { getDb, getUsersRef, waitForInit } = require('../config/firebase');
const bcrypt = require('bcryptjs');

async function testAuthSetup() {
  try {
    console.log('🧪 Testing authentication setup...');
    
    // Wait for Firebase to be fully initialized
    console.log('⏳ Waiting for Firebase initialization...');
    await waitForInit();
    console.log('✅ Firebase is initialized');

    // Use the getters
    const db = await getDb();
    const usersRef = await getUsersRef();

    // Test database connection
    console.log('🔌 Testing database connection...');
    const collections = await db.listCollections();
    console.log('✅ Database connection working');
    console.log('📁 Collections found:', collections.length);

    // Test password hashing
    console.log('🔐 Testing password hashing...');
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log('✅ Password hashing working:', isValid);
    
    console.log('🎉 Authentication setup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication setup test failed:', error.message);
  }
}

// Run the test
testAuthSetup();