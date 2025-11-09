const fs = require('fs');

console.log('🔧 Setting up environment...');

// Set environment variable for Google credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = './serviceAccountKey.json';

console.log('✅ GOOGLE_APPLICATION_CREDENTIALS set to:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('💡 Now run: node src/scripts/simpleConnectionTest.js');