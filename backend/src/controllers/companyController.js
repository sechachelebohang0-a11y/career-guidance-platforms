const { getCompaniesRef, getJobsRef, getStudentsRef, getNotificationsRef } = require('../config/firebase');

const getCompanyProfile = async (req, res) => {
  try {
    const companiesRef = getCompaniesRef();
    const companyDoc = await companiesRef.doc(req.user.uid).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Company profile not found' 
      });
    }
    res.json({
      success: true,
      profile: companyDoc.data()
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile' 
    });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    const { name, industry, size, description, website, address, phone } = req.body;
    const companiesRef = getCompaniesRef();
    
    await companiesRef.doc(req.user.uid).update({
      name,
      industry,
      size,
      description,
      website,
      address,
      phone,
      updatedAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
};

const postJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      qualifications, 
      deadline,
      location,
      salary,
      type,
      category
    } = req.body;

    const jobsRef = getJobsRef();
    const companiesRef = getCompaniesRef();

    const job = {
      id: `${req.user.uid}_job_${Date.now()}`,
      companyId: req.user.uid,
      title,
      description,
      requirements: requirements || [],
      qualifications: qualifications || [],
      deadline: new Date(deadline),
      location,
      salary,
      type: type || 'full-time',
      category,
      isActive: true,
      postedAt: new Date(),
      applicants: [],
      qualifiedCandidates: 0
    };

    await jobsRef.doc(job.id).set(job);

    // Add to company's jobs
    const companyDoc = await companiesRef.doc(req.user.uid).get();
    const company = companyDoc.data();

    await companiesRef.doc(req.user.uid).update({
      jobs: [...(company.jobs || []), job.id]
    });

    // Find qualified students and send notifications
    await matchStudentsToJob(job);

    res.status(201).json({ 
      success: true,
      message: 'Job posted successfully', 
      job 
    });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to post job' 
    });
  }
};

const matchStudentsToJob = async (job) => {
  try {
    const studentsRef = getStudentsRef();
    const jobsRef = getJobsRef();
    const notificationsRef = getNotificationsRef();

    const studentsSnapshot = await studentsRef.get();
    const qualifiedStudents = [];

    for (const doc of studentsSnapshot.docs) {
      const student = doc.data();
      
      if (await isStudentQualified(student, job)) {
        qualifiedStudents.push({
          studentId: student.uid,
          matchScore: calculateMatchScore(student, job)
        });

        // Create notification
        await notificationsRef.add({
          userId: student.uid,
          title: 'New Job Opportunity',
          message: `A new job "${job.title}" matches your profile`,
          type: 'job_match',
          jobId: job.id,
          companyId: job.companyId,
          createdAt: new Date(),
          isRead: false
        });
      }
    }

    // Update job with qualified students
    await jobsRef.doc(job.id).update({
      qualifiedCandidates: qualifiedStudents.length,
      qualifiedStudents: qualifiedStudents.sort((a, b) => b.matchScore - a.matchScore)
    });

  } catch (error) {
    console.error('Error matching students to job:', error);
  }
};

const isStudentQualified = async (student, job) => {
  // Check if student has completed studies (has transcripts)
  if (!student.transcripts || student.transcripts.length === 0) {
    return false;
  }

  // Check academic performance
  const hasGoodGrades = checkAcademicPerformance(student.transcripts);
  
  // Check certificates
  const hasRequiredCerts = checkCertificates(student.certificates, job.requirements);
  
  // Check work experience
  const hasRequiredExperience = checkWorkExperience(student.workExperience, job.requirements);
  
  // Check qualifications relevance
  const isRelevant = checkQualificationsRelevance(student.qualifications, job.qualifications);

  return hasGoodGrades && hasRequiredCerts && hasRequiredExperience && isRelevant;
};

const calculateMatchScore = (student, job) => {
  let score = 0;

  // Academic performance (40%)
  if (checkAcademicPerformance(student.transcripts)) score += 40;

  // Certificates match (20%)
  const certMatch = calculateCertificatesMatch(student.certificates, job.requirements);
  score += certMatch * 20;

  // Work experience (20%)
  const expMatch = calculateExperienceMatch(student.workExperience, job.requirements);
  score += expMatch * 20;

  // Qualifications relevance (20%)
  const qualMatch = calculateQualificationsMatch(student.qualifications, job.qualifications);
  score += qualMatch * 20;

  return score;
};

const checkAcademicPerformance = (transcripts) => {
  // Simplified - assume transcripts indicate completion
  return transcripts && transcripts.length > 0;
};

const checkCertificates = (certificates, requirements) => {
  if (!requirements || requirements.length === 0) return true;
  if (!certificates) return false;

  return certificates.length >= (requirements.minCertificates || 0);
};

const checkWorkExperience = (workExperience, requirements) => {
  if (!requirements || !requirements.minExperience) return true;
  if (!workExperience) return false;

  const totalExperience = workExperience.reduce((total, exp) => {
    return total + (exp.durationMonths || 0);
  }, 0);

  return totalExperience >= requirements.minExperience;
};

const checkQualificationsRelevance = (studentQuals, jobQuals) => {
  if (!jobQuals || jobQuals.length === 0) return true;
  if (!studentQuals) return false;

  return studentQuals.some(qual => 
    jobQuals.some(jobQual => 
      qual.toLowerCase().includes(jobQual.toLowerCase()) ||
      jobQual.toLowerCase().includes(qual.toLowerCase())
    )
  );
};

const calculateCertificatesMatch = (certificates, requirements) => {
  // Simplified matching logic
  if (!requirements) return 1;
  if (!certificates) return 0;

  const requiredCount = requirements.minCertificates || 0;
  return Math.min(certificates.length / Math.max(requiredCount, 1), 1);
};

const calculateExperienceMatch = (experience, requirements) => {
  if (!requirements || !requirements.minExperience) return 1;
  if (!experience) return 0;

  const totalExperience = experience.reduce((total, exp) => total + (exp.durationMonths || 0), 0);
  return Math.min(totalExperience / requirements.minExperience, 1);
};

const calculateQualificationsMatch = (studentQuals, jobQuals) => {
  if (!jobQuals || jobQuals.length === 0) return 1;
  if (!studentQuals) return 0;

  const matches = jobQuals.filter(jobQual =>
    studentQuals.some(studentQual =>
      studentQual.toLowerCase().includes(jobQual.toLowerCase()) ||
      jobQual.toLowerCase().includes(studentQual.toLowerCase())
    )
  ).length;

  return matches / jobQuals.length;
};

const getJobApplications = async (req, res) => {
  try {
    const companyId = req.user.uid;
    const jobsRef = getJobsRef();
    const studentsRef = getStudentsRef();
    
    const jobsSnapshot = await jobsRef
      .where('companyId', '==', companyId)
      .get();

    const jobs = await Promise.all(
      jobsSnapshot.docs.map(async (doc) => {
        const job = doc.data();
        
        // Get qualified students details
        const qualifiedStudents = await Promise.all(
          (job.qualifiedStudents || []).slice(0, 50).map(async (qualified) => {
            const studentDoc = await studentsRef.doc(qualified.studentId).get();
            return {
              ...qualified,
              student: studentDoc.exists ? studentDoc.data() : null
            };
          })
        );

        return {
          id: doc.id,
          ...job,
          qualifiedStudents
        };
      })
    );

    res.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch job applications' 
    });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  postJob,
  getJobApplications
};