// controllers/institutionController.js - UPDATED - NO PHONE VALIDATION
const { getInstitutionsRef, getCoursesRef, getStudentsRef, getApplicationsRef, getFacultiesRef } = require('../config/firebase');

const getInstitutionProfile = async (req, res) => {
  try {
    const institutionsRef = getInstitutionsRef();
    const institutionDoc = await institutionsRef.doc(req.user.uid).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }
    res.json({
      success: true,
      profile: institutionDoc.data()
    });
  } catch (error) {
    console.error('Error fetching institution profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile' 
    });
  }
};

const updateInstitutionProfile = async (req, res) => {
  try {
    const { name, address, phone, website, description } = req.body;
    const institutionsRef = getInstitutionsRef();
    
    console.log('📝 Received profile update data:', req.body);

    // NO PHONE VALIDATION - route validation handles it
    const updateData = {
      name: name.trim(),
      updatedAt: new Date()
    };

    // Only include optional fields if they have values
    if (address && address.trim()) updateData.address = address.trim();
    if (phone && phone.trim()) updateData.phone = phone.trim();
    if (website && website.trim()) updateData.website = website.trim();
    if (description && description.trim()) updateData.description = description.trim();

    console.log('🔄 Updating institution profile with data:', updateData);

    await institutionsRef.doc(req.user.uid).update(updateData);

    // Get the updated profile
    const updatedDoc = await institutionsRef.doc(req.user.uid).get();
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      profile: updatedDoc.data()
    });
  } catch (error) {
    console.error('❌ Error updating institution profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
};

const getFaculties = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const facultiesRef = getFacultiesRef();
    
    const facultiesSnapshot = await facultiesRef
      .where('institutionId', '==', institutionId)
      .get();

    const faculties = [];
    facultiesSnapshot.forEach(doc => {
      faculties.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      faculties
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch faculties' 
    });
  }
};

const addFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;
    const institutionId = req.user.uid;
    const facultiesRef = getFacultiesRef();

    // Check if faculty with same name already exists
    const existingFaculty = await facultiesRef
      .where('institutionId', '==', institutionId)
      .where('name', '==', name)
      .get();

    if (!existingFaculty.empty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this name already exists'
      });
    }

    const facultyData = {
      name,
      description: description || '',
      institutionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const facultyRef = await facultiesRef.add(facultyData);

    res.status(201).json({ 
      success: true,
      message: 'Faculty added successfully', 
      facultyId: facultyRef.id
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add faculty' 
    });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const { facultyId } = req.params;
    const { name, description } = req.body;
    const facultiesRef = getFacultiesRef();

    // Check if faculty exists and belongs to institution
    const facultyDoc = await facultiesRef.doc(facultyId).get();
    
    if (!facultyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const facultyData = facultyDoc.data();
    if (facultyData.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this faculty'
      });
    }

    // Check if another faculty with same name exists
    const existingFaculty = await facultiesRef
      .where('institutionId', '==', institutionId)
      .where('name', '==', name)
      .get();

    if (!existingFaculty.empty && existingFaculty.docs[0].id !== facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Another faculty with this name already exists'
      });
    }

    await facultiesRef.doc(facultyId).update({
      name,
      description,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty'
    });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const { facultyId } = req.params;
    const facultiesRef = getFacultiesRef();
    const coursesRef = getCoursesRef();

    // Check if faculty exists and belongs to institution
    const facultyDoc = await facultiesRef.doc(facultyId).get();
    
    if (!facultyDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const facultyData = facultyDoc.data();
    if (facultyData.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this faculty'
      });
    }

    // Check if there are any courses in this faculty
    const coursesSnapshot = await coursesRef
      .where('institutionId', '==', institutionId)
      .where('faculty', '==', facultyData.name)
      .get();

    if (!coursesSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete faculty with existing courses. Please reassign or delete the courses first.'
      });
    }

    // Delete the faculty
    await facultiesRef.doc(facultyId).delete();

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty'
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const coursesRef = getCoursesRef();
    
    const coursesSnapshot = await coursesRef
      .where('institutionId', '==', institutionId)
      .get();

    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch courses' 
    });
  }
};

