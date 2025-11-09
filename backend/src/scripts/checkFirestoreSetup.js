const axios = require('axios');

const checkFirestoreSetup = async () => {
  console.log('🔍 Checking Firestore database setup...');
  
  const projectId = 'career-guidance-platform-fb672';
  
  // Check if Firestore is enabled for this project
  try {
    const response = await axios.get(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`,
      { timeout: 10000 }
    );
    
    console.log('✅ Firestore is enabled and accessible');
    console.log('📡 Endpoint responding correctly');
    return true;
    
  } catch (error) {
    console.error('❌ Firestore check failed:', error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 Firestore database might not be created yet');
      console.log('   Go to: https://console.firebase.google.com/');
      console.log('   Select your project → Firestore Database → Create Database');
    } else if (error.response?.status === 403) {
      console.log('💡 API not enabled or insufficient permissions');
      console.log('   Enable Firestore API in Google Cloud Console');
    }
    
    return false;
  }
};

checkFirestoreSetup();