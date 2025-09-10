#!/usr/bin/env node

/**
 * Test script to verify the frontend API methods work correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Frontend URL
const API_BASE_URL = 'http://localhost:9000'; // Backend API URL

// Test data
const testData = {
  customer_guid: 'db41e6ccc5e5584ed07bebcf13342bac',
  user_id: 'test-frontend-123'
};

async function testInitiateTrade() {
  console.log('🧪 Testing Initiate Trade API');
  console.log('==============================');
  
  const tradeData = {
    customer_guid: testData.customer_guid,
    amount: 100,
    symbol: 'USDC_SOL-USD',
    side: 'buy',
    asset: 'USDC',
    product_type: 'trading',
    user_id: testData.user_id
  };
  
  console.log('Request payload:', JSON.stringify(tradeData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cybrid/trade`, tradeData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Initiate Trade API successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Initiate Trade API failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

async function testFinalizeTrade() {
  console.log('\n🧪 Testing Finalize Trade API');
  console.log('===============================');
  
  const finalizeData = {
    customer_guid: testData.customer_guid,
    user_id: testData.user_id
  };
  
  console.log('Request payload:', JSON.stringify(finalizeData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cybrid/trade/finalize`, finalizeData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log('✅ Finalize Trade API successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Finalize Trade API failed:');
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
  console.log('🚀 Testing Cybrid Frontend API Integration');
  console.log('==========================================\n');
  
  try {
    // Test Initiate Trade
    const initiateResult = await testInitiateTrade();
    
    // Test Finalize Trade
    const finalizeResult = await testFinalizeTrade();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('=====================================');
    console.log('✅ Initiate Trade API working');
    console.log('✅ Finalize Trade API working');
    console.log('\n📊 Summary:');
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
  testInitiateTrade,
  testFinalizeTrade,
  runTests
};
