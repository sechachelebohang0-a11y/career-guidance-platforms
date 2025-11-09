const { getUsersRef, getStudentsRef, getInstitutionsRef, getCompaniesRef, getAuth } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password, role, userData } = req.body;

    // ✅ FIXED: Use function calls to get references
    const usersRef = getUsersRef();

    // Check if user already exists in Firestore
    const existingUser = await usersRef.where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document in Firestore
    const userDoc = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };

    // Add user to Firestore and get the document reference
    const userRef = usersRef.doc();
    await userRef.set({
      ...userDoc,
      uid: userRef.id // Use Firestore document ID as UID
    });

    // ✅ FIXED: Use function calls for role-specific references
    if (role === 'student') {
      const studentsRef = getStudentsRef();
      await studentsRef.doc(userRef.id).set({
        uid: userRef.id,
        email: email.toLowerCase().trim(),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        address: userData.address || '',
        qualifications: [],
        applications: [],
        transcripts: [],
        certificates: [],
        workExperience: [],
        skills: [],
        interests: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else if (role === 'institution') {
      const institutionsRef = getInstitutionsRef();
      await institutionsRef.doc(userRef.id).set({
        uid: userRef.id,
        email: email.toLowerCase().trim(),
        institutionName: userData.institutionName || '',
        contactPerson: userData.contactPerson || '',
        address: userData.address || '',
        phone: userData.phone || '',
        website: userData.website || '',
        description: userData.description || '',
        institutionType: userData.institutionType || '',
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
      await companiesRef.doc(userRef.id).set({
        uid: userRef.id,
        email: email.toLowerCase().trim(),
        companyName: userData.companyName || '',
        contactPerson: userData.contactPerson || '',
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

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        uid: userRef.id, 
        email: email.toLowerCase().trim(), 
        role: role 
      },
      process.env.JWT_SECRET || 'career_guidance_platform_jwt_secret_2024_lesotho_maseru_nul_limkokwing',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userDoc;

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        uid: userRef.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed: ' + error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // ✅ FIXED: Use function call to get usersRef
    const usersRef = getUsersRef();
    
    // Find user in Firestore
    const usersSnapshot = await usersRef
      .where('email', '==', email.toLowerCase().trim())
      .where('isActive', '==', true)
      .get();

    if (usersSnapshot.empty) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    // Check if user exists and is active
    if (!user || user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated or does not exist' 
      });
    }

    // Check password - compare with hashed password in Firestore
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
        uid: userDoc.id, 
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
      message: 'Login successful',
      token,
      user: {
        uid: userDoc.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle Firebase authentication errors
    if (error.code === 16 || error.message.includes('UNAUTHENTICATED')) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable',
        error: 'Firebase authentication error'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Login failed: ' + error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { uid } = req.user; // From JWT middleware

    const usersRef = getUsersRef();
    const userDoc = await usersRef.doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const { password, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      user: {
        uid: userDoc.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile: ' + error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const updateData = req.body;

    const usersRef = getUsersRef();

    // Remove fields that shouldn't be updated
    delete updateData.password;
    delete updateData.uid;
    delete updateData.email;
    delete updateData.role;

    await usersRef.doc(uid).update({
      ...updateData,
      updatedAt: new Date()
    });

    // Get updated user data
    const updatedUserDoc = await usersRef.doc(uid).get();
    const userData = updatedUserDoc.data();
    const { password, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        uid: updatedUserDoc.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message
    });
  }
};

const testAuth = async (req, res) => {
  try {
    res.json({ 
      success: true,
      message: 'Authentication system is working',
      timestamp: new Date().toISOString(),
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Test failed: ' + error.message 
    });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  testAuth 
};