const { getUsersRef, getStudentsRef, getInstitutionsRef, getCompaniesRef, getCoursesRef, getJobsRef, getApplicationsRef, getFacultiesRef } = require('../config/firebase');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('🔍 Fetching dashboard statistics...');
    
    const [
      usersSnapshot,
      studentsSnapshot,
      institutionsSnapshot,
      companiesSnapshot,
      coursesSnapshot,
      jobsSnapshot,
      applicationsSnapshot
    ] = await Promise.all([
      getUsersRef().get(),
      getStudentsRef().get(),
      getInstitutionsRef().get(),
      getCompaniesRef().get(),
      getCoursesRef().get(),
      getJobsRef().get(),
      getApplicationsRef().get()
    ]);

    const stats = {
      totalUsers: usersSnapshot.size,
      totalStudents: studentsSnapshot.size,
      totalInstitutions: institutionsSnapshot.size,
      totalCompanies: companiesSnapshot.size,
      totalCourses: coursesSnapshot.size,
      totalJobs: jobsSnapshot.size,
      totalApplications: applicationsSnapshot.size,
      verifiedInstitutions: institutionsSnapshot.docs.filter(doc => doc.data().isApproved).length,
      verifiedCompanies: companiesSnapshot.docs.filter(doc => doc.data().isApproved).length,
      activeCourses: coursesSnapshot.docs.filter(doc => doc.data().isActive).length,
      pendingInstitutions: institutionsSnapshot.docs.filter(doc => !doc.data().isApproved && doc.data().status !== 'rejected').length,
      pendingCompanies: companiesSnapshot.docs.filter(doc => !doc.data().isApproved && doc.data().status !== 'rejected').length
    };

    console.log('✅ Dashboard stats fetched successfully');
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get system reports
const getSystemReports = async (req, res) => {
  try {
    console.log('🔍 Generating system reports...');
    
    const [
      usersSnapshot,
      studentsSnapshot,
      institutionsSnapshot,
      companiesSnapshot,
      coursesSnapshot,
      jobsSnapshot
    ] = await Promise.all([
      getUsersRef().get(),
      getStudentsRef().get(),
      getInstitutionsRef().get(),
      getCompaniesRef().get(),
      getCoursesRef().get(),
      getJobsRef().get()
    ]);

    const reports = {
      totalUsers: usersSnapshot.size,
      totalStudents: studentsSnapshot.size,
      totalInstitutions: institutionsSnapshot.size,
      totalCompanies: companiesSnapshot.size,
      totalCourses: coursesSnapshot.size,
      totalJobs: jobsSnapshot.size,
      verifiedInstitutions: institutionsSnapshot.docs.filter(doc => doc.data().isApproved).length,
      verifiedCompanies: companiesSnapshot.docs.filter(doc => doc.data().isApproved).length,
      activeCourses: coursesSnapshot.docs.filter(doc => doc.data().isActive).length
    };

    console.log('✅ System reports generated successfully');
    res.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('❌ Error generating reports:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate reports',
      error: error.message
    });
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    console.log('🔍 Fetching all applications...');
    const applicationsRef = getApplicationsRef();
    const applicationsSnapshot = await applicationsRef.get();

    const applications = await Promise.all(
      applicationsSnapshot.docs.map(async (doc) => {
        const application = {
          id: doc.id,
          ...doc.data()
        };

        // Get student details
        try {
          const studentDoc = await getStudentsRef().doc(application.studentId).get();
          if (studentDoc.exists) {
            application.student = studentDoc.data();
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch student ${application.studentId}`);
        }

        // Get course/job details
        if (application.courseId) {
          try {
            const courseDoc = await getCoursesRef().doc(application.courseId).get();
            if (courseDoc.exists) {
              application.course = courseDoc.data();
            }
          } catch (error) {
            console.log(`⚠️ Could not fetch course ${application.courseId}`);
          }
        }

        if (application.jobId) {
          try {
            const jobDoc = await getJobsRef().doc(application.jobId).get();
            if (jobDoc.exists) {
              application.job = jobDoc.data();
            }
          } catch (error) {
            console.log(`⚠️ Could not fetch job ${application.jobId}`);
          }
        }

        return application;
      })
    );

    console.log(`✅ Fetched ${applications.length} applications`);
    res.json({
      success: true,
      applications: applications
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

// Get all institutions
const getInstitutions = async (req, res) => {
  try {
    console.log('🔍 Fetching all institutions...');
    const institutionsRef = getInstitutionsRef();
    const institutionsSnapshot = await institutionsRef.get();

    if (institutionsSnapshot.empty) {
      console.log('📭 No institutions found in database');
      return res.json({
        success: true,
        institutions: [],
        message: 'No institutions found'
      });
    }

    const institutions = [];
    institutionsSnapshot.forEach(doc => {
      const institutionData = doc.data();
      institutions.push({
        id: doc.id,
        name: institutionData.name || 'Unknown Institution',
        email: institutionData.email || 'No email',
        phone: institutionData.phone || 'N/A',
        address: institutionData.address || 'N/A',
        website: institutionData.website || 'N/A',
        contactPerson: institutionData.contactPerson || 'N/A',
        status: institutionData.isApproved ? 'approved' : (institutionData.status || 'pending'),
        coursesCount: 0, // Will be calculated separately
        facultiesCount: 0, // Will be calculated separately
        createdAt: institutionData.createdAt || new Date(),
        description: institutionData.description || 'No description',
        isActive: institutionData.isActive !== false
      });
    });

    // Get course counts for each institution
    const coursesSnapshot = await getCoursesRef().get();
    const courseCounts = {};
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      if (courseData.institutionId) {
        courseCounts[courseData.institutionId] = (courseCounts[courseData.institutionId] || 0) + 1;
      }
    });

    // Get faculty counts for each institution
    const facultiesSnapshot = await getFacultiesRef().get();
    const facultyCounts = {};
    facultiesSnapshot.forEach(doc => {
      const facultyData = doc.data();
      if (facultyData.institutionId) {
        facultyCounts[facultyData.institutionId] = (facultyCounts[facultyData.institutionId] || 0) + 1;
      }
    });

    // Update institutions with counts
    institutions.forEach(institution => {
      institution.coursesCount = courseCounts[institution.id] || 0;
      institution.facultiesCount = facultyCounts[institution.id] || 0;
    });

    console.log(`✅ Found ${institutions.length} institutions`);
    res.json({
      success: true,
      institutions: institutions,
      count: institutions.length
    });
  } catch (error) {
    console.error('❌ Error fetching institutions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch institutions',
      error: error.message
    });
  }
};

// Get institution details
const getInstitutionDetails = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Fetching details for institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    const institutionData = institutionDoc.data();
    const institution = {
      id: institutionDoc.id,
      ...institutionData,
      status: institutionData.isApproved ? 'approved' : (institutionData.status || 'pending')
    };

    // Get courses for this institution
    const coursesSnapshot = await getCoursesRef()
      .where('institutionId', '==', institutionId)
      .get();
    
    institution.courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get faculties for this institution
    const facultiesSnapshot = await getFacultiesRef()
      .where('institutionId', '==', institutionId)
      .get();
    
    institution.faculties = facultiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Institution details fetched successfully`);
    res.json({
      success: true,
      institution: institution
    });
  } catch (error) {
    console.error('❌ Error fetching institution details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch institution details',
      error: error.message
    });
  }
};

// Approve institution
const approveInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Approving institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    // Update institution status
    await getInstitutionsRef().doc(institutionId).update({
      isApproved: true,
      status: 'approved',
      approvedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(institutionId).update({
        isActive: true,
        isApproved: true,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Institution ${institutionId} approved successfully`);
    res.json({ 
      success: true,
      message: 'Institution approved successfully' 
    });
  } catch (error) {
    console.error('❌ Error approving institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to approve institution',
      error: error.message
    });
  }
};

// Suspend institution
const suspendInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Suspending institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    // Update institution status
    await getInstitutionsRef().doc(institutionId).update({
      isApproved: false,
      status: 'suspended',
      suspendedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(institutionId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Institution ${institutionId} suspended successfully`);
    res.json({ 
      success: true,
      message: 'Institution suspended successfully' 
    });
  } catch (error) {
    console.error('❌ Error suspending institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to suspend institution',
      error: error.message
    });
  }
};

// Reject institution
const rejectInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Rejecting institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    // Update institution status
    await getInstitutionsRef().doc(institutionId).update({
      isApproved: false,
      status: 'rejected',
      rejectedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(institutionId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Institution ${institutionId} rejected successfully`);
    res.json({ 
      success: true,
      message: 'Institution rejected successfully' 
    });
  } catch (error) {
    console.error('❌ Error rejecting institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reject institution',
      error: error.message
    });
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    console.log('🔍 Fetching all companies...');
    const companiesRef = getCompaniesRef();
    const companiesSnapshot = await companiesRef.get();

    if (companiesSnapshot.empty) {
      console.log('📭 No companies found in database');
      return res.json({
        success: true,
        companies: [],
        message: 'No companies found'
      });
    }

    const companies = [];
    companiesSnapshot.forEach(doc => {
      const companyData = doc.data();
      companies.push({
        id: doc.id,
        name: companyData.name || 'Unknown Company',
        email: companyData.email || 'No email',
        industry: companyData.industry || 'Not specified',
        contactPerson: companyData.contactPerson || 'N/A',
        phone: companyData.phone || 'N/A',
        status: companyData.isApproved ? 'approved' : (companyData.status || 'pending'),
        jobPostingsCount: 0, // Will be calculated separately
        createdAt: companyData.createdAt || new Date(),
        address: companyData.address || 'N/A',
        size: companyData.size || 'N/A',
        description: companyData.description || 'No description',
        website: companyData.website || 'N/A',
        isActive: companyData.isActive !== false
      });
    });

    // Get job counts for each company
    const jobsSnapshot = await getJobsRef().get();
    const jobCounts = {};
    jobsSnapshot.forEach(doc => {
      const jobData = doc.data();
      if (jobData.companyId) {
        jobCounts[jobData.companyId] = (jobCounts[jobData.companyId] || 0) + 1;
      }
    });

    // Update companies with job counts
    companies.forEach(company => {
      company.jobPostingsCount = jobCounts[company.id] || 0;
    });

    console.log(`✅ Found ${companies.length} companies`);
    res.json({
      success: true,
      companies: companies,
      count: companies.length
    });
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`🔍 Fetching details for company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    const companyData = companyDoc.data();
    const company = {
      id: companyDoc.id,
      ...companyData,
      status: companyData.isApproved ? 'approved' : (companyData.status || 'pending')
    };

    // Get jobs for this company
    const jobsSnapshot = await getJobsRef()
      .where('companyId', '==', companyId)
      .get();
    
    company.jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Company details fetched successfully`);
    res.json({
      success: true,
      company: company
    });
  } catch (error) {
    console.error('❌ Error fetching company details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
};

// Approve company
const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`🔍 Approving company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Update company status
    await getCompaniesRef().doc(companyId).update({
      isApproved: true,
      status: 'approved',
      approvedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(companyId).update({
        isActive: true,
        isApproved: true,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Company ${companyId} approved successfully`);
    res.json({ 
      success: true,
      message: 'Company approved successfully' 
    });
  } catch (error) {
    console.error('❌ Error approving company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to approve company',
      error: error.message
    });
  }
};

// Suspend company
const suspendCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`🔍 Suspending company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Update company status
    await getCompaniesRef().doc(companyId).update({
      isApproved: false,
      status: 'suspended',
      suspendedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(companyId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Company ${companyId} suspended successfully`);
    res.json({ 
      success: true,
      message: 'Company suspended successfully' 
    });
  } catch (error) {
    console.error('❌ Error suspending company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to suspend company',
      error: error.message
    });
  }
};

// Reject company
const rejectCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`🔍 Rejecting company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Update company status
    await getCompaniesRef().doc(companyId).update({
      isApproved: false,
      status: 'rejected',
      rejectedAt: new Date(),
      updatedAt: new Date()
    });

    // Update user status if exists
    try {
      await getUsersRef().doc(companyId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already updated');
    }

    console.log(`✅ Company ${companyId} rejected successfully`);
    res.json({ 
      success: true,
      message: 'Company rejected successfully' 
    });
  } catch (error) {
    console.error('❌ Error rejecting company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reject company',
      error: error.message
    });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`🔍 Deleting company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    // Check if company has jobs
    const jobsSnapshot = await getJobsRef()
      .where('companyId', '==', companyId)
      .get();

    if (!jobsSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with existing job postings. Please delete jobs first.'
      });
    }

    await getCompaniesRef().doc(companyId).delete();

    // Also deactivate user account if exists
    try {
      await getUsersRef().doc(companyId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already deleted');
    }

    console.log(`✅ Company ${companyId} deleted successfully`);
    res.json({ 
      success: true,
      message: 'Company deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;
    console.log(`🔍 Updating company: ${companyId}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    await getCompaniesRef().doc(companyId).update({
      ...updateData,
      updatedAt: new Date()
    });

    console.log(`✅ Company ${companyId} updated successfully`);
    res.json({
      success: true,
      message: 'Company updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    console.log('🔍 Fetching all users...');
    const usersRef = getUsersRef();
    const usersSnapshot = await usersRef.get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Fetched ${users.length} users`);
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Resetting password for user: ${id}`);

    // In a real implementation, you would use Firebase Auth to reset password
    // This is a placeholder for the functionality
    await getUsersRef().doc(id).update({
      passwordReset: true,
      updatedAt: new Date()
    });

    console.log(`✅ Password reset initiated for user ${id}`);
    res.json({ 
      success: true,
      message: 'Password reset initiated successfully' 
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    console.log(`🔍 Updating status for user ${id} to: ${active ? 'active' : 'inactive'}`);

    await getUsersRef().doc(id).update({
      isActive: active,
      updatedAt: new Date()
    });

    console.log(`✅ User ${id} status updated successfully`);
    res.json({ 
      success: true,
      message: `User ${active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Add institution (admin functionality)
const addInstitution = async (req, res) => {
  try {
    const { name, email, phone, address, website, description, contactPerson } = req.body;
    console.log(`🔍 Adding new institution: ${name}`);

    const institutionData = {
      name,
      email,
      phone,
      address,
      website,
      description,
      contactPerson,
      isApproved: true, // Auto-approve when added by admin
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const institutionRef = await getInstitutionsRef().add(institutionData);

    console.log(`✅ Institution added successfully with ID: ${institutionRef.id}`);
    res.status(201).json({ 
      success: true,
      message: 'Institution added successfully', 
      institutionId: institutionRef.id
    });
  } catch (error) {
    console.error('❌ Error adding institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add institution',
      error: error.message
    });
  }
};

// Update institution
const updateInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const updateData = req.body;
    console.log(`🔍 Updating institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    await getInstitutionsRef().doc(institutionId).update({
      ...updateData,
      updatedAt: new Date()
    });

    console.log(`✅ Institution ${institutionId} updated successfully`);
    res.json({
      success: true,
      message: 'Institution updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating institution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update institution',
      error: error.message
    });
  }
};

// Delete institution
const deleteInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Deleting institution: ${institutionId}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    // Check if institution has courses
    const coursesSnapshot = await getCoursesRef()
      .where('institutionId', '==', institutionId)
      .get();

    if (!coursesSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete institution with existing courses. Please delete courses first.'
      });
    }

    await getInstitutionsRef().doc(institutionId).delete();

    // Also deactivate user account if exists
    try {
      await getUsersRef().doc(institutionId).update({
        isActive: false,
        updatedAt: new Date()
      });
    } catch (userError) {
      console.log('⚠️ User record not found or already deleted');
    }

    console.log(`✅ Institution ${institutionId} deleted successfully`);
    res.json({ 
      success: true,
      message: 'Institution deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete institution',
      error: error.message
    });
  }
};

// Add faculty to institution
const addFaculty = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { name, description } = req.body;
    console.log(`🔍 Adding faculty to institution ${institutionId}: ${name}`);

    const facultyData = {
      name,
      description: description || '',
      institutionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const facultyRef = await getFacultiesRef().add(facultyData);

    console.log(`✅ Faculty added successfully with ID: ${facultyRef.id}`);
    res.status(201).json({ 
      success: true,
      message: 'Faculty added successfully', 
      facultyId: facultyRef.id
    });
  } catch (error) {
    console.error('❌ Error adding faculty:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add faculty',
      error: error.message
    });
  }
};

// Get faculties for institution
const getFaculties = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Fetching faculties for institution: ${institutionId}`);

    const facultiesSnapshot = await getFacultiesRef()
      .where('institutionId', '==', institutionId)
      .get();

    const faculties = facultiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${faculties.length} faculties`);
    res.json({
      success: true,
      faculties: faculties
    });
  } catch (error) {
    console.error('❌ Error fetching faculties:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch faculties',
      error: error.message
    });
  }
};

// Update faculty
const updateFaculty = async (req, res) => {
  try {
    const { institutionId, facultyId } = req.params;
    const updateData = req.body;
    console.log(`🔍 Updating faculty: ${facultyId}`);

    const facultyDoc = await getFacultiesRef().doc(facultyId).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Faculty not found' 
      });
    }

    await getFacultiesRef().doc(facultyId).update({
      ...updateData,
      updatedAt: new Date()
    });

    console.log(`✅ Faculty ${facultyId} updated successfully`);
    res.json({
      success: true,
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty',
      error: error.message
    });
  }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
  try {
    const { institutionId, facultyId } = req.params;
    console.log(`🔍 Deleting faculty: ${facultyId}`);

    const facultyDoc = await getFacultiesRef().doc(facultyId).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Faculty not found' 
      });
    }

    // Check if faculty has courses
    const coursesSnapshot = await getCoursesRef()
      .where('facultyId', '==', facultyId)
      .get();

    if (!coursesSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete faculty with existing courses. Please delete courses first.'
      });
    }

    await getFacultiesRef().doc(facultyId).delete();

    console.log(`✅ Faculty ${facultyId} deleted successfully`);
    res.json({ 
      success: true,
      message: 'Faculty deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting faculty:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete faculty',
      error: error.message
    });
  }
};

