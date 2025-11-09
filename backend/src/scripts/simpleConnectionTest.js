const { db, collection, getDocs } = require('../config/firebase');

const testConnection = async () => {
  try {
    console.log('🧪 Testing Firestore connection with Web SDK...');
    
    // Try to read from a test collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    
    console.log('✅ Successfully connected to Firestore!');
    console.log('📁 Test documents:', snapshot.docs.map(doc => doc.id));
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    return false;
  }
};

testConnection().then(success => {
  if (success) {
    console.log('🎉 Firebase Web SDK is working!');
    process.exit(0);
  } else {
    console.log('💥 Connection failed with Web SDK');
    process.exit(1);
  }
});