const tempAuthController = {
  // Temporary login that works without Firebase
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Temporary login attempt:', email);
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      // Simple demo authentication (replace with your real logic later)
      const demoUsers = {
        'admin@example.com': { 
          password: 'admin123', 
          role: 'admin', 
          name: 'Admin User',
          id: 'temp_admin_001'
        },
        'student@example.com': { 
          password: 'student123', 
          role: 'student', 
          name: 'Student User',
          id: 'temp_student_001'
        },
        'institution@example.com': { 
          password: 'institution123', 
          role: 'institution', 
          name: 'Institution User',
          id: 'temp_institution_001'
        },
        'company@example.com': { 
          password: 'company123', 
          role: 'company', 
          name: 'Company User',
          id: 'temp_company_001'
        },
        'tumelo@gmail.com': {
          password: '123456',
          role: 'student',
          name: 'Tumelo User',
          id: 'temp_tumelo_001'
        }
      };
      
      const user = demoUsers[email];
      
      if (user && user.password === password) {
        // Generate a simple token (in production, use JWT)
        const token = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return res.json({
          success: true,
          message: 'Login successful (temporary mode)',
          token,
          user: {
            id: user.id,
            email: email,
            role: user.role,
            name: user.name,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ')[1] || ''
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  },
  
  // Temporary register
  register: async (req, res) => {
    try {
      const { email, password, role, firstName, lastName, phone, dateOfBirth, address } = req.body;
      
      console.log('🔐 Temporary register attempt:', email, role);
      
      // Basic validation
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and role are required'
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      
      // Generate a simple token
      const token = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = `temp_${role}_${Date.now()}`;
      
      return res.json({
        success: true,
        message: 'Registration successful (temporary mode)',
        token,
        user: {
          id: userId,
          email: email,
          role: role,
          name: `${firstName} ${lastName}`.trim(),
          firstName: firstName,
          lastName: lastName,
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          address: address || ''
        }
      });
      
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  },
  
  // Temporary profile get
  getProfile: async (req, res) => {
    try {
      // In temporary mode, return basic user info
      // In real implementation, this would fetch from Firebase
      return res.json({
        success: true,
        user: {
          id: 'temp_user',
          email: 'user@example.com',
          role: 'student',
          name: 'Demo User'
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
};

module.exports = tempAuthController;