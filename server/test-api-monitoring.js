/**
 * Test script to verify API Rate Limit monitoring
 * This simulates API calls to test if the dashboard tracks usage correctly
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  serviceName: 'Test API Service',
  apiKey: 'test-api-key-12345',
  rateLimit: 10, // Small limit for easy testing
  rateLimitPeriod: 'day',
};

let authToken = null;
let apiId = null;

async function login() {
  console.log('1. Logging in...');
  try {
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      email: TEST_CONFIG.email,
      password: TEST_CONFIG.password,
    });
    authToken = response.data.data.token;
    console.log('✓ Logged in successfully');
  } catch (error) {
    // Try login if signup fails (user already exists)
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_CONFIG.email,
      password: TEST_CONFIG.password,
    });
    authToken = response.data.data.token;
    console.log('✓ Logged in successfully (existing user)');
  }
}

async function createAPI() {
  console.log('\n2. Creating API entry...');
  const response = await axios.post(
    `${API_URL}/api/apis`,
    {
      serviceName: TEST_CONFIG.serviceName,
      apiKey: TEST_CONFIG.apiKey,
      rateLimit: TEST_CONFIG.rateLimit,
      rateLimitPeriod: TEST_CONFIG.rateLimitPeriod,
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  apiId = response.data.data.id;
  console.log(`✓ API created with ID: ${apiId}`);
  console.log(`  Rate Limit: ${TEST_CONFIG.rateLimit} per ${TEST_CONFIG.rateLimitPeriod}`);
}

async function getAPIStatus() {
  console.log('\n3. Checking current API status...');
  const response = await axios.get(`${API_URL}/api/apis`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  
  const api = response.data.data.find(a => a.id === apiId);
  if (api) {
    console.log(`✓ Current Usage: ${api.currentUsage} / ${api.rateLimit}`);
    console.log(`  Percentage: ${api.usagePercentage}%`);
    console.log(`  Status: ${api.status}`);
  }
  return api;
}

async function trackUsage(count = 1) {
  console.log(`\n4. Simulating ${count} API call(s)...`);
  const response = await axios.post(
    `${API_URL}/api/usage/track`,
    { apiId, count },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  console.log(`✓ Usage tracked successfully`);
  console.log(`  New Usage: ${response.data.data.currentUsage} / ${response.data.data.rateLimit}`);
  console.log(`  Percentage: ${response.data.data.percentage}%`);
}

async function runTest() {
  console.log('========================================');
  console.log('API Rate Limit Dashboard - Test Script');
  console.log('========================================\n');

  try {
    // Step 1: Login
    await login();

    // Step 2: Create API entry
    await createAPI();

    // Step 3: Check initial status
    await getAPIStatus();

    // Step 4: Simulate multiple API calls
    console.log('\n--- Simulating API Calls ---');
    
    // Make 3 calls
    await trackUsage(1);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await trackUsage(1);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await trackUsage(1);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Check status after calls
    console.log('\n--- Status After 3 Calls ---');
    let api = await getAPIStatus();

    // Step 6: Make more calls to reach warning level (70%)
    console.log('\n--- Making More Calls to Reach Warning Level ---');
    const callsNeeded = Math.ceil((api.rateLimit * 0.7 - api.currentUsage));
    
    if (callsNeeded > 0) {
      console.log(`Making ${callsNeeded} more calls to reach 70%...`);
      for (let i = 0; i < callsNeeded; i++) {
        await trackUsage(1);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Step 7: Check status at warning level
    console.log('\n--- Status at Warning Level ---');
    api = await getAPIStatus();

    // Step 8: Make calls to reach critical level (90%)
    if (api.usagePercentage < 90) {
      console.log('\n--- Making More Calls to Reach Critical Level ---');
      const criticalCallsNeeded = Math.ceil((api.rateLimit * 0.9 - api.currentUsage));
      
      if (criticalCallsNeeded > 0) {
        console.log(`Making ${criticalCallsNeeded} more calls to reach 90%...`);
        for (let i = 0; i < criticalCallsNeeded; i++) {
          await trackUsage(1);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    // Step 9: Final status
    console.log('\n--- Final Status ---');
    api = await getAPIStatus();

    // Step 10: Try to exceed limit
    console.log('\n--- Testing Rate Limit Enforcement ---');
    try {
      await trackUsage(5);
    } catch (error) {
      console.log(`✓ Rate limit enforced: ${error.response?.data?.error?.message || error.message}`);
    }

    console.log('\n========================================');
    console.log('Test Completed Successfully!');
    console.log('========================================');
    console.log('\nCheck your dashboard at http://localhost:5177');
    console.log('You should see the Test API Service with updated usage.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.error?.message || error.message);
    console.error('Make sure both backend and frontend servers are running.');
    process.exit(1);
  }
}

// Run the test
runTest();
