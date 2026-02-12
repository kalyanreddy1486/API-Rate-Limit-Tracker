/**
 * API Rate Limit Dashboard Tracker
 * 
 * Include this file in any project to automatically track API usage.
 * Works with: Chrome Extensions, Node.js apps, Browser apps
 * 
 * Usage:
 *   const tracker = new APITracker({
 *       email: 'your-email@example.com',
 *       password: 'your-password',
 *       dashboardUrl: 'http://localhost:3000'
 *   });
 *   
 *   // Track usage after any API call
 *   await tracker.trackUsage('your-api-id', 1);
 */

class APITracker {
    constructor(config) {
        this.email = config.email;
        this.password = config.password;
        this.dashboardUrl = config.dashboardUrl || 'http://localhost:3000';
        this.token = null;
        this.tokenExpiry = null;
        
        // Try to load saved token
        this.loadToken();
    }
    
    // Load token from storage (works in browser and Chrome extension)
    loadToken() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                // Chrome extension storage
                chrome.storage.local.get(['dashboard_token', 'token_expiry'], (result) => {
                    if (result.dashboard_token && result.token_expiry > Date.now()) {
                        this.token = result.dashboard_token;
                        this.tokenExpiry = result.token_expiry;
                    }
                });
            } else if (typeof localStorage !== 'undefined') {
                // Browser localStorage
                const saved = localStorage.getItem('dashboard_token');
                const expiry = localStorage.getItem('token_expiry');
                if (saved && expiry && parseInt(expiry) > Date.now()) {
                    this.token = saved;
                    this.tokenExpiry = parseInt(expiry);
                }
            }
        } catch (e) {
            console.log('No saved token found');
        }
    }
    
    // Save token to storage
    saveToken(token, expiresIn = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        this.token = token;
        this.tokenExpiry = Date.now() + expiresIn;
        
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({
                    dashboard_token: token,
                    token_expiry: this.tokenExpiry
                });
            } else if (typeof localStorage !== 'undefined') {
                localStorage.setItem('dashboard_token', token);
                localStorage.setItem('token_expiry', this.tokenExpiry.toString());
            }
        } catch (e) {
            console.log('Could not save token');
        }
    }
    
    // Login to get new token
    async login() {
        try {
            const response = await fetch(`${this.dashboardUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.data.token) {
                this.saveToken(data.data.token);
                console.log('✓ Logged into API Dashboard');
                return true;
            } else {
                throw new Error(data.error?.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Dashboard login failed:', error.message);
            return false;
        }
    }
    
    // Get valid token (login if needed)
    async getToken() {
        // Check if current token is still valid
        if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
            return this.token;
        }
        
        // Need to login
        const loggedIn = await this.login();
        if (loggedIn) {
            return this.token;
        }
        throw new Error('Could not get valid token');
    }
    
    // Track API usage
    async trackUsage(apiId, count = 1) {
        try {
            const token = await this.getToken();
            
            const response = await fetch(`${this.dashboardUrl}/api/usage/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiId: apiId,
                    usageCount: count
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`✓ Tracked ${count} API call(s) to dashboard`);
                return true;
            } else {
                throw new Error(data.error?.message || 'Tracking failed');
            }
        } catch (error) {
            console.error('❌ Failed to track API usage:', error.message);
            return false;
        }
    }
    
    // Quick track method (one-liner for simple usage)
    static async quickTrack(config, apiId, count = 1) {
        const tracker = new APITracker(config);
        return await tracker.trackUsage(apiId, count);
    }
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APITracker;
}

// Browser global
if (typeof window !== 'undefined') {
    window.APITracker = APITracker;
}
