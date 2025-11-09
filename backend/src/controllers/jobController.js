const { db } = require('../config/firebase');

const getJobs = async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs')
      .where('isActive', '==', true)
      .get();
    
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

const getJobDetails = async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({
      id: jobDoc.id,
      ...jobDoc.data()
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Failed to fetch job details' });
  }
};

module.exports = {
  getJobs,
  getJobDetails
};