// Complete Authentication Flow Test
// Run this in the browser console to test the enhanced auth system

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete BoraBond Authentication Flow...\n');
  
  // Test 1: Check if we're on the right page
  const currentPath = window.location.pathname;
  console.log(`📍 Current location: ${currentPath}`);
  
  if (currentPath === '/login') {
    console.log('✅ Test 1: On login page - proceeding with login tests');
    await testLoginFlow();
  } else if (currentPath === '/dashboard') {
    console.log('✅ Test 1: On dashboard page - proceeding with dashboard tests');
    await testDashboardFlow();
  } else if (currentPath === '/dashboard/users') {
    console.log('✅ Test 1: On users page - proceeding with users page tests');
    await testUsersPageFlow();
  } else {
    console.log('❌ Test 1: Unexpected page - cannot run tests');
    return;
  }
}

async function testLoginFlow() {
  console.log('\n🔐 Testing Login Flow...');
  
  // Test 2: Check form elements
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (emailInput && passwordInput && submitButton) {
    console.log('✅ Test 2: All form elements found');
  } else {
    console.log('❌ Test 2: Missing form elements');
    return;
  }
  
  // Test 3: Check API connectivity
  try {
    const response = await fetch('http://localhost:9000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@borabond.com',
        password: 'Test123!@#'
      })
    });
    
    if (response.ok) {
      console.log('✅ Test 3: API endpoint accessible');
      
      const data = await response.json();
      if (data.success && data.data.token) {
        console.log('✅ Test 4: Login endpoint returns valid JWT token');
        console.log(`   Token: ${data.data.token.substring(0, 50)}...`);
        console.log(`   User: ${data.data.user.email} (${data.data.user.role})`);
        
        // Test 5: Test token validation
        await testTokenValidation(data.data.token);
      } else {
        console.log('❌ Test 4: Login endpoint response format incorrect');
      }
    } else {
      console.log(`❌ Test 3: API endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Test 3: API endpoint not accessible:', error.message);
  }
  
  // Test 6: Check localStorage functionality
  try {
    localStorage.setItem('test', 'value');
    const testValue = localStorage.getItem('test');
    if (testValue === 'value') {
      console.log('✅ Test 6: localStorage working correctly');
      localStorage.removeItem('test');
    } else {
      console.log('❌ Test 6: localStorage not working correctly');
    }
  } catch (error) {
    console.log('❌ Test 6: localStorage error:', error.message);
  }
  
  console.log('\n💡 Login Flow Test Complete!');
  console.log('Next: Fill in the form and submit to test the complete flow');
}

async function testDashboardFlow() {
  console.log('\n🏠 Testing Dashboard Flow...');
  
  // Test 2: Check if user info is displayed
  const userEmail = document.querySelector('p.text-gray-600');
  if (userEmail && userEmail.textContent.includes('Welcome back')) {
    console.log('✅ Test 2: User welcome message displayed');
  } else {
    console.log('❌ Test 2: User welcome message not found');
  }
  
  // Test 3: Check if role badge is displayed
  const roleBadge = document.querySelector('span.inline-flex');
  if (roleBadge) {
    console.log('✅ Test 3: User role badge displayed');
    console.log(`   Role: ${roleBadge.textContent}`);
  } else {
    console.log('❌ Test 3: User role badge not found');
  }
  
  // Test 4: Check if header shows user info
  const headerUserInfo = document.querySelector('header p.text-sm.font-medium');
  if (headerUserInfo) {
    console.log('✅ Test 4: Header shows user information');
  } else {
    console.log('❌ Test 4: Header user info not found');
  }
  
  // Test 5: Check if logout functionality exists
  const logoutButton = document.querySelector('button[onclick*="logout"], button:contains("Sign Out")');
  if (logoutButton) {
    console.log('✅ Test 5: Logout functionality available');
  } else {
    console.log('❌ Test 5: Logout functionality not found');
  }
  
  console.log('\n💡 Dashboard Flow Test Complete!');
  console.log('Next: Navigate to /dashboard/users to test protected routes');
}

async function testUsersPageFlow() {
  console.log('\n👥 Testing Users Page Flow...');
  
  // Test 2: Check if page shows user info
  const userInfo = document.querySelector('span.text-sm.text-gray-500');
  if (userInfo && userInfo.textContent.includes('Logged in as')) {
    console.log('✅ Test 2: User info displayed on users page');
  } else {
    console.log('❌ Test 2: User info not found on users page');
  }
  
  // Test 3: Check if stats cards are displayed
  const statsCards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-4 .card');
  if (statsCards.length > 0) {
    console.log(`✅ Test 3: Stats cards displayed (${statsCards.length} found)`);
  } else {
    console.log('❌ Test 3: Stats cards not found');
  }
  
  // Test 4: Check if search and filters are available
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    console.log('✅ Test 4: Search functionality available');
  } else {
    console.log('❌ Test 4: Search functionality not found');
  }
  
  console.log('\n💡 Users Page Flow Test Complete!');
  console.log('Next: Test the logout functionality');
}

async function testTokenValidation(token) {
  console.log('\n🔍 Testing Token Validation...');
  
  try {
    const response = await fetch('http://localhost:9000/api/admin/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Token validation successful');
        console.log(`   Validated user: ${data.data.user.email} (${data.data.user.role})`);
      } else {
        console.log('❌ Token validation failed');
      }
    } else {
      console.log(`❌ Token validation returned ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Token validation error:', error.message);
  }
}

// Test localStorage and session management
function testSessionManagement() {
  console.log('\n💾 Testing Session Management...');
  
  // Check current tokens
  const currentToken = localStorage.getItem('adminToken');
  const currentUser = localStorage.getItem('adminUser');
  
  if (currentToken && currentUser) {
    console.log('✅ Current session found');
    console.log(`   Token: ${currentToken.substring(0, 50)}...`);
    console.log(`   User: ${JSON.parse(currentUser).email}`);
  } else {
    console.log('❌ No current session found');
  }
  
  // Test session clearing
  const testToken = 'test-token';
  const testUser = '{"email":"test@example.com","role":"ADMIN"}';
  
  localStorage.setItem('adminToken', testToken);
  localStorage.setItem('adminUser', testUser);
  
  if (localStorage.getItem('adminToken') === testToken) {
    console.log('✅ Session can be set');
    
    // Clear test session
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    if (!localStorage.getItem('adminToken')) {
      console.log('✅ Session can be cleared');
    } else {
      console.log('❌ Session clearing failed');
    }
  } else {
    console.log('❌ Session setting failed');
  }
}

// Run the appropriate test based on current page
testCompleteAuthFlow();

// Additional utility functions
window.testBoraBondAuth = {
  testLoginFlow,
  testDashboardFlow,
  testUsersPageFlow,
  testTokenValidation,
  testSessionManagement,
  clearSession: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    console.log('✅ Session cleared');
  },
  checkSession: () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    console.log('Current session:', { token: token ? 'Present' : 'None', user: user ? 'Present' : 'None' });
    return { token, user };
  }
};

console.log('\n🔧 Utility functions available:');
console.log('  window.testBoraBondAuth.testLoginFlow()');
console.log('  window.testBoraBondAuth.testDashboardFlow()');
console.log('  window.testBoraBondAuth.testUsersPageFlow()');
console.log('  window.testBoraBondAuth.testTokenValidation(token)');
console.log('  window.testBoraBondAuth.testSessionManagement()');
console.log('  window.testBoraBondAuth.clearSession()');
console.log('  window.testBoraBondAuth.checkSession()');
