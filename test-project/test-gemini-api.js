/**
 * Simple test project to verify API Rate Limit Dashboard tracking
 * This makes actual calls to Google Gemini API and reports usage to your dashboard
 */

const axios = require('axios');

// CONFIGURATION - Update these values
const CONFIG = {
  // Your Google Gemini API Key
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  
  // Your Dashboard credentials
  DASHBOARD_EMAIL: 'your-email@example.com',
  DASHBOARD_PASSWORD: 'your-password',
  
  // Dashboard API URL
  DASHBOARD_URL: 'http://localhost:3000',
  
  // The API ID from your dashboard (get this after adding your Gemini API)
  DASHBOARD_API_ID: 'YOUR_API_ID_FROM_DASHBOARD',
};

let dashboardToken = null;

// Step 1: Login to Dashboard
async function loginToDashboard() {
  console.log('Logging into Dashboard...');
  try {
    const response = await axios.post(`${CONFIG.DASHBOARD_URL}/api/auth/login`, {
      email: CONFIG.DASHBOARD_EMAIL,
      password: CONFIG.DASHBOARD_PASSWORD,
    });
    dashboardToken = response.data.data.token;
    console.log('✓ Logged in successfully\n');
  } catch (error) {
    console.error('Login failed:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

// Step 2: Track usage in Dashboard
async function trackUsage(count = 1) {
  try {
    await axios.post(
      `${CONFIG.DASHBOARD_URL}/api/usage/track`,
      { apiId: CONFIG.DASHBOARD_API_ID, count },
      { headers: { Authorization: `Bearer ${dashboardToken}` } }
    );
    console.log(`✓ Tracked ${count} API call(s) in dashboard`);
  } catch (error) {
    console.error('Failed to track usage:', error.response?.data?.error?.message || error.message);
  }
}

// Step 3: Call Google Gemini API
async function callGeminiAPI(prompt) {
  console.log(`\nCalling Gemini API with prompt: "${prompt}"`);
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    // Extract the response text
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    console.log('✓ Gemini API Response received');
    console.log('Response:', text.substring(0, 100) + '...\n');
    
    // Track this API call in your dashboard
    await trackUsage(1);
    
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

// Main test function
async function runTest() {
  console.log('========================================');
  console.log('API Dashboard - Real API Usage Test');
  console.log('========================================\n');
  
  // Check configuration
  if (CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('❌ Please update CONFIG.GEMINI_API_KEY with your actual Gemini API key');
    process.exit(1);
  }
  if (CONFIG.DASHBOARD_API_ID === 'YOUR_API_ID_FROM_DASHBOARD') {
    console.error('❌ Please update CONFIG.DASHBOARD_API_ID with your API ID from the dashboard');
    console.log('   You can find this by clicking on your API in the dashboard');
    process.exit(1);
  }
  
  try {
    // Login to dashboard
    await loginToDashboard();
    
    // Make several API calls
    console.log('Making 5 API calls to test tracking...\n');
    
    await callGeminiAPI('What is 2+2?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await callGeminiAPI('Tell me a joke');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await callGeminiAPI('What is the capital of France?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await callGeminiAPI('Explain quantum computing in simple terms');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await callGeminiAPI('Write a haiku about coding');
    
    console.log('\n========================================');
    console.log('Test Complete!');
    console.log('========================================');
    console.log('\nCheck your dashboard at http://localhost:5177');
    console.log('You should see the usage count increased by 5!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
