// API Rate Limit Tracker - Popup Script

const DEFAULT_CONFIG = {
  dashboardUrl: 'http://localhost:3000',
  email: '',
  password: '',
  token: null,
  tokenExpiry: null
};

let config = { ...DEFAULT_CONFIG };

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await fetchAPIs();
  
  // Attach event listeners to buttons
  document.getElementById('toggleSettingsBtn')?.addEventListener('click', toggleSettings);
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
  document.getElementById('quickTrackBtn')?.addEventListener('click', quickTrack);
  document.getElementById('refreshDataBtn')?.addEventListener('click', refreshData);
  document.getElementById('openDashboardBtn')?.addEventListener('click', openDashboard);
});

// Load configuration from storage
async function loadConfig() {
  const stored = await chrome.storage.local.get(['dashboardUrl', 'email', 'password', 'token', 'tokenExpiry']);
  config = { ...config, ...stored };
  
  // Populate form
  document.getElementById('dashboardUrl').value = config.dashboardUrl;
  document.getElementById('email').value = config.email;
  document.getElementById('password').value = config.password;
}

// Save configuration
async function saveSettings() {
  config.dashboardUrl = document.getElementById('dashboardUrl').value.trim();
  config.email = document.getElementById('email').value.trim();
  config.password = document.getElementById('password').value;
  
  await chrome.storage.local.set({
    dashboardUrl: config.dashboardUrl,
    email: config.email,
    password: config.password
  });
  
  // Clear token to force re-login
  config.token = null;
  config.tokenExpiry = null;
  await chrome.storage.local.remove(['token', 'tokenExpiry']);
  
  alert('Settings saved!');
  toggleSettings();
  await fetchAPIs();
}

// Toggle settings form
function toggleSettings() {
  const form = document.getElementById('settingsForm');
  form.classList.toggle('active');
}

// Login to dashboard
async function login() {
  try {
    const response = await fetch(`${config.dashboardUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.email,
        password: config.password
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.token) {
      config.token = data.data.token;
      config.tokenExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      
      await chrome.storage.local.set({
        token: config.token,
        tokenExpiry: config.tokenExpiry
      });
      
      return true;
    }
    
    throw new Error(data.error?.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    showError('Login failed. Check your settings.');
    return false;
  }
}

// Get valid token
async function getToken() {
  if (config.token && config.tokenExpiry && config.tokenExpiry > Date.now()) {
    return config.token;
  }
  
  if (!config.email || !config.password) {
    showError('Please configure your dashboard settings first.');
    return null;
  }
  
  const loggedIn = await login();
  return loggedIn ? config.token : null;
}

// Fetch APIs from dashboard
async function fetchAPIs() {
  const apiList = document.getElementById('apiList');
  const quickSelect = document.getElementById('quickApiSelect');
  
  const token = await getToken();
  if (!token) {
    apiList.innerHTML = '<div class="status error">Not logged in. Check settings.</div>';
    return;
  }
  
  try {
    const response = await fetch(`${config.dashboardUrl}/api/apis`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      renderAPIs(data.data);
      populateQuickSelect(data.data);
    } else {
      throw new Error(data.error?.message || 'Failed to fetch APIs');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    apiList.innerHTML = `<div class="status error">Error: ${error.message}</div>`;
  }
}

// Render API list
function renderAPIs(apis) {
  const apiList = document.getElementById('apiList');
  
  if (apis.length === 0) {
    apiList.innerHTML = '<div class="status">No APIs found. Add APIs in the dashboard.</div>';
    return;
  }
  
  apiList.innerHTML = apis.map(api => {
    const percentage = Math.min(api.usagePercentage || 0, 100);
    const status = percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'safe';
    
    return `
      <div class="api-item" onclick="trackUsage('${api.id}', 1)">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="api-name">${escapeHtml(api.serviceName)}</span>
          <span class="badge ${status}">${status}</span>
        </div>
        <div class="api-usage">
          ${api.currentUsage || 0} / ${api.rateLimit} ${api.rateLimitPeriod}
          (${percentage}%)
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${status}" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Populate quick select dropdown
function populateQuickSelect(apis) {
  const select = document.getElementById('quickApiSelect');
  select.innerHTML = '<option value="">Select API</option>' + 
    apis.map(api => `<option value="${api.id}">${escapeHtml(api.serviceName)}</option>`).join('');
}

// Track usage for an API
async function trackUsage(apiId, count) {
  const token = await getToken();
  if (!token) return;
  
  try {
    const response = await fetch(`${config.dashboardUrl}/api/usage/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ apiId, usageCount: count })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Refresh the list
      await fetchAPIs();
      
      // Show success notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'API Usage Tracked',
        message: `Usage updated: ${data.data.currentUsage} / ${data.data.rateLimit}`
      });
    } else {
      throw new Error(data.error?.message || 'Tracking failed');
    }
  } catch (error) {
    console.error('Track error:', error);
    alert('Failed to track usage: ' + error.message);
  }
}

// Quick track from dropdown
async function quickTrack() {
  const select = document.getElementById('quickApiSelect');
  const apiId = select.value;
  
  if (!apiId) {
    alert('Please select an API first');
    return;
  }
  
  await trackUsage(apiId, 1);
  select.value = '';
}

// Refresh data
async function refreshData() {
  const btn = document.querySelector('button[onclick="refreshData()"]');
  btn.textContent = 'Refreshing...';
  await fetchAPIs();
  btn.textContent = 'Refresh Data';
}

// Open full dashboard
function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:5177' });
}

// Show error message
function showError(message) {
  const apiList = document.getElementById('apiList');
  apiList.innerHTML = `<div class="status error">${message}</div>`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Functions are now attached via event listeners in DOMContentLoaded
