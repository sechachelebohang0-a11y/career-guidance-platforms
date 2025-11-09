const express = require('express');
const { getJobsRef, getStudentsRef } = require('../config/firebase'); // ✅ Use getter functions
const { authenticateToken } = require('../middleware/auth'); // ✅ Use new auth middleware

const router = express.Router();

// Public route - get all active jobs
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching jobs...');
    
    // ✅ FIX: Use the getter function
    const jobsRef = getJobsRef();
    
    const jobsSnapshot = await jobsRef
      .where('isActive', '==', true)
      .get();
    
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      jobs: jobs
    });
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch jobs' 
    });
  }
});

// Public route - get specific job details
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobsRef = getJobsRef(); // ✅ Use getter
    const jobDoc = await jobsRef.doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }
    
    res.json({
      success: true,
      job: {
        id: jobDoc.id,
        ...jobDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch job details' 
    });
  }
});

// Protected route - apply for job (students only)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user.uid;

    // ✅ FIX: Use getter functions
    const jobsRef = getJobsRef();
    const studentsRef = getStudentsRef();

    const jobDoc = await jobsRef.doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    const job = jobDoc.data();

    // Check if student exists
    const studentDoc = await studentsRef.doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Student profile not found' 
      });
    }

    const student = studentDoc.data();

    // Check if already applied
    const hasApplied = job.applicants?.some(app => app.studentId === studentId);
    if (hasApplied) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already applied for this job' 
      });
    }

    // Add to job applicants
    const newApplicant = {
      studentId,
      appliedAt: new Date(),
      status: 'under_review'
    };

    await jobsRef.doc(jobId).update({
      applicants: [...(job.applicants || []), newApplicant]
    });

    res.json({ 
      success: true,
      message: 'Job application submitted successfully' 
    });
    
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to apply for job' 
    });
  }
});

module.exports = router;