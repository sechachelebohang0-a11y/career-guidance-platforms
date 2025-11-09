const { db, usersRef, studentsRef, institutionsRef, companiesRef, coursesRef } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // Check if database is connected
    if (!db) {
      throw new Error('Database not connected. Check Firebase configuration.');
    }

    // Test connection first
    console.log('🔌 Testing database connection...');
    await db.listCollections();
    console.log('✅ Database connection verified');

    // 1. Create Admin User
    console.log('📝 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = {
      uid: 'admin_001',
      email: 'admin@careerplatform.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use Admin SDK syntax (set() instead of setDoc())
    await usersRef.doc(adminUser.uid).set(adminUser);
    console.log('✅ Admin user created');

    // 2. Create Sample Institution
    console.log('🏫 Creating sample institution...');
    const institutionId = 'inst_001';
    const instPassword = await bcrypt.hash('password123', 12);
    
    // Institution user
    const instUser = {
      uid: institutionId,
      email: 'nul@lesotho.edu',
      password: instPassword,
      role: 'institution',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Institution profile
    const institution = {
      uid: institutionId,
      email: 'nul@lesotho.edu',
      name: 'National University of Lesotho',
      address: 'Roma, Maseru, Lesotho',
      phone: '+266 2221 3661',
      website: 'https://www.nul.ls',
      description: 'Premier higher education institution in Lesotho',
      isApproved: true,
      faculties: [
        {
          id: 'faculty_001',
          name: 'Faculty of Science & Technology',
          description: 'Science and technology programs',
          createdAt: new Date()
        }
      ],
      courses: ['course_001'],
      applications: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersRef.doc(instUser.uid).set(instUser);
    await institutionsRef.doc(institution.uid).set(institution);
    console.log('✅ Sample institution created');

    // 3. Create Sample Student
    console.log('🎓 Creating sample student...');
    const studentId = 'student_001';
    const studentPassword = await bcrypt.hash('student123', 12);
    
    // Student user
    const studentUser = {
      uid: studentId,
      email: 'student@test.com',
      password: studentPassword,
      role: 'student',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Student profile
    const student = {
      uid: studentId,
      email: 'student@test.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+266 1234 5678',
      address: 'Maseru, Lesotho',
      dateOfBirth: '2000-01-01',
      qualifications: ['High School Diploma'],
      applications: [],
      transcripts: [],
      certificates: [],
      workExperience: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersRef.doc(studentUser.uid).set(studentUser);
    await studentsRef.doc(student.uid).set(student);
    console.log('✅ Sample student created');

    // 4. Create Sample Course
    console.log('📚 Creating sample course...');
    const course = {
      id: 'course_001',
      institutionId: 'inst_001',
      name: 'Computer Science',
      description: 'Bachelor of Science in Computer Science',
      faculty: 'Faculty of Science & Technology',
      duration: '4 years',
      requirements: ['High School Diploma', 'Mathematics Background'],
      seats: 60,
      availableSeats: 45,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await coursesRef.doc(course.id).set(course);
    console.log('✅ Sample course created');

    console.log('🎉 Database initialization COMPLETE!');
    console.log('');
    console.log('🔑 TEST CREDENTIALS:');
    console.log('   Admin:     admin@careerplatform.com / admin123');
    console.log('   Institution: nul@lesotho.edu / password123');
    console.log('   Student:   student@test.com / student123');
    console.log('');
    console.log('🚀 You can now test the login functionality!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
  }
};

// Remove the axios installation part - we don't need it
// Run initialization with a delay to ensure Firebase is initialized
setTimeout(() => {
  initializeDatabase();
}, 3000);