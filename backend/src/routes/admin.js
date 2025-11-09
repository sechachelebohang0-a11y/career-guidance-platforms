const express = require('express');
const { 
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
} = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(authorize('admin'));

// Dashboard and reports
router.get('/dashboard/stats', getDashboardStats);
router.get('/reports', getSystemReports);

// User management
router.get('/users', getUsers);
router.post('/users/:id/reset-password', resetUserPassword);
router.put('/users/:id/status', updateUserStatus);

// Institution management
router.get('/institutions', getInstitutions);
router.get('/institutions/:institutionId', getInstitutionDetails);
router.post('/institutions', addInstitution);
router.put('/institutions/:institutionId', updateInstitution);
router.delete('/institutions/:institutionId', deleteInstitution);
router.put('/institutions/:institutionId/approve', approveInstitution);
router.put('/institutions/:institutionId/suspend', suspendInstitution);
router.put('/institutions/:institutionId/reject', rejectInstitution);
router.post('/institutions/manage', manageInstitution);

// Faculty and course management
router.get('/institutions/:institutionId/faculties', getFaculties);
router.post('/institutions/:institutionId/faculties', addFaculty);
router.put('/institutions/:institutionId/faculties/:facultyId', updateFaculty);
router.delete('/institutions/:institutionId/faculties/:facultyId', deleteFaculty);
router.get('/institutions/:institutionId/courses', getCoursesByInstitution);
router.post('/institutions/:institutionId/faculties/:facultyId/courses', addCourse);
router.put('/institutions/:institutionId/faculties/:facultyId/courses/:courseId', updateCourse);
router.delete('/institutions/:institutionId/faculties/:facultyId/courses/:courseId', deleteCourse);

// Company management
router.get('/companies', getCompanies);
router.get('/companies/:companyId', getCompanyDetails);
router.put('/companies/:companyId/approve', approveCompany);
router.put('/companies/:companyId/suspend', suspendCompany);
router.put('/companies/:companyId/reject', rejectCompany);
router.put('/companies/:companyId', updateCompany);
router.delete('/companies/:companyId', deleteCompany);

// Applications and admissions
router.get('/applications', getAllApplications);
router.get('/applications/:applicationId', getApplicationDetails);
router.put('/applications/:applicationId/status', updateApplicationStatus);
router.post('/admissions/publish', publishAdmissions);
router.get('/admissions', getAdmissions);

module.exports = router;