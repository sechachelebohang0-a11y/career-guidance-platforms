const fs = require('fs');
const path = require('path');

console.log('🔍 Checking service account configuration...');

const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ serviceAccountKey.json not found in backend directory');
  console.log('💡 Please download it from Firebase Console:');
  console.log('   1. Go to Project Settings > Service Accounts');
  console.log('   2. Click "Generate New Private Key"');
  console.log('   3. Save as serviceAccountKey.json in backend folder');
  process.exit(1);
}

// Check file content
try {
  const serviceAccount = require(serviceAccountPath);
  console.log('✅ serviceAccountKey.json found and valid');
  console.log('📋 Project ID:', serviceAccount.project_id);
  console.log('📧 Client Email:', serviceAccount.client_email);
  
  // Check required fields
  const requiredFields = ['project_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields);
    process.exit(1);
  }
  
  console.log('✅ All required fields present');
  
} catch (error) {
  console.log('❌ Invalid serviceAccountKey.json:', error.message);
  process.exit(1);
}