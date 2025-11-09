const { getUsersRef, getStudentsRef, getInstitutionsRef, getCompaniesRef, getAuth } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, userData } = req.body;

    // ✅ FIXED: Use function calls to get references
    const usersRef = getUsersRef();
    const auth = getAuth();

    // Check if user already exists in Firestore
    const existingUser = await usersRef.where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let userRecord;
    try {
      // Create user in Firebase Auth
      userRecord = await auth.createUser({
        email,
        password,
        emailVerified: false,
        disabled: false,
      });
    } catch (firebaseError) {
      console.error('Firebase Auth error:', firebaseError);
      return res.status(400).json({ message: 'Failed to create user account' });
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

    // ✅ FIXED: Use function calls for role-specific references
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

    res.status(201).json({ 
      message: 'User registered successfully. Please verify your email.',
      uid: userRecord.uid 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // ✅ FIXED: Use function call to get usersRef
    const usersRef = getUsersRef();
    
    // Find user in Firestore
    const usersSnapshot = await usersRef.where('email', '==', email).get();
    if (usersSnapshot.empty) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password - compare with hashed password in Firestore
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
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

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed: ' + error.message 
    });
  }
};

const testAuth = async (req, res) => {
  try {
    res.json({ 
      message: 'Authentication system is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Test failed: ' + error.message });
  }
};

module.exports = { register, login, testAuth };