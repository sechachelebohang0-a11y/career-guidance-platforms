const axios = require('axios');

// Test Firestore REST API directly
const testRestApi = async () => {
  try {
    console.log('🌐 Testing Firestore REST API...');
    
    const projectId = 'career-guidance-platform-fb672';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    
    const response = await axios.get(url);
    console.log('✅ REST API connection successful!');
    console.log('📊 Response status:', response.status);
    
    return true;
  } catch (error) {
    console.error('❌ REST API failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

testRestApi().then(success => {
  if (success) {
    console.log('🎉 Firestore REST API is accessible');
  } else {
    console.log('💥 Check your Firestore database setup');
  }
});