// Add course to faculty
const addCourse = async (req, res) => {
  try {
    const { institutionId, facultyId } = req.params;
    const { name, description, duration, totalSeats, requirements, fees } = req.body;
    console.log(`🔍 Adding course to faculty ${facultyId} in institution ${institutionId}: ${name}`);

    const courseData = {
      name,
      description,
      duration,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      requirements: requirements || '',
      fees: fees ? parseFloat(fees) : 0,
      institutionId,
      facultyId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const courseRef = await getCoursesRef().add(courseData);

    console.log(`✅ Course added successfully with ID: ${courseRef.id}`);
    res.status(201).json({ 
      success: true,
      message: 'Course added successfully', 
      courseId: courseRef.id
    });
  } catch (error) {
    console.error('❌ Error adding course:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add course',
      error: error.message
    });
  }
};

// Get courses by institution
const getCoursesByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`🔍 Fetching courses for institution: ${institutionId}`);

    const coursesSnapshot = await getCoursesRef()
      .where('institutionId', '==', institutionId)
      .get();

    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

// Update course
const updateCourse = async (req, res) => {
  try {
    const { institutionId, facultyId, courseId } = req.params;
    const updateData = req.body;
    console.log(`🔍 Updating course: ${courseId}`);

    const courseDoc = await getCoursesRef().doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    await getCoursesRef().doc(courseId).update({
      ...updateData,
      updatedAt: new Date()
    });

    console.log(`✅ Course ${courseId} updated successfully`);
    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { institutionId, facultyId, courseId } = req.params;
    console.log(`🔍 Deleting course: ${courseId}`);

    const courseDoc = await getCoursesRef().doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // Check if course has applications
    const applicationsSnapshot = await getApplicationsRef()
      .where('courseId', '==', courseId)
      .get();

    if (!applicationsSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with existing applications. Please handle applications first.'
      });
    }

    await getCoursesRef().doc(courseId).delete();

    console.log(`✅ Course ${courseId} deleted successfully`);
    res.json({ 
      success: true,
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// Publish admissions
const publishAdmissions = async (req, res) => {
  try {
    const { title, description, startDate, endDate, programs } = req.body;
    console.log(`🔍 Publishing admissions: ${title}`);

    // This would typically create admissions records in the database
    // For now, we'll just return success
    console.log(`✅ Admissions published successfully: ${title}`);
    res.json({ 
      success: true,
      message: 'Admissions published successfully'
    });
  } catch (error) {
    console.error('❌ Error publishing admissions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to publish admissions',
      error: error.message
    });
  }
};

// Get admissions
const getAdmissions = async (req, res) => {
  try {
    console.log('🔍 Fetching admissions...');
    // This would fetch admissions from the database
    // For now, return empty array
    res.json({
      success: true,
      admissions: []
    });
  } catch (error) {
    console.error('❌ Error fetching admissions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admissions',
      error: error.message
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks } = req.body;
    console.log(`🔍 Updating application ${applicationId} status to: ${status}`);

    const applicationDoc = await getApplicationsRef().doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }

    await getApplicationsRef().doc(applicationId).update({
      status,
      remarks: remarks || '',
      updatedAt: new Date()
    });

    console.log(`✅ Application ${applicationId} status updated successfully`);
    res.json({ 
      success: true,
      message: 'Application status updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

// Get application details
const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log(`🔍 Fetching application details: ${applicationId}`);

    const applicationDoc = await getApplicationsRef().doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }

    const application = {
      id: applicationDoc.id,
      ...applicationDoc.data()
    };

    console.log(`✅ Application details fetched successfully`);
    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    console.error('❌ Error fetching application details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
};

// Keep existing methods for backward compatibility
const manageInstitution = async (req, res) => {
  try {
    const { institutionId, action } = req.body;
    console.log(`🔍 Managing institution ${institutionId} with action: ${action}`);

    const institutionDoc = await getInstitutionsRef().doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Institution not found' 
      });
    }

    let updateData = {};
    if (action === 'approve') {
      updateData = { isApproved: true, status: 'approved' };
    } else if (action === 'suspend') {
      updateData = { isApproved: false, status: 'suspended' };
    } else if (action === 'delete') {
      await getInstitutionsRef().doc(institutionId).delete();
      await getUsersRef().doc(institutionId).update({ isActive: false });
      return res.json({ 
        success: true,
        message: 'Institution deleted successfully' 
      });
    }

    await getInstitutionsRef().doc(institutionId).update(updateData);
    res.json({ 
      success: true,
      message: `Institution ${action} successfully` 
    });
  } catch (error) {
    console.error('❌ Error managing institution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to manage institution',
      error: error.message
    });
  }
};

