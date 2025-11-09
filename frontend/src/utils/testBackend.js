// src/utils/testBackend.js
import { adminAPI } from '../services/api';

export const testAdminEndpoints = async () => {
  console.log('🧪 Testing Admin Endpoints...');
  
  try {
    // Test companies endpoint
    console.log('1. Testing /admin/companies...');
    const companiesResponse = await adminAPI.getCompanies();
    console.log('Companies endpoint:', companiesResponse.data);
    
    return {
      success: true,
      companies: companiesResponse.data
    };
  } catch (error) {
    console.error('❌ Admin endpoint test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};