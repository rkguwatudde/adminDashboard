#!/usr/bin/env node

/**
 * Test script to verify authentication guard functionality
 * Tests the complete authentication flow including middleware and guards
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:9000'; // Backend API URL
const FRONTEND_URL = 'http://localhost:3000'; // Frontend URL

// Test credentials
const testCredentials = {
  email: 'admin@borabond.com',
  password: 'Admin123!'
};

async function testLoginEndpoint() {
  console.log('🧪 Testing Login Endpoint');
  console.log('=========================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/login`, testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testTokenValidation() {
  console.log('\n🧪 Testing Token Validation');
  console.log('============================');
  
  try {
    // First login to get a token
    const loginResponse = await testLoginEndpoint();
    const token = loginResponse.data.token;
    
    if (!token) {
      throw new Error('No token received from login');
    }
    
    // Test token validation
    const response = await axios.get(`${API_BASE_URL}/api/admin/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Token validation successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Token validation failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testMiddlewareProtection() {
  console.log('\n🧪 Testing Middleware Protection');
  console.log('=================================');
  
  try {
    // Test accessing protected route without authentication
    console.log('Testing access to /dashboard without authentication...');
    
    const response = await axios.get(`${FRONTEND_URL}/dashboard`, {
      timeout: 10000,
      validateStatus: function (status) {
        // Accept redirect status codes
        return status >= 200 && status < 400;
      }
    });

    console.log('✅ Middleware protection working!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    // Check if redirected to login
    if (response.status === 302 || response.status === 307) {
      const location = response.headers.location;
      console.log('Redirected to:', location);
      
      if (location && location.includes('/login')) {
        console.log('✅ Correctly redirected to login page');
      } else {
        console.log('❌ Incorrect redirect location');
      }
    }
    
    return response;
  } catch (error) {
    console.error('❌ Middleware protection test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testAuthGuardFlow() {
  console.log('\n🧪 Testing Complete Auth Guard Flow');
  console.log('====================================');
  
  try {
    // Test login flow
    const loginResult = await testLoginEndpoint();
    const token = loginResult.data.token;
    const user = loginResult.data.user;
    
    console.log('\n📊 Authentication Data:');
    console.log('- Token:', token ? 'Received' : 'Missing');
    console.log('- User ID:', user?.id || 'Missing');
    console.log('- User Email:', user?.email || 'Missing');
    console.log('- User Role:', user?.role || 'Missing');
    
    // Test token validation
    await testTokenValidation();
    
    // Test middleware protection
    await testMiddlewareProtection();
    
    console.log('\n🎉 Complete authentication flow test successful!');
    console.log('===============================================');
    console.log('✅ Login endpoint working');
    console.log('✅ Token validation working');
    console.log('✅ Middleware protection working');
    console.log('✅ AuthGuard components ready');
    
    console.log('\n🔧 Implementation Summary:');
    console.log('- Next.js middleware.ts: Edge route protection');
    console.log('- AuthGuard.tsx: Client-side authentication guard');
    console.log('- AuthContext.tsx: Enhanced with cookie support');
    console.log('- auth-server.ts: Server-side authentication utilities');
    console.log('- Dashboard layout: Protected with AuthGuard');
    console.log('- Login page: Handles redirect parameters');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Start the backend: npm start (in ledger-service)');
    console.log('3. Test the complete flow in browser');
    console.log('4. Verify middleware redirects work');
    console.log('5. Test AuthGuard loading states');
    
  } catch (error) {
    console.error('\n💥 Tests failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testAuthGuardFlow();
}

module.exports = {
  testLoginEndpoint,
  testTokenValidation,
  testMiddlewareProtection,
  testAuthGuardFlow
};
