require('dotenv').config();

console.log('🔍 Verifying environment variables...');

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Private key starts with:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 50));
  console.log('Private key contains \\n:', process.env.FIREBASE_PRIVATE_KEY.includes('\\n') ? '✅ Yes' : '❌ No - this is the problem!');
}

console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');