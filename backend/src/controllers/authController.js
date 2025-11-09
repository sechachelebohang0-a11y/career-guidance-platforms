const { getUsersRef, getStudentsRef, getInstitutionsRef, getCompaniesRef, getAuth, waitForInit, isInitialized } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Retry utility for Firebase operations
const withRetry = async (operation, maxRetries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      if (error.code === 16 || error.message.includes('UNAUTHENTICATED') || error.message.includes('SERVICE_UNAVAILABLE')) {
        console.log(`🔄 Firebase operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        throw error;
      }
    }
  }
};

const register = async (req, res) => {
  try {
    console.log('🔐 Registration attempt started...');
    
    // Wait for Firebase initialization with timeout
    try {
      await waitForInit(5000); // 5 second timeout
    } catch (timeoutError) {
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service is starting up. Please try again in a moment.',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!isInitialized()) {
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString()
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, ...userData } = req.body;

    console.log('📝 Processing registration for:', email, 'Role:', role);

    try {
      // Use retry wrapper for Firebase operations
      await withRetry(async () => {
        const usersRef = getUsersRef();
        const auth = getAuth();

        // Check if user already exists
        const existingUser = await usersRef.where('email', '==', email).get();
        if (!existingUser.empty) {
          throw new Error('USER_EXISTS');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user in Firebase Auth
        let userRecord;
        try {
          userRecord = await auth.createUser({
            email,
            password,
            emailVerified: false,
            disabled: false,
          });
          console.log('✅ Firebase Auth user created:', userRecord.uid);
        } catch (authError) {
          console.error('❌ Firebase Auth creation failed:', authError.message);
          throw new Error(`AUTH_CREATION_FAILED: ${authError.message}`);
        }

        // Create user document in Firestore
        const userDoc = {
          uid: userRecord.uid,
          email,
          password: hashedPassword,
          role,
          isVerified: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...userData
        };

        await usersRef.doc(userRecord.uid).set(userDoc);
        console.log('✅ User document created in Firestore');

        // Create role-specific document (non-blocking)
        try {
          if (role === 'student') {
            const studentsRef = getStudentsRef();
            await studentsRef.doc(userRecord.uid).set({
              uid: userRecord.uid,
              email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              phone: userData.phone || '',
              qualifications: [],
              applications: [],
              transcripts: [],
              certificates: [],
              workExperience: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } else if (role === 'institution') {
            const institutionsRef = getInstitutionsRef();
            await institutionsRef.doc(userRecord.uid).set({
              uid: userRecord.uid,
              email,
              name: userData.name || '',
              address: userData.address || '',
              phone: userData.phone || '',
              website: userData.website || '',
              description: userData.description || '',
              isApproved: false,
              faculties: [],
              courses: [],
              applications: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } else if (role === 'company') {
            const companiesRef = getCompaniesRef();
            await companiesRef.doc(userRecord.uid).set({
              uid: userRecord.uid,
              email,
              name: userData.name || '',
              industry: userData.industry || '',
              size: userData.size || '',
              description: userData.description || '',
              website: userData.website || '',
              address: userData.address || '',
              phone: userData.phone || '',
              isApproved: false,
              jobs: [],
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          console.log('✅ Role-specific document created for:', role);
        } catch (roleError) {
          console.error('⚠️ Role document creation warning:', roleError.message);
          // Continue even if role document fails
        }

        res.status(201).json({ 
          success: true,
          message: 'User registered successfully!',
          uid: userRecord.uid 
        });
      });

    } catch (firebaseError) {
      console.error('❌ Firebase operation failed:', firebaseError);
      
      if (firebaseError.message === 'USER_EXISTS') {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists with this email' 
        });
      }
      
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service error. Please try again.',
        error: firebaseError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Registration process failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed: ' + error.message 
    });
  }
};

// Similar retry logic for login function...
const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt started...');
    
    // Wait for Firebase initialization with timeout
    try {
      await waitForInit(5000);
    } catch (timeoutError) {
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service is starting up. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!isInitialized()) {
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    try {
      // Use retry wrapper
      await withRetry(async () => {
        const usersRef = getUsersRef();
        
        // Find user in Firestore
        const usersSnapshot = await usersRef.where('email', '==', email).get();
        if (usersSnapshot.empty) {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid email or password' 
          });
        }

        const userDoc = usersSnapshot.docs[0];
        const user = userDoc.data();

        // Check if user is active
        if (user.isActive === false) {
          return res.status(401).json({ 
            success: false,
            message: 'Account is deactivated' 
          });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false,
            message: 'Invalid email or password' 
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            uid: user.uid, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET || 'career_guidance_platform_jwt_secret_2024_lesotho_maseru_nul_limkokwing',
          { expiresIn: '24h' }
        );

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        console.log('✅ Login successful for:', email);
        res.json({
          success: true,
          token,
          user: userWithoutPassword
        });
      });

    } catch (firebaseError) {
      console.error('❌ Firebase operation failed:', firebaseError);
      return res.status(503).json({ 
        success: false,
        message: 'Authentication service error. Please try again.',
        error: firebaseError.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Login process failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed: ' + error.message 
    });
  }
};

// Rest of the file remains the same...
const testAuth = async (req, res) => {
  try {
    await waitForInit();
    const status = require('../config/firebase').getFirebaseStatus();
    
    res.json({ 
      success: true,
      message: 'Authentication system status',
      firebase: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Auth test failed: ' + error.message 
    });
  }
};

module.exports = { register, login, testAuth };