const manageCompany = async (req, res) => {
  try {
    const { companyId, action } = req.body;
    console.log(`🔍 Managing company ${companyId} with action: ${action}`);

    const companyDoc = await getCompaniesRef().doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found' 
      });
    }

    let updateData = {};
    if (action === 'approve') {
      updateData = { isApproved: true, status: 'approved' };
    } else if (action === 'suspend') {
      updateData = { isApproved: false, status: 'suspended' };
    } else if (action === 'delete') {
      await getCompaniesRef().doc(companyId).delete();
      await getUsersRef().doc(companyId).update({ isActive: false });
      return res.json({ 
        success: true,
        message: 'Company deleted successfully' 
      });
    }

    await getCompaniesRef().doc(companyId).update(updateData);
    res.json({ 
      success: true,
      message: `Company ${action} successfully` 
    });
  } catch (error) {
    console.error('❌ Error managing company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to manage company',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemReports,
  getAllApplications,
  manageInstitution,
  manageCompany,
  getCompanies,
  getCompanyDetails,
  approveCompany,
  suspendCompany,
  rejectCompany,
  deleteCompany,
  updateCompany,
  getInstitutions,
  getInstitutionDetails,
  approveInstitution,
  suspendInstitution,
  rejectInstitution,
  deleteInstitution,
  updateInstitution,
  getUsers,
  resetUserPassword,
  updateUserStatus,
  addInstitution,
  addFaculty,
  addCourse,
  publishAdmissions,
  getAdmissions,
  getFaculties,
  getCoursesByInstitution,
  updateFaculty,
  deleteFaculty,
  updateCourse,
  deleteCourse,
  updateApplicationStatus,
  getApplicationDetails
};