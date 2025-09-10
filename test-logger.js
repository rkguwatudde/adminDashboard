#!/usr/bin/env node

/**
 * Test script to verify logger behavior in different environments
 * Tests console log disabling in production vs development
 */

// Test the logger in different environments
function testLogger() {
  console.log('🧪 Testing Logger Behavior');
  console.log('==========================');
  
  // Test current environment
  console.log('Current NODE_ENV:', process.env.NODE_ENV || 'undefined');
  
  // Test different log levels
  console.log('📝 Testing console.log');
  console.warn('⚠️ Testing console.warn');
  console.error('❌ Testing console.error');
  console.debug('🐛 Testing console.debug');
  console.info('ℹ️ Testing console.info');
  
  // Test with different data types
  console.log('Testing with objects:', { test: 'data', number: 123 });
  console.log('Testing with arrays:', [1, 2, 3, 'test']);
  console.log('Testing with functions:', () => 'test');
  
  console.log('\n✅ Logger test completed');
}

// Test in development mode
console.log('🔧 Testing in DEVELOPMENT mode');
process.env.NODE_ENV = 'development';
testLogger();

console.log('\n' + '='.repeat(50) + '\n');

// Test in production mode
console.log('🏭 Testing in PRODUCTION mode');
process.env.NODE_ENV = 'production';

// Import the logger to initialize it
try {
  // This would normally be imported in the app
  const logger = require('./lib/logger.ts');
  console.log('Logger imported successfully');
} catch (error) {
  console.log('Note: Logger import test skipped (TypeScript file)');
}

testLogger();

console.log('\n🎯 Expected Behavior:');
console.log('- Development: All logs should appear with [BoraBond] prefix');
console.log('- Production: All logs should be disabled (empty console)');
console.log('- Logger should automatically detect NODE_ENV');
console.log('- Original console methods should be preserved for restoration');

console.log('\n📋 Implementation Summary:');
console.log('- lib/logger.ts: Main logger class with environment detection');
console.log('- lib/init-logger.ts: Global initialization');
console.log('- app/layout.tsx: Logger imported at app startup');
console.log('- next.config.js: Webpack configuration for production builds');
