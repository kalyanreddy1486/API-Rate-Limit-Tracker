// API Rate Limit Tracker - Content Script
// Injected into web pages to allow tracking from any website

// Create a global API tracker object that websites can use
window.apiRateLimitTracker = {
  // Track usage for a specific API
  async trackUsage(apiId, count = 1) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'trackUsage', apiId, count },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  },
  
  // Get authentication token (for custom implementations)
  async getToken() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'getToken' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.success) {
            resolve(response.token);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  },
  
  // Check if extension is available
  isAvailable() {
    return true;
  }
};

// Listen for messages from the page
window.addEventListener('message', async (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) return;
  
  if (event.data.type === 'API_RATE_LIMIT_TRACK') {
    try {
      const result = await window.apiRateLimitTracker.trackUsage(
        event.data.apiId,
        event.data.count
      );
      
      window.postMessage({
        type: 'API_RATE_LIMIT_TRACK_RESULT',
        success: true,
        data: result,
        requestId: event.data.requestId
      }, '*');
    } catch (error) {
      window.postMessage({
        type: 'API_RATE_LIMIT_TRACK_RESULT',
        success: false,
        error: error.message,
        requestId: event.data.requestId
      }, '*');
    }
  }
});

console.log('API Rate Limit Tracker: Content script loaded');