const addCourse = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      faculty, 
      duration, 
      totalSeats, 
      availableSeats, 
      requirements,
      fees 
    } = req.body;
    const institutionId = req.user.uid;
    const coursesRef = getCoursesRef();

    // Validate faculty exists
    const facultiesRef = getFacultiesRef();
    const facultyCheck = await facultiesRef
      .where('institutionId', '==', institutionId)
      .where('name', '==', faculty)
      .get();

    if (facultyCheck.empty) {
      return res.status(400).json({
        success: false,
        message: 'Selected faculty does not exist'
      });
    }

    // Check if course with same name already exists
    const existingCourse = await coursesRef
      .where('institutionId', '==', institutionId)
      .where('name', '==', name)
      .get();

    if (!existingCourse.empty) {
      return res.status(400).json({
        success: false,
        message: 'Course with this name already exists'
      });
    }

    const courseData = {
      institutionId,
      name,
      description,
      faculty,
      duration,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(availableSeats),
      requirements: requirements || '',
      fees: fees ? parseFloat(fees) : 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const courseRef = await coursesRef.add(courseData);

    res.status(201).json({ 
      success: true,
      message: 'Course added successfully', 
      courseId: courseRef.id
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add course' 
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const { courseId } = req.params;
    const updateData = req.body;
    const coursesRef = getCoursesRef();

    // Check if course exists and belongs to institution
    const courseDoc = await coursesRef.doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseData = courseDoc.data();
    if (courseData.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Validate faculty if being updated
    if (updateData.faculty) {
      const facultiesRef = getFacultiesRef();
      const facultyCheck = await facultiesRef
        .where('institutionId', '==', institutionId)
        .where('name', '==', updateData.faculty)
        .get();

      if (facultyCheck.empty) {
        return res.status(400).json({
          success: false,
          message: 'Selected faculty does not exist'
        });
      }
    }

    // Convert numeric fields
    const processedData = { ...updateData };
    if (processedData.totalSeats) processedData.totalSeats = parseInt(processedData.totalSeats);
    if (processedData.availableSeats) processedData.availableSeats = parseInt(processedData.availableSeats);
    if (processedData.fees) processedData.fees = parseFloat(processedData.fees);

    await coursesRef.doc(courseId).update({
      ...processedData,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const { courseId } = req.params;
    const coursesRef = getCoursesRef();
    const applicationsRef = getApplicationsRef();

    console.log(`🔍 Attempting to delete course ${courseId} for institution ${institutionId}`);

    // Check if course exists and belongs to institution
    const courseDoc = await coursesRef.doc(courseId).get();
    
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseData = courseDoc.data();
    if (courseData.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Check if there are any applications for this course
    const applicationsSnapshot = await applicationsRef
      .where('courseId', '==', courseId)
      .get();

    if (!applicationsSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with existing applications. Please deactivate it instead.'
      });
    }

    // Delete the course
    await coursesRef.doc(courseId).delete();

    console.log(`✅ Course ${courseId} deleted successfully`);
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

const deactivateCourse = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const { courseId } = req.params;
    const { isActive } = req.body;
    const coursesRef = getCoursesRef();

    const courseDoc = await coursesRef.doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseData = courseDoc.data();
    if (courseData.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    await coursesRef.doc(courseId).update({
      isActive,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Course ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error updating course status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status'
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const applicationsRef = getApplicationsRef();
    const studentsRef = getStudentsRef();
    const coursesRef = getCoursesRef();
    
    const applicationsSnapshot = await applicationsRef
      .where('institutionId', '==', institutionId)
      .get();

    const applications = await Promise.all(
      applicationsSnapshot.docs.map(async (doc) => {
        const application = {
          id: doc.id,
          ...doc.data()
        };
        
        // Get student data
        let student = null;
        if (application.studentId) {
          const studentDoc = await studentsRef.doc(application.studentId).get();
          student = studentDoc.exists ? studentDoc.data() : null;
        }
        
        // Get course data
        let course = null;
        if (application.courseId) {
          const courseDoc = await coursesRef.doc(application.courseId).get();
          course = courseDoc.exists ? courseDoc.data() : null;
        }
        
        return {
          ...application,
          student,
          course
        };
      })
    );

    res.json({
      success: true,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch applications' 
    });
  }
};

const checkMultipleAdmissions = async (institutionId, studentId, currentApplicationId = null) => {
  try {
    const applicationsRef = getApplicationsRef();
    
    let query = applicationsRef
      .where('institutionId', '==', institutionId)
      .where('studentId', '==', studentId)
      .where('status', '==', 'admitted');

    const existingAdmissions = await query.get();

    // If we're updating an existing application, exclude it from the check
    if (currentApplicationId) {
      const filtered = existingAdmissions.docs.filter(doc => doc.id !== currentApplicationId);
      return !filtered.length === 0;
    }

    return !existingAdmissions.empty;
  } catch (error) {
    console.error('Error checking multiple admissions:', error);
    return false;
  }
};

const manageApplication = async (req, res) => {
  try {
    const { applicationId, status, notes } = req.body;
    const institutionId = req.user.uid;
    const applicationsRef = getApplicationsRef();

    // Find the application
    const applicationDoc = await applicationsRef.doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }

    const application = applicationDoc.data();

    // Verify the application belongs to this institution
    if (application.institutionId !== institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this application'
      });
    }

    // BUSINESS RULE: Prevent admitting same student to multiple programs
    if (status === 'admitted') {
      const hasMultipleAdmissions = await checkMultipleAdmissions(
        institutionId, 
        application.studentId, 
        applicationId
      );
      
      if (hasMultipleAdmissions) {
        return res.status(400).json({
          success: false,
          message: 'This student is already admitted to another program in your institution. Students cannot be admitted to multiple programs.'
        });
      }
    }

    // BUSINESS RULE: Check course capacity when admitting
    if (status === 'admitted') {
      const coursesRef = getCoursesRef();
      const courseDoc = await coursesRef.doc(application.courseId).get();
      
      if (courseDoc.exists) {
        const course = courseDoc.data();
        if (course.availableSeats <= 0) {
          return res.status(400).json({
            success: false,
            message: 'No available seats in this course. Cannot admit student.'
          });
        }

        // Decrease available seats
        await coursesRef.doc(application.courseId).update({
          availableSeats: course.availableSeats - 1,
          updatedAt: new Date()
        });
      }
    }

    // BUSINESS RULE: If changing from admitted to another status, increase available seats
    if (application.status === 'admitted' && status !== 'admitted') {
      const coursesRef = getCoursesRef();
      const courseDoc = await coursesRef.doc(application.courseId).get();
      
      if (courseDoc.exists) {
        const course = courseDoc.data();
        await coursesRef.doc(application.courseId).update({
          availableSeats: course.availableSeats + 1,
          updatedAt: new Date()
        });
      }
    }

    // Update application status
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.notes = notes;
    }

    await applicationsRef.doc(applicationId).update(updateData);

    res.json({ 
      success: true,
      message: 'Application status updated successfully' 
    });
  } catch (error) {
    console.error('Error managing application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update application' 
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const institutionId = req.user.uid;
    const coursesRef = getCoursesRef();
    const applicationsRef = getApplicationsRef();
    const facultiesRef = getFacultiesRef();

    // Get course count
    const coursesSnapshot = await coursesRef
      .where('institutionId', '==', institutionId)
      .get();
    const totalCourses = coursesSnapshot.size;

    // Get active courses count
    const activeCoursesSnapshot = await coursesRef
      .where('institutionId', '==', institutionId)
      .where('isActive', '==', true)
      .get();
    const activeCourses = activeCoursesSnapshot.size;

    // Get faculty count
    const facultiesSnapshot = await facultiesRef
      .where('institutionId', '==', institutionId)
      .get();
    const totalFaculties = facultiesSnapshot.size;

    // Get applications count by status
    const applicationsSnapshot = await applicationsRef
      .where('institutionId', '==', institutionId)
      .get();

    const applicationsByStatus = {
      pending: 0,
      admitted: 0,
      rejected: 0,
      waiting_list: 0,
      withdrawn: 0
    };

    applicationsSnapshot.forEach(doc => {
      const application = doc.data();
      if (applicationsByStatus.hasOwnProperty(application.status)) {
        applicationsByStatus[application.status]++;
      }
    });

    const totalApplications = applicationsSnapshot.size;

    res.json({
      success: true,
      stats: {
        totalCourses,
        activeCourses,
        totalFaculties,
        totalApplications,
        applicationsByStatus
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getInstitutionProfile,
  updateInstitutionProfile,
  getFaculties,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  deactivateCourse,
  getApplications,
  manageApplication,
  getDashboardStats
};