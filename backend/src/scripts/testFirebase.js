const { db } = require('../config/firebase');

const testFirebaseConnection = async () => {
  try {
    console.log('🔌 Testing Firebase connection...');
    
    // First, just try to list collections (read-only, safer)
    console.log('📖 Testing read operation...');
    const collections = await db.listCollections();
    console.log('✅ Read operation successful');
    console.log('📁 Collections found:', collections.map(col => col.id));
    
    // If we can read, try a simple write operation
    console.log('📝 Testing write operation...');
    const testData = {
      message: 'Firebase connection test',
      timestamp: new Date(),
      status: 'success'
    };
    
    const testDoc = await db.collection('connection_tests').add(testData);
    console.log('✅ Write operation successful');
    console.log('📄 Test document created with ID:', testDoc.id);
    
    // Verify the write by reading it back
    const docSnapshot = await db.collection('connection_tests').doc(testDoc.id).get();
    if (docSnapshot.exists) {
      console.log('✅ Read verification successful');
      console.log('📊 Document data:', docSnapshot.data());
    }
    
    // Clean up
    await db.collection('connection_tests').doc(testDoc.id).delete();
    console.log('🧹 Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    
    // More detailed error information
    if (error.code === 16) {
      console.log('💡 This is an authentication error. Possible causes:');
      console.log('   • Incorrect service account credentials');
      console.log('   • Project ID mismatch');
      console.log('   • System time out of sync');
      console.log('   • Firebase project not properly configured');
    }
    
    return false;
  }
};

// Run the test
testFirebaseConnection().then(success => {
  if (success) {
    console.log('🎉 All Firebase tests passed!');
    console.log('🚀 You can now run the database initialization script.');
  } else {
    console.log('💥 Firebase tests failed');
    console.log('🔧 Please check your Firebase project configuration');
    process.exit(1);
  }
});