import React, { useState } from 'react';
import axios from 'axios';

const TestAuth = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Test basic connection
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setTestResult(`✅ Connection successful! Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setTestResult('❌ Network error: Cannot connect to server. Make sure MongoDB is running and server is started.');
      } else {
        setTestResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123'
      };
      
      const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
      setTestResult(`✅ Registration test successful! User created: ${response.data.user.email}`);
    } catch (error) {
      if (error.response) {
        setTestResult(`❌ Registration failed: ${error.response.data.message}`);
      } else if (error.code === 'ERR_NETWORK') {
        setTestResult('❌ Network error: Cannot connect to server');
      } else {
        setTestResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      
      
      <div className="space-y-4">
        
        
        
      </div>
      
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
      
      
    </div>
  );
};

export default TestAuth;
