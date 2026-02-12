# API Rate Limit Tracker - Setup Instructions

## Quick Start Guide

### Step 1: Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `extension` folder
5. The extension icon (🔐) will appear in your toolbar

### Step 2: Configure the Extension

1. Click the **extension icon** in Chrome toolbar
2. Click **"Configure Dashboard"**
3. Enter your details:
   ```
   Dashboard URL: http://localhost:3000
   Email: your-email@example.com
   Password: your-password
   ```
4. Click **"Save Settings"**

### Step 3: Add APIs to Track

1. Click **"Open Full Dashboard"** in the extension
2. Or go to http://localhost:5177 in your browser
3. Click **"+ Add API"**
4. Fill in the details:
   - **Service Name**: e.g., "OpenAI", "Google Gemini"
   - **API Key**: Your actual API key (encrypted)
   - **Rate Limit**: e.g., 1000 (requests per period)
   - **Period**: minute/hour/day/month
5. Click **"Add API"**

---

## 📝 How to Track API Usage in Your Projects

### Method 1: Using the Extension (Automatic)

If you have the extension installed, add this code to your project:

```javascript
// After making any API call, track it:
async function trackAPIUsage(apiId) {
  if (window.apiRateLimitTracker?.isAvailable()) {
    try {
      await window.apiRateLimitTracker.trackUsage(apiId, 1);
      console.log('✅ Usage tracked');
    } catch (error) {
      console.error('Failed to track:', error);
    }
  }
}

// Example usage with fetch:
async function callMyAPI() {
  const response = await fetch('https://api.example.com/data', {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  const data = await response.json();
  
  // Track this API call
  await trackAPIUsage('YOUR_API_ID_FROM_DASHBOARD');
  
  return data;
}
```

### Method 2: Using the Standalone Tracker Library

For Node.js or projects without the extension:

1. **Copy the tracker file** to your project:
   ```bash
   cp /path/to/api-tracker.js ./utils/api-tracker.js
   ```

2. **Use it in your code:**
   ```javascript
   const APITracker = require('./utils/api-tracker.js');
   
   // Initialize once
   const tracker = new APITracker({
     email: 'your@email.com',
     password: 'your-password',
     dashboardUrl: 'http://localhost:3000'
   });
   
   // After any API call
   async function makeAPICall() {
     // Your API call here
     const result = await callExternalAPI();
     
     // Track usage
     await tracker.trackUsage('YOUR_API_ID', 1);
     
     return result;
   }
   ```

### Method 3: Direct API Call (Any Language)

Make a POST request to your dashboard:

```javascript
fetch('http://localhost:3000/api/usage/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    apiId: 'YOUR_API_ID',
    usageCount: 1
  })
});
```

**Python example:**
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
}

data = {
    'apiId': 'YOUR_API_ID',
    'usageCount': 1
}

response = requests.post(
    'http://localhost:3000/api/usage/track',
    headers=headers,
    json=data
)
```

---

## 🎯 Complete Integration Example

### For a Chrome Extension Project:

```javascript
// background.js or content script

// Initialize tracker
const tracker = new APITracker({
  email: 'your@email.com',
  password: 'your-password'
});

// Intercept API calls
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.url.includes('api.openai.com')) {
      await tracker.trackUsage('YOUR_OPENAI_API_ID', 1);
    }
  },
  { urls: ['<all_urls>'] }
);
```

### For a React/Vue/Angular App:

```javascript
// api.js - Your API service file

class APIService {
  constructor() {
    this.tracker = new APITracker({
      email: 'your@email.com',
      password: 'your-password'
    });
    this.apiIds = {
      openai: 'YOUR_OPENAI_API_ID',
      gemini: 'YOUR_GEMINI_API_ID'
    };
  }
  
  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENAI_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    
    // Track usage
    await this.tracker.trackUsage(this.apiIds.openai, 1);
    
    return response.json();
  }
}

export default new APIService();
```

---

## 🔍 Finding Your API ID

1. Open the dashboard (http://localhost:5177)
2. Look at your API cards
3. Each card shows the **API ID** (e.g., `8e974909-4794-4887-9e8b-9d40e3661ec5`)
4. Copy this ID and use it in your tracking code

---

## ⚠️ Important Notes

1. **Dashboard must be running**: The extension connects to `http://localhost:3000`
2. **Get JWT token**: Login via the dashboard or extension first
3. **Token expires**: After 7 days, you'll need to login again
4. **CORS enabled**: For local development, CORS is configured to allow all origins

---

## 🐛 Troubleshooting

### "Not logged in" error
- Click "Configure Dashboard" in the extension
- Re-enter your credentials
- Click "Save Settings"

### "Failed to track" error
- Check that your API ID is correct
- Verify the dashboard server is running
- Check browser console for detailed errors

### Extension buttons not working
- Reload the extension in `chrome://extensions/`
- Check the popup console (right-click > Inspect)

---

## 📊 Monitoring Usage

Once set up, you can:
- See real-time usage in the extension popup
- View detailed stats in the dashboard
- Get notifications at 70% and 90% usage
- Track multiple APIs simultaneously

---

**Need help?** Check the main README.md or open an issue.
