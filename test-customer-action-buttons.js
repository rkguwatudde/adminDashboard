#!/usr/bin/env node

/**
 * Test script to verify customer action buttons functionality
 * Tests both initiate and finalize trade actions from customer rows
 * 
 * Note: The Initiate Trade dialog has been cleaned up to only handle trade initiation.
 * Finalize Trade functionality is now only available via action buttons in customer rows.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:9000'; // Backend API URL

// Test data
const testCustomer = {
  user_id: 'test-customer-actions-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com'
};

async function testCustomerIdFetch() {
  console.log('🧪 Testing Customer ID Fetch');
  console.log('============================');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cybrid/customer-id/${testCustomer.user_id}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Customer ID fetch successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Customer ID fetch failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testInitiateTradeFromRow() {
  console.log('\n🧪 Testing Initiate Trade from Customer Row');
  console.log('============================================');
  
  // First get customer ID
  const customerIdResponse = await testCustomerIdFetch();
  const customer_guid = customerIdResponse.data?.cybrid_customer_id;
  
  if (!customer_guid) {
    throw new Error('No customer_guid found in response');
  }
  
  const tradeData = {
    customer_guid: customer_guid,
    amount: 50,
    symbol: 'USDC_SOL-USD',
    side: 'buy',
    asset: 'USDC',
    product_type: 'trading',
    user_id: testCustomer.user_id
  };
  
  console.log('Trade payload:', JSON.stringify(tradeData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cybrid/trade`, tradeData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Initiate Trade from row successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Initiate Trade from row failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testFinalizeTradeFromRow() {
  console.log('\n🧪 Testing Finalize Trade from Customer Row');
  console.log('============================================');
  
  // First get customer ID
  const customerIdResponse = await testCustomerIdFetch();
  const customer_guid = customerIdResponse.data?.cybrid_customer_id;
  
  if (!customer_guid) {
    throw new Error('No customer_guid found in response');
  }
  
  const finalizeData = {
    customer_guid: customer_guid,
    user_id: testCustomer.user_id
  };
  
  console.log('Finalize payload:', JSON.stringify(finalizeData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cybrid/trade/finalize`, finalizeData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log('✅ Finalize Trade from row successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Finalize Trade from row failed:');
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
  console.log('🚀 Testing Customer Action Buttons Functionality');
  console.log('================================================\n');
  
  try {
    // Test Customer ID Fetch
    const customerIdResult = await testCustomerIdFetch();
    
    // Test Initiate Trade from Row
    const initiateResult = await testInitiateTradeFromRow();
    
    // Test Finalize Trade from Row
    const finalizeResult = await testFinalizeTradeFromRow();
    
    console.log('\n🎉 All customer action button tests completed successfully!');
    console.log('===========================================================');
    console.log('✅ Customer ID fetch working');
    console.log('✅ Initiate Trade from row working');
    console.log('✅ Finalize Trade from row working');
    console.log('\n📊 Summary:');
    console.log('- Customer GUID:', customerIdResult.data?.cybrid_customer_id || 'N/A');
    console.log('- Trade ID:', initiateResult.data?.trade?.trade_id || 'N/A');
    console.log('- Wallet Address:', finalizeResult.data?.payment?.walletAddress || 'N/A');
    console.log('- External Wallet ID:', finalizeResult.data?.external_wallet?.wallet_id || 'N/A');
    console.log('- Crypto Transfer ID:', finalizeResult.data?.crypto_transfer?.transfer_id || 'N/A');
    
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
  testCustomerIdFetch,
  testInitiateTradeFromRow,
  testFinalizeTradeFromRow,
  runTests
};
