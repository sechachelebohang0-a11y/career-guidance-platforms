const { getStudentsRef, getCoursesRef, getInstitutionsRef, getApplicationsRef, getJobsRef, getCompaniesRef, getDb } = require('../config/firebase');

// ==================== HELPER FUNCTIONS ====================

// Helper function to create student notification
const createStudentNotification = async (studentId, notificationData) => {
  try {
    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (studentDoc.exists) {
      const student = studentDoc.data();
      const notifications = student.notifications || [];
      
      const notification = {
        id: `${studentId}_notification_${Date.now()}`,
        ...notificationData,
        timestamp: new Date(),
        read: false
      };

      await studentsRef.doc(studentId).update({
        notifications: [notification, ...notifications],
        updatedAt: new Date()
      });
      
      console.log(`✅ Notification created for student ${studentId}: ${notificationData.title}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return false;
  }
};

// Check if student qualifies for a course
const checkStudentQualification = async (student, course) => {
  try {
    const studentQualifications = student.qualifications || [];
    const courseRequirements = course.requirements || [];
    
    // If no specific requirements, all students qualify
    if (courseRequirements.length === 0) {
      return true;
    }

    // Check if student has at least one of the required qualifications
    const hasRequiredQualification = courseRequirements.some(requirement =>
      studentQualifications.some(qual => 
        qual.toLowerCase().includes(requirement.toLowerCase()) ||
        requirement.toLowerCase().includes(qual.toLowerCase())
      )
    );

    return hasRequiredQualification;
  } catch (error) {
    console.error('❌ Error checking qualification:', error);
    return false;
  }
};

// Check if student qualifies for a job
const checkStudentJobQualification = async (student, job) => {
  try {
    const studentQualifications = student.qualifications || [];
    const studentSkills = student.skills || [];
    const jobRequirements = job.requirements || [];
    const jobSkills = job.skills || [];
    
    // If no specific requirements, all students qualify
    if (jobRequirements.length === 0 && jobSkills.length === 0) {
      return true;
    }

    // Check if student meets job requirements
    const meetsRequirements = jobRequirements.length === 0 || 
      jobRequirements.every(requirement =>
        studentQualifications.some(qual => 
          qual.toLowerCase().includes(requirement.toLowerCase()) ||
          requirement.toLowerCase().includes(qual.toLowerCase())
        )
      );

    // Check if student has required skills
    const hasRequiredSkills = jobSkills.length === 0 ||
      jobSkills.some(skill =>
        studentSkills.some(studentSkill =>
          studentSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(studentSkill.toLowerCase())
        )
      );

    return meetsRequirements && hasRequiredSkills;
  } catch (error) {
    console.error('❌ Error checking job qualification:', error);
    return false;
  }
};

// Get next student from waiting list
const getNextWaitingStudent = async (courseId) => {
  try {
    const applicationsRef = getApplicationsRef();
    
    const waitingListSnapshot = await applicationsRef
      .where('courseId', '==', courseId)
      .where('status', '==', 'waiting')
      .orderBy('appliedAt', 'asc')
      .limit(1)
      .get();

    if (!waitingListSnapshot.empty) {
      const doc = waitingListSnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting next waiting student:', error);
    return null;
  }
};

// Enhanced notifications for job matches
const getQualifiedJobNotifications = async (studentId) => {
  try {
    const jobsRef = getJobsRef();
    const studentsRef = getStudentsRef();

    // Get student profile
    const studentDoc = await studentsRef.doc(studentId).get();
    if (!studentDoc.exists) return [];

    const student = studentDoc.data();
    const studentQualifications = student.qualifications || [];
    const studentSkills = student.skills || [];

    // Get all active jobs
    const jobsSnapshot = await jobsRef.get();
    const qualifiedJobs = [];

    // Find jobs that match student qualifications
    for (const doc of jobsSnapshot.docs) {
      const job = doc.data();
      
      // Check if job is active
      if (job.deadline && new Date(job.deadline) < new Date()) {
        continue;
      }

      // Check if job is still open
      if (job.status && job.status !== 'active') {
        continue;
      }

      // Check if student qualifies
      const isQualified = await checkStudentJobQualification(student, job);
      if (isQualified) {
        qualifiedJobs.push({
          jobId: doc.id,
          ...job
        });
      }
    }

    return qualifiedJobs;
  } catch (error) {
    console.error('❌ Error getting qualified job notifications:', error);
    return [];
  }
};

// ==================== PROFILE MANAGEMENT ====================

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log('🔍 Fetching student profile for:', studentId);
    
    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found' 
      });
    }

    const studentData = studentDoc.data();
    
    // Get applications count
    const applicationsSnapshot = await getApplicationsRef()
      .where('studentId', '==', studentId)
      .get();
    
    const applicationsCount = applicationsSnapshot.size;

    const profile = {
      id: studentDoc.id,
      ...studentData,
      applicationsCount
    };

    console.log('✅ Student profile fetched successfully');
    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('❌ Error fetching student profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update student profile with qualifications
const updateStudentProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, dateOfBirth, qualifications, skills } = req.body;
    const studentId = req.user.uid;
    const studentsRef = getStudentsRef();
    
    console.log('🔍 Updating student profile for:', studentId);
    console.log('📝 Update data:', { firstName, lastName, phone, address, dateOfBirth, qualifications, skills });

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      dateOfBirth: dateOfBirth || '',
      qualifications: qualifications || [],
      skills: skills || [],
      updatedAt: new Date()
    };

    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Check if student exists
    const studentDoc = await studentsRef.doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update student profile
    await studentsRef.doc(studentId).update(updateData);

    console.log('✅ Student profile updated successfully');
    
    // Check for new job matches after profile update
    try {
      const qualifiedJobs = await getQualifiedJobNotifications(studentId);
      if (qualifiedJobs.length > 0) {
        for (const job of qualifiedJobs.slice(0, 3)) { // Limit to 3 notifications
          await createStudentNotification(studentId, {
            title: 'New Job Match',
            message: `A new job "${job.title}" at ${job.company?.name || 'a company'} matches your profile.`,
            type: 'job_match',
            jobId: job.jobId
          });
        }
      }
    } catch (notificationError) {
      console.error('⚠️ Error creating job match notifications:', notificationError);
      // Don't fail the profile update if notifications fail
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating student profile:', error);
    
    let errorMessage = 'Failed to update profile';
    if (error.code === 5) { // Firestore "NOT_FOUND" error
      errorMessage = 'Student profile not found';
    } else if (error.code === 3) { // Firestore "INVALID_ARGUMENT" error
      errorMessage = 'Invalid data provided';
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== COURSE MANAGEMENT ====================

// Enhanced get courses with qualification checking
const getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log('🔍 Fetching available courses for student:', studentId);

    const coursesRef = getCoursesRef();
    const institutionsRef = getInstitutionsRef();

    // Get student qualifications
    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    const studentQualifications = studentDoc.exists ? studentDoc.data().qualifications || [] : [];

    // Get all active courses
    const coursesSnapshot = await coursesRef.get();

    const courses = [];
    for (const doc of coursesSnapshot.docs) {
      const course = {
        id: doc.id,
        ...doc.data()
      };

      // Skip inactive courses
      if (course.status && course.status !== 'active') {
        continue;
      }
      
      // Get institution details if available
      if (course.institutionId) {
        try {
          const institutionDoc = await institutionsRef.doc(course.institutionId).get();
          if (institutionDoc.exists) {
            course.institution = {
              id: institutionDoc.id,
              ...institutionDoc.data()
            };
          }
        } catch (error) {
          console.error('⚠️ Error fetching institution:', error);
        }
      }

      // Check if student qualifies for the course
      course.isQualified = await checkStudentQualification(
        { qualifications: studentQualifications }, 
        course
      );

      courses.push(course);
    }

    console.log(`✅ Found ${courses.length} courses`);
    res.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Enhanced course application with qualification checking
const applyForCourse = async (req, res) => {
  try {
    const { 
      courseId, 
      institutionId, 
      fullName, 
      email, 
      phone, 
      previousEducation, 
      yearOfCompletion, 
      motivationLetter, 
      supportingDocuments 
    } = req.body;
    
    const studentId = req.user.uid;
    
    console.log(`🔍 Student ${studentId} applying for course ${courseId}`);

    const coursesRef = getCoursesRef();
    const applicationsRef = getApplicationsRef();
    const studentsRef = getStudentsRef();

    // Check if course exists
    const courseDoc = await coursesRef.doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    const course = courseDoc.data();

    // Check if course is active
    if (course.status && course.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'This course is not currently accepting applications' 
      });
    }

    // Check if course has available seats
    const availableSeats = course.availableSeats || 0;
    if (availableSeats <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No available seats for this course' 
      });
    }

    // Check if student meets course requirements
    const studentDoc = await studentsRef.doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found' 
      });
    }

    const student = studentDoc.data();

    // Check if student qualifies for the course
    const isQualified = await checkStudentQualification(student, course);
    if (!isQualified) {
      return res.status(400).json({ 
        success: false,
        message: 'You do not meet the course requirements' 
      });
    }

    // Check if student has already applied to 2 courses in this institution
    const existingApplicationsSnapshot = await applicationsRef
      .where('studentId', '==', studentId)
      .where('institutionId', '==', institutionId)
      .where('status', 'in', ['pending', 'admitted', 'waiting'])
      .get();

    if (existingApplicationsSnapshot.size >= 2) {
      return res.status(400).json({ 
        success: false,
        message: 'You can only apply to maximum 2 courses per institution' 
      });
    }

    // Check if already applied to this course
    const existingCourseApplication = await applicationsRef
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .where('status', 'in', ['pending', 'admitted', 'waiting'])
      .get();

    if (!existingCourseApplication.empty) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied to this course' 
      });
    }

    // Determine application status based on available seats
    let applicationStatus = 'pending';
    if (availableSeats > 0) {
      applicationStatus = 'pending';
    } else {
      applicationStatus = 'waiting';
    }

    // Create application
    const applicationId = `${studentId}_${courseId}_${Date.now()}`;
    const application = {
      id: applicationId,
      studentId,
      courseId,
      institutionId: institutionId || course.institutionId,
      fullName,
      email,
      phone,
      previousEducation,
      yearOfCompletion: parseInt(yearOfCompletion),
      motivationLetter,
      supportingDocuments: supportingDocuments || '',
      status: applicationStatus,
      appliedAt: new Date(),
      updatedAt: new Date(),
      studentQualifications: student.qualifications || []
    };

    // Save application
    await applicationsRef.doc(applicationId).set(application);

    // Update course available seats if not in waiting list
    if (applicationStatus === 'pending') {
      await coursesRef.doc(courseId).update({
        availableSeats: availableSeats - 1,
        updatedAt: new Date()
      });
    }

    console.log(`✅ Application submitted successfully: ${applicationId}`);
    
    // Create notification for student
    await createStudentNotification(studentId, {
      title: 'Application Submitted',
      message: `Your application for ${course.name} has been submitted successfully. Status: ${applicationStatus}`,
      type: 'application_submitted'
    });

    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationId,
      status: applicationStatus
    });
  } catch (error) {
    console.error('❌ Application error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Application failed',
      error: error.message
    });
  }
};

// Enhanced get applications with admission selection logic
const getApplications = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log(`🔍 Fetching applications for student: ${studentId}`);

    const applicationsRef = getApplicationsRef();
    const coursesRef = getCoursesRef();
    const institutionsRef = getInstitutionsRef();

    const applicationsSnapshot = await applicationsRef
      .where('studentId', '==', studentId)
      .get();

    const applications = [];
    let hasMultipleAdmissions = false;
    let admittedApplications = [];

    for (const doc of applicationsSnapshot.docs) {
      const application = {
        id: doc.id,
        ...doc.data()
      };

      // Get course details
      if (application.courseId) {
        try {
          const courseDoc = await coursesRef.doc(application.courseId).get();
          if (courseDoc.exists) {
            application.course = {
              id: courseDoc.id,
              ...courseDoc.data()
            };
          }
        } catch (error) {
          console.error('⚠️ Error fetching course:', error);
        }
      }

      // Get institution details
      if (application.institutionId) {
        try {
          const institutionDoc = await institutionsRef.doc(application.institutionId).get();
          if (institutionDoc.exists) {
            application.institution = {
              id: institutionDoc.id,
              ...institutionDoc.data()
            };
          }
        } catch (error) {
          console.error('⚠️ Error fetching institution:', error);
        }
      }

      applications.push(application);

      // Check for multiple admissions
      if (application.status === 'admitted') {
        admittedApplications.push(application);
      }
    }

    // Check if student has multiple admissions
    if (admittedApplications.length > 1) {
      hasMultipleAdmissions = true;
      
      // Create notification for multiple admissions
      await createStudentNotification(studentId, {
        title: 'Multiple Admission Offers',
        message: `You have been admitted to ${admittedApplications.length} institutions. Please select one within 7 days.`,
        type: 'multiple_admissions'
      });
    }

    // Sort by applied date (newest first)
    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    console.log(`✅ Found ${applications.length} applications`);
    res.json({
      success: true,
      applications: applications,
      hasMultipleAdmissions: hasMultipleAdmissions
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Student accepts admission offer (selects one institution)
const acceptAdmissionOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const studentId = req.user.uid;

    console.log(`🔍 Student ${studentId} accepting admission offer: ${applicationId}`);

    const applicationsRef = getApplicationsRef();
    const studentsRef = getStudentsRef();
    const coursesRef = getCoursesRef();

    // Get the accepted application
    const acceptedAppDoc = await applicationsRef.doc(applicationId).get();
    if (!acceptedAppDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }

    const acceptedApp = acceptedAppDoc.data();

    // Verify the application belongs to the student and is admitted
    if (acceptedApp.studentId !== studentId || acceptedApp.status !== 'admitted') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid application or application not admitted' 
      });
    }

    // Get all admitted applications for this student
    const admittedApplicationsSnapshot = await applicationsRef
      .where('studentId', '==', studentId)
      .where('status', '==', 'admitted')
      .get();

    const batch = getDb().batch();
    const waitingListUpdates = [];

    // Process all admitted applications
    for (const doc of admittedApplicationsSnapshot.docs) {
      const application = doc.data();
      
      if (doc.id === applicationId) {
        // Mark the selected application as accepted
        batch.update(applicationsRef.doc(doc.id), {
          status: 'accepted',
          updatedAt: new Date()
        });
      } else {
        // Reject other admitted applications and free up seats
        batch.update(applicationsRef.doc(doc.id), {
          status: 'rejected',
          updatedAt: new Date()
        });

        // Increase available seats for the rejected course
        const courseDoc = await coursesRef.doc(application.courseId).get();
        if (courseDoc.exists) {
          const course = courseDoc.data();
          batch.update(coursesRef.doc(application.courseId), {
            availableSeats: (course.availableSeats || 0) + 1,
            updatedAt: new Date()
          });
        }

        // Promote first student from waiting list for this course
        const nextInLine = await getNextWaitingStudent(application.courseId);
        if (nextInLine) {
          batch.update(applicationsRef.doc(nextInLine.id), {
            status: 'admitted',
            updatedAt: new Date()
          });
          waitingListUpdates.push(nextInLine);

          // Decrease available seats for the promoted student
          const promotedCourseDoc = await coursesRef.doc(application.courseId).get();
          if (promotedCourseDoc.exists) {
            const promotedCourse = promotedCourseDoc.data();
            batch.update(coursesRef.doc(application.courseId), {
              availableSeats: Math.max(0, (promotedCourse.availableSeats || 0) - 1),
              updatedAt: new Date()
            });
          }
        }
      }
    }

    await batch.commit();

    // Create notifications for waiting list promotions
    for (const waitingStudent of waitingListUpdates) {
      await createStudentNotification(waitingStudent.studentId, {
        title: 'Admission Status Updated',
        message: `Congratulations! You have been admitted to the course from the waiting list.`,
        type: 'admission_updated'
      });
    }

    // Update student status
    await studentsRef.doc(studentId).update({
      admissionStatus: 'accepted',
      acceptedCourseId: acceptedApp.courseId,
      acceptedInstitutionId: acceptedApp.institutionId,
      updatedAt: new Date()
    });

    // Create notification for the student about acceptance
    await createStudentNotification(studentId, {
      title: 'Admission Accepted',
      message: `You have successfully accepted the admission offer for ${acceptedApp.course?.name || 'the course'}.`,
      type: 'admission_accepted'
    });

    console.log(`✅ Admission offer accepted successfully`);
    res.json({ 
      success: true,
      message: 'Admission offer accepted successfully' 
    });
  } catch (error) {
    console.error('❌ Error accepting admission offer:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to accept admission offer',
      error: error.message
    });
  }
};

// ==================== JOB MANAGEMENT ====================

// Get available jobs
const getJobs = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log('🔍 Fetching available jobs for student:', studentId);

    const jobsRef = getJobsRef();
    const companiesRef = getCompaniesRef();

    // Get student qualifications and skills
    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    const studentQualifications = studentDoc.exists ? studentDoc.data().qualifications || [] : [];
    const studentSkills = studentDoc.exists ? studentDoc.data().skills || [] : [];

    // Get all jobs
    const jobsSnapshot = await jobsRef.get();

    const jobs = [];
    for (const doc of jobsSnapshot.docs) {
      const job = {
        id: doc.id,
        ...doc.data()
      };
      
      // Skip expired or inactive jobs
      if (job.deadline && new Date(job.deadline) < new Date()) {
        continue;
      }
      if (job.status && job.status !== 'active') {
        continue;
      }
      
      // Get company details if available
      if (job.companyId) {
        try {
          const companyDoc = await companiesRef.doc(job.companyId).get();
          if (companyDoc.exists) {
            job.company = {
              id: companyDoc.id,
              ...companyDoc.data()
            };
          }
        } catch (error) {
          console.error('⚠️ Error fetching company:', error);
        }
      }

      // Check if student qualifies for the job
      job.isQualified = await checkStudentJobQualification(
        { qualifications: studentQualifications, skills: studentSkills }, 
        job
      );

      jobs.push(job);
    }

    console.log(`✅ Found ${jobs.length} jobs`);
    res.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get job details
const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`🔍 Fetching job details: ${jobId}`);

    const jobsRef = getJobsRef();
    const companiesRef = getCompaniesRef();

    const jobDoc = await jobsRef.doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    const job = jobDoc.data();
    
    // Get company details
    let company = null;
    if (job.companyId) {
      const companyDoc = await companiesRef.doc(job.companyId).get();
      if (companyDoc.exists) {
        company = {
          id: companyDoc.id,
          ...companyDoc.data()
        };
      }
    }

    const jobDetails = {
      id: jobDoc.id,
      ...job,
      company: company
    };

    console.log('✅ Job details fetched successfully');
    res.json({
      success: true,
      job: jobDetails
    });
  } catch (error) {
    console.error('❌ Error fetching job details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch job details',
      error: error.message
    });
  }
};

// Enhanced job application with qualification checking
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.uid;
    
    console.log(`🔍 Student ${studentId} applying for job ${jobId}`);

    const jobsRef = getJobsRef();
    const studentsRef = getStudentsRef();
    const applicationsRef = getApplicationsRef();

    // Check if job exists
    const jobDoc = await jobsRef.doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    const job = jobDoc.data();

    // Check if job is still active
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Job application deadline has passed' 
      });
    }

    // Check if job is active
    if (job.status && job.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'This job is no longer accepting applications' 
      });
    }

    // Get student profile for qualification check
    const studentDoc = await studentsRef.doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student profile not found' 
      });
    }

    const student = studentDoc.data();

    // Check if student qualifies for the job
    const isQualified = await checkStudentJobQualification(student, job);
    if (!isQualified) {
      return res.status(400).json({ 
        success: false,
        message: 'You do not meet the job requirements' 
      });
    }

    // Check if already applied to this job
    const existingJobApplication = await applicationsRef
      .where('studentId', '==', studentId)
      .where('jobId', '==', jobId)
      .get();

    if (!existingJobApplication.empty) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied to this job' 
      });
    }

    // Create job application
    const applicationId = `${studentId}_job_${jobId}_${Date.now()}`;
    const application = {
      id: applicationId,
      studentId,
      jobId,
      companyId: job.companyId,
      status: 'pending',
      appliedAt: new Date(),
      updatedAt: new Date(),
      studentProfile: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        qualifications: student.qualifications || [],
        transcripts: student.transcripts || [],
        certificates: student.certificates || [],
        skills: student.skills || []
      }
    };

    // Save job application
    await applicationsRef.doc(applicationId).set(application);

    console.log(`✅ Job application submitted successfully: ${applicationId}`);
    
    // Create notification for student
    await createStudentNotification(studentId, {
      title: 'Job Application Submitted',
      message: `Your application for ${job.title} at ${job.company?.name || 'the company'} has been submitted.`,
      type: 'job_application_submitted'
    });

    res.status(201).json({ 
      success: true,
      message: 'Job application submitted successfully',
      applicationId: applicationId
    });
  } catch (error) {
    console.error('❌ Job application error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Job application failed',
      error: error.message
    });
  }
};

// ==================== DOCUMENT MANAGEMENT ====================

// Upload transcripts and certificates
const uploadTranscript = async (req, res) => {
  try {
    const { transcriptUrl, certificateUrls } = req.body;
    const studentId = req.user.uid;
    
    console.log(`🔍 Uploading documents for student: ${studentId}`);

    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const student = studentDoc.data();
    const updateData = {
      updatedAt: new Date()
    };

    // Add transcript if provided
    if (transcriptUrl) {
      const transcript = {
        url: transcriptUrl,
        uploadedAt: new Date(),
        verified: false,
        type: 'transcript',
        name: 'Academic Transcript'
      };
      updateData.transcripts = [...(student.transcripts || []), transcript];
    }

    // Add certificates if provided
    if (certificateUrls && certificateUrls.length > 0) {
      const certificates = certificateUrls.map(url => ({
        url,
        uploadedAt: new Date(),
        verified: false,
        type: 'certificate',
        name: `Certificate ${Date.now()}`
      }));
      updateData.certificates = [...(student.certificates || []), ...certificates];
    }

    await studentsRef.doc(studentId).update(updateData);

    console.log('✅ Documents uploaded successfully');
    
    // Create notification
    await createStudentNotification(studentId, {
      title: 'Documents Uploaded',
      message: 'Your transcripts and certificates have been uploaded successfully.',
      type: 'documents_uploaded'
    });

    res.json({ 
      success: true,
      message: 'Documents uploaded successfully' 
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

// Update student documents
const updateStudentDocuments = async (req, res) => {
  try {
    const { transcripts, certificates, workExperience } = req.body;
    const studentId = req.user.uid;

    const studentsRef = getStudentsRef();
    
    const updateData = {
      updatedAt: new Date()
    };

    if (transcripts) updateData.transcripts = transcripts;
    if (certificates) updateData.certificates = certificates;
    if (workExperience) updateData.workExperience = workExperience;

    await studentsRef.doc(studentId).update(updateData);

    res.json({ 
      success: true,
      message: 'Documents updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating documents:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update documents',
      error: error.message
    });
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================

// Get student notifications
const getNotifications = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log(`🔍 Fetching notifications for student: ${studentId}`);

    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const student = studentDoc.data();
    const notifications = student.notifications || [];

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log(`✅ Found ${notifications.length} notifications`);
    res.json({
      success: true,
      notifications: notifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const studentId = req.user.uid;

    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const student = studentDoc.data();
    const notifications = student.notifications || [];

    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    await studentsRef.doc(studentId).update({
      notifications: updatedNotifications,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const studentId = req.user.uid;

    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const student = studentDoc.data();
    const notifications = student.notifications || [];

    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));

    await studentsRef.doc(studentId).update({
      notifications: updatedNotifications,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const studentId = req.user.uid;

    const studentsRef = getStudentsRef();
    const studentDoc = await studentsRef.doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const student = studentDoc.data();
    const notifications = student.notifications || [];

    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);

    await studentsRef.doc(studentId).update({
      notifications: updatedNotifications,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'Notification deleted' 
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// ==================== DASHBOARD STATS ====================

// Get student dashboard stats
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.uid;
    console.log(`🔍 Fetching stats for student: ${studentId}`);

    const applicationsRef = getApplicationsRef();
    
    // Get all applications for this student
    const applicationsSnapshot = await applicationsRef
      .where('studentId', '==', studentId)
      .get();

    let totalCourseApplications = 0;
    let totalJobApplications = 0;
    let pendingApplications = 0;
    let admittedApplications = 0;
    let rejectedApplications = 0;
    let waitingApplications = 0;
    let acceptedApplications = 0;

    applicationsSnapshot.forEach(doc => {
      const application = doc.data();
      
      if (application.courseId && !application.jobId) {
        totalCourseApplications++;
      }
      
      if (application.jobId) {
        totalJobApplications++;
      }
      
      if (application.status === 'pending') {
        pendingApplications++;
      } else if (application.status === 'admitted') {
        admittedApplications++;
      } else if (application.status === 'rejected') {
        rejectedApplications++;
      } else if (application.status === 'waiting') {
        waitingApplications++;
      } else if (application.status === 'accepted') {
        acceptedApplications++;
      }
    });

    const stats = {
      totalCourseApplications,
      totalJobApplications,
      pendingApplications,
      admittedApplications,
      rejectedApplications,
      waitingApplications,
      acceptedApplications,
      totalApplications: totalCourseApplications + totalJobApplications
    };

    console.log('✅ Student stats fetched successfully:', stats);
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error fetching student stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch student statistics',
      error: error.message
    });
  }
};

// ==================== MODULE EXPORTS ====================

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getAvailableCourses,
  applyForCourse,
  getApplications,
  getJobs,
  getJobDetails,
  applyForJob,
  uploadTranscript,
  updateStudentDocuments,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getStudentStats,
  acceptAdmissionOffer,
  checkStudentQualification,
  checkStudentJobQualification,
  createStudentNotification,
  getNextWaitingStudent,
  getQualifiedJobNotifications
};