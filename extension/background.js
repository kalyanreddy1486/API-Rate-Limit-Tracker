// API Rate Limit Tracker - Background Script
// Handles automatic tracking and notifications

chrome.runtime.onInstalled.addListener(() => {
  console.log('API Rate Limit Tracker installed');
  
  // Set up periodic refresh (every 5 minutes)
  chrome.alarms.create('refreshData', { periodInMinutes: 5 });
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshData') {
    checkAPILimits();
  }
});

// Check API limits and send notifications
async function checkAPILimits() {
  const config = await chrome.storage.local.get(['dashboardUrl', 'token', 'tokenExpiry']);
  
  if (!config.token || !config.tokenExpiry || config.tokenExpiry < Date.now()) {
    return; // Not logged in
  }
  
  try {
    const response = await fetch(`${config.dashboardUrl}/api/apis`, {
      headers: { 'Authorization': `Bearer ${config.token}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      data.data.forEach(api => {
        const percentage = api.usagePercentage || 0;
        
        // Send notification for critical APIs (>90%)
        if (percentage > 90) {
          chrome.notifications.create(`critical-${api.id}`, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '⚠️ API Rate Limit Critical',
            message: `${api.serviceName}: ${percentage}% used (${api.currentUsage}/${api.rateLimit})`,
            priority: 2
          });
        }
        // Send notification for warning APIs (>70%)
        else if (percentage > 70) {
          chrome.notifications.create(`warning-${api.id}`, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '⚡ API Rate Limit Warning',
            message: `${api.serviceName}: ${percentage}% used (${api.currentUsage}/${api.rateLimit})`,
            priority: 1
          });
        }
      });
    }
  } catch (error) {
    console.error('Background check error:', error);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackUsage') {
    trackUsage(request.apiId, request.count)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }
  
  if (request.action === 'getToken') {
    chrome.storage.local.get(['token', 'tokenExpiry'])
      .then(config => {
        if (config.token && config.tokenExpiry && config.tokenExpiry > Date.now()) {
          sendResponse({ success: true, token: config.token });
        } else {
          sendResponse({ success: false, error: 'No valid token' });
        }
      });
    return true;
  }
});

// Track usage helper
async function trackUsage(apiId, count) {
  const config = await chrome.storage.local.get(['dashboardUrl', 'token']);
  
  if (!config.token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${config.dashboardUrl}/api/usage/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`
    },
    body: JSON.stringify({ apiId, usageCount: count })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'Tracking failed');
  }
  
  return data.data;
}

// Context menu for quick tracking
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'trackApiUsage',
    title: 'Track API Usage',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'trackApiUsage') {
    chrome.action.openPopup();
  }
});
