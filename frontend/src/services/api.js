import axios from 'axios';

// Guaranteed to use Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://career-guidance-platforms.onrender.com/api';

console.log('🎯 FINAL API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Enhanced request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`🚀 API Request to: ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    };
    
    console.error('❌ API Error Details:', errorDetails);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhanced error message for connection issues
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      error.message = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.response?.status === 404) {
      error.message = 'Requested resource not found.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Enhanced connection test
export const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection to:', API_BASE_URL);
    const response = await api.get('/test-connection');
    return { 
      success: true, 
      message: 'Connected to backend successfully!',
      data: response.data,
      url: API_BASE_URL,
      status: response.status
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    return { 
      success: false, 
      message: `Cannot connect to backend server`,
      error: errorMessage,
      url: API_BASE_URL,
      status: error.response?.status,
      suggestion: 'Please ensure the backend is deployed and running on Render'
    };
  }
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  testConnection: testBackendConnection,
  healthCheck: () => api.get('/health'),
  testDatabase: () => api.get('/test-db')
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getCourses: () => api.get('/students/courses'),
  applyForCourse: (data) => api.post('/students/applications', data),
  getApplications: () => api.get('/students/applications'),
  acceptAdmissionOffer: (applicationId) => api.post(`/students/applications/${applicationId}/accept`),
  getJobs: () => api.get('/students/jobs'),
  getJobDetails: (id) => api.get(`/students/jobs/${id}`),
  applyForJob: (id) => api.post(`/students/jobs/${id}/apply`),
  uploadTranscript: (data) => api.post('/students/transcripts', data),
  updateDocuments: (data) => api.put('/students/documents', data),
  getNotifications: () => api.get('/students/notifications'),
  markNotificationAsRead: (notificationId) => api.put(`/students/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.put('/students/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/students/notifications/${notificationId}`),
  getStats: () => api.get('/students/stats'),
};

// Institution API
export const institutionAPI = {
  getProfile: () => api.get('/institutions/profile'),
  updateProfile: (data) => api.put('/institutions/profile', data),
  addCourse: (data) => api.post('/institutions/courses', data),
  getCourses: () => api.get('/institutions/courses'),
  getApplications: () => api.get('/institutions/applications'),
  manageApplication: (data) => api.put('/institutions/applications', data),
  getDashboardStats: () => api.get('/institutions/dashboard/stats'),
  getFaculties: () => api.get('/institutions/faculties'),
  addFaculty: (data) => api.post('/institutions/faculties', data),
  updateFaculty: (facultyId, data) => api.put(`/institutions/faculties/${facultyId}`, data),
  deleteFaculty: (facultyId) => api.delete(`/institutions/faculties/${facultyId}`),
  updateCourse: (courseId, data) => api.put(`/institutions/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/institutions/courses/${courseId}`),
  deactivateCourse: (courseId, data) => api.put(`/institutions/courses/${courseId}/status`, data),
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  postJob: (data) => api.post('/companies/jobs', data),
  getJobApplications: () => api.get('/companies/jobs/applications'),
};

// Job API
export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  getJobDetails: (id) => api.get(`/jobs/${id}`),
  applyForJob: (id) => api.post(`/jobs/${id}/apply`),
};

// Admin API (keeping your existing methods)
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSystemReports: () => api.get('/admin/reports'),
  getUsers: () => api.get('/admin/users'),
  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  updateUserStatus: (id, active) => api.put(`/admin/users/${id}/status`, { active }),
  getInstitutions: () => api.get('/admin/institutions'),
  getInstitutionDetails: (id) => api.get(`/admin/institutions/${id}`),
  addInstitution: (data) => api.post('/admin/institutions', data),
  updateInstitution: (id, data) => api.put(`/admin/institutions/${id}`, data),
  deleteInstitution: (id) => api.delete(`/admin/institutions/${id}`),
  approveInstitution: (id) => api.put(`/admin/institutions/${id}/approve`),
  suspendInstitution: (id) => api.put(`/admin/institutions/${id}/suspend`),
  rejectInstitution: (id) => api.put(`/admin/institutions/${id}/reject`),
  getCompanies: () => api.get('/admin/companies'),
  getCompanyDetails: (id) => api.get(`/admin/companies/${id}`),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  suspendCompany: (id) => api.put(`/admin/companies/${id}/suspend`),
  rejectCompany: (id) => api.put(`/admin/companies/${id}/reject`),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
  getAllApplications: () => api.get('/admin/applications'),
  publishAdmissions: (data) => api.post('/admin/admissions/publish', data),
  getAdmissions: () => api.get('/admin/admissions'),
  updateApplicationStatus: (applicationId, data) => api.put(`/admin/applications/${applicationId}/status`, data),
  getApplicationDetails: (applicationId) => api.get(`/admin/applications/${applicationId}`),
};

export default api;