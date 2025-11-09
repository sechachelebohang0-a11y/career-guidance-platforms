const { db } = require('../config/firebase');

const healthCheck = async () => {
  try {
    console.log('🏥 Running system health check...');
    
    // Check Firebase connection
    if (!db) {
      console.log('❌ Firebase not initialized');
      return false;
    }
    
    // Test database connection
    const collections = await db.listCollections();
    console.log('✅ Database connected');
    console.log('📁 Collections found:', collections.map(col => col.id));
    
    // Check environment variables
    console.log('🔧 Environment check:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   PORT:', process.env.PORT);
    console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
    
    console.log('💚 System health: OK');
    return true;
    
  } catch (error) {
    console.error('💥 System health check failed:', error.message);
    return false;
  }
};

// Add to package.json scripts
// "health-check": "node src/scripts/health-check.js"

healthCheck();