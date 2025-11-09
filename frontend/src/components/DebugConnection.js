import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const DebugConnection = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAllEndpoints = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Basic connection
      console.log('🧪 Test 1: Testing basic connection...');
      const connectionTest = await authAPI.testConnection();
      testResults.connection = connectionTest;

      // Test 2: Health check
      console.log('🧪 Test 2: Testing health endpoint...');
      const healthResponse = await authAPI.healthCheck();
      testResults.health = { success: true, data: healthResponse.data };

      // Test 3: Test database
      console.log('🧪 Test 3: Testing database...');
      const dbResponse = await authAPI.testDatabase();
      testResults.database = { success: true, data: dbResponse.data };

    } catch (error) {
      console.error('❌ Test failed:', error);
      testResults.error = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '20px', borderRadius: '10px' }}>
      <h2>🔧 Connection Debugger</h2>
      <button 
        onClick={testAllEndpoints} 
        disabled={loading}
        style={{ padding: '10px 20px', marginBottom: '20px' }}
      >
        {loading ? 'Testing...' : 'Run Tests Again'}
      </button>

      <div>
        <h3>Test Results:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Manual Test URLs:</h3>
        <ul>
          <li><a href="https://career-guidance-platforms.onrender.com/" target="_blank" rel="noopener noreferrer">Root Endpoint</a></li>
          <li><a href="https://career-guidance-platforms.onrender.com/api/health" target="_blank" rel="noopener noreferrer">Health Check</a></li>
          <li><a href="https://career-guidance-platforms.onrender.com/api/test-connection" target="_blank" rel="noopener noreferrer">Test Connection</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DebugConnection;