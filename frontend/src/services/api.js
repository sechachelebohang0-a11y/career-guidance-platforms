import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  
  testConnection: async () => {
    try {
      const response = await api.get('/test-connection');
      return { 
        success: true, 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to backend',
        status: error.response?.status
      };
    }
  }
};

// Add new methods to studentAPI
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  // ... other methods

  
  // Courses and applications
  getCourses: () => api.get('/students/courses'),
  applyForCourse: (data) => api.post('/students/applications', data),
  getApplications: () => api.get('/students/applications'),
  acceptAdmissionOffer: (applicationId) => api.post(`/students/applications/${applicationId}/accept`),
  
  // Jobs
  getJobs: () => api.get('/students/jobs'),
  getJobDetails: (id) => api.get(`/students/jobs/${id}`),
  applyForJob: (id) => api.post(`/students/jobs/${id}/apply`),
  
  // Documents
  uploadTranscript: (data) => api.post('/students/transcripts', data),
  updateDocuments: (data) => api.put('/students/documents', data),
  
  // Notifications
  getNotifications: () => api.get('/students/notifications'),
  markNotificationAsRead: (notificationId) => api.put(`/students/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.put('/students/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/students/notifications/${notificationId}`),
  
  // Dashboard
  getStats: () => api.get('/students/stats'),
};

  // src/services/api.js
export const institutionAPI = {
  getProfile: () => api.get('/institutions/profile'),
  updateProfile: (data) => api.put('/institutions/profile', data),
  // ... other methods
  addCourse: (data) => api.post('/institutions/courses', data),
  getCourses: () => api.get('/institutions/courses'),
  getApplications: () => api.get('/institutions/applications'),
  manageApplication: (data) => api.put('/institutions/applications', data),
  
  // ADDED MISSING METHODS:
  getDashboardStats: () => api.get('/institutions/dashboard/stats'),
  getFaculties: () => api.get('/institutions/faculties'),
  addFaculty: (data) => api.post('/institutions/faculties', data),
  updateFaculty: (facultyId, data) => api.put(`/institutions/faculties/${facultyId}`, data),
  deleteFaculty: (facultyId) => api.delete(`/institutions/faculties/${facultyId}`),
  updateCourse: (courseId, data) => api.put(`/institutions/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/institutions/courses/${courseId}`),
  deactivateCourse: (courseId, data) => api.put(`/institutions/courses/${courseId}/status`, data),
};

export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  postJob: (data) => api.post('/companies/jobs', data),
  getJobApplications: () => api.get('/companies/jobs/applications'),
};

export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  getJobDetails: (id) => api.get(`/jobs/${id}`),
  applyForJob: (id) => api.post(`/jobs/${id}/apply`),
};

export const adminAPI = {
  // Dashboard and reports
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSystemReports: () => api.get('/admin/reports'),
  
  // User management
  getUsers: () => api.get('/admin/users'),
  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  updateUserStatus: (id, active) => api.put(`/admin/users/${id}/status`, { active }),
  
  // Institution management
  getInstitutions: () => api.get('/admin/institutions'),
  getInstitutionDetails: (id) => api.get(`/admin/institutions/${id}`),
  addInstitution: (data) => api.post('/admin/institutions', data),
  updateInstitution: (id, data) => api.put(`/admin/institutions/${id}`, data),
  deleteInstitution: (id) => api.delete(`/admin/institutions/${id}`),
  approveInstitution: (id) => api.put(`/admin/institutions/${id}/approve`),
  suspendInstitution: (id) => api.put(`/admin/institutions/${id}/suspend`),
  rejectInstitution: (id) => api.put(`/admin/institutions/${id}/reject`),
  
  // Company management
  getCompanies: () => api.get('/admin/companies'),
  getCompanyDetails: (id) => api.get(`/admin/companies/${id}`),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  suspendCompany: (id) => api.put(`/admin/companies/${id}/suspend`),
  rejectCompany: (id) => api.put(`/admin/companies/${id}/reject`),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
  
  // Faculty and course management
  addFaculty: (institutionId, data) => api.post(`/admin/institutions/${institutionId}/faculties`, data),
  addCourse: (institutionId, facultyId, data) => api.post(`/admin/institutions/${institutionId}/faculties/${facultyId}/courses`, data),
  getFaculties: (institutionId) => api.get(`/admin/institutions/${institutionId}/faculties`),
  getCoursesByInstitution: (institutionId) => api.get(`/admin/institutions/${institutionId}/courses`),
  updateFaculty: (institutionId, facultyId, data) => api.put(`/admin/institutions/${institutionId}/faculties/${facultyId}`, data),
  deleteFaculty: (institutionId, facultyId) => api.delete(`/admin/institutions/${institutionId}/faculties/${facultyId}`),
  updateCourse: (institutionId, facultyId, courseId, data) => api.put(`/admin/institutions/${institutionId}/faculties/${facultyId}/courses/${courseId}`, data),
  deleteCourse: (institutionId, facultyId, courseId) => api.delete(`/admin/institutions/${institutionId}/faculties/${facultyId}/courses/${courseId}`),
  
  // Admissions management
  getAllApplications: () => api.get('/admin/applications'),
  publishAdmissions: (data) => api.post('/admin/admissions/publish', data),
  getAdmissions: () => api.get('/admin/admissions'),
  updateApplicationStatus: (applicationId, data) => api.put(`/admin/applications/${applicationId}/status`, data),
  getApplicationDetails: (applicationId) => api.get(`/admin/applications/${applicationId}`),
  
  // Enhanced methods
  getNotifications: () => api.get('/admin/notifications'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getSupportTickets: () => api.get('/admin/support/tickets'),
  getAnalytics: () => api.get('/admin/analytics'),
  bulkAction: (data) => api.post('/admin/bulk-actions', data),
  exportData: (type) => api.get(`/admin/export/${type}`, { responseType: 'blob' }),
  sendBroadcast: (data) => api.post('/admin/broadcast', data),
  updateSystemSettings: (data) => api.put('/admin/system/settings', data),
  
  // Statistics and monitoring
  getUserStats: () => api.get('/admin/stats/users'),
  getApplicationStats: () => api.get('/admin/stats/applications'),
  getInstitutionStats: () => api.get('/admin/stats/institutions'),
  getCompanyStats: () => api.get('/admin/stats/companies'),
  
  // System management
  getSystemLogs: () => api.get('/admin/system/logs'),
  clearSystemCache: () => api.post('/admin/system/clear-cache'),
  backupDatabase: () => api.post('/admin/system/backup'),
  
  // Bulk operations
  bulkApproveInstitutions: (data) => api.post('/admin/institutions/bulk-approve', data),
  bulkApproveCompanies: (data) => api.post('/admin/companies/bulk-approve', data),
  bulkUpdateUserStatus: (data) => api.post('/admin/users/bulk-status', data),
};

export default api;