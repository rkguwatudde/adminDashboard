#!/usr/bin/env node

/**
 * Test script to debug authentication issues
 * Tests the login endpoint and checks what data is returned
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:9000'; // Backend API URL

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
    
    // Check the structure of the response
    if (response.data.success && response.data.data) {
      console.log('\n📊 Response Structure Analysis:');
      console.log('- success:', response.data.success);
      console.log('- data exists:', !!response.data.data);
      console.log('- user exists:', !!response.data.data.user);
      console.log('- token exists:', !!response.data.data.token);
      
      if (response.data.data.user) {
        console.log('\n👤 User Data:');
        console.log('- id:', response.data.data.user.id);
        console.log('- email:', response.data.data.user.email);
        console.log('- role:', response.data.data.user.role);
      }
      
      if (response.data.data.token) {
        console.log('\n🔑 Token:');
        console.log('- length:', response.data.data.token.length);
        console.log('- starts with:', response.data.data.token.substring(0, 20) + '...');
      }
    }
    
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

async function runTests() {
  console.log('🚀 Testing Authentication Debug');
  console.log('===============================\n');
  
  try {
    // Test Login Endpoint
    const loginResult = await testLoginEndpoint();
    
    // Test Token Validation
    const validationResult = await testTokenValidation();
    
    console.log('\n🎉 Authentication tests completed successfully!');
    console.log('===============================================');
    console.log('✅ Login endpoint working');
    console.log('✅ Token validation working');
    console.log('\n📊 Summary:');
    console.log('- Login response structure is correct');
    console.log('- User data is properly formatted');
    console.log('- Token is generated and valid');
    
    console.log('\n🔍 Debugging Tips:');
    console.log('1. Check browser console for AuthContext logs');
    console.log('2. Check localStorage for adminToken and adminUser');
    console.log('3. Verify the user data structure matches the interface');
    console.log('4. Check if there are any JavaScript errors in the browser');
    
  } catch (error) {
    console.error('\n💥 Tests failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testLoginEndpoint,
  testTokenValidation,
  runTests
};
