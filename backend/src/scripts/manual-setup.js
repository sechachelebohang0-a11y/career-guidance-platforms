require('dotenv').config();

console.log('🔧 MANUAL FIREBASE SETUP VERIFICATION');
console.log('=====================================');

console.log('\n📋 STEP 1: Check Environment Variables');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY present:', !!process.env.FIREBASE_PRIVATE_KEY);

console.log('\n📋 STEP 2: Required Firebase Setup');
console.log('1. Go to: https://console.firebase.google.com/');
console.log('2. Select project:', process.env.FIREBASE_PROJECT_ID);
console.log('3. Enable Firestore:');
console.log('   - Go to Firestore Database');
console.log('   - Click "Create Database"');
console.log('   - Choose "Start in test mode"');
console.log('4. Enable Authentication:');
console.log('   - Go to Authentication');
console.log('   - Click "Get Started"');
console.log('   - Enable Email/Password provider');

console.log('\n📋 STEP 3: Service Account Permissions');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Select project:', process.env.FIREBASE_PROJECT_ID);
console.log('3. Go to IAM & Admin > Service Accounts');
console.log('4. Find:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('5. Ensure it has "Firebase Admin SDK Administrator" role');

console.log('\n📋 STEP 4: Enable APIs');
console.log('Ensure these APIs are enabled:');
console.log('- Firestore API');
console.log('- Identity Toolkit API');

console.log('\n🚀 After completing these steps, run: npm run test-auth');