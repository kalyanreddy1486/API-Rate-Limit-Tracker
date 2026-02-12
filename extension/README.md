# API Rate Limit Tracker - Chrome Extension

A Chrome extension to monitor and track API usage across all your projects.

## Features

- 🔐 **Secure Authentication** - Login once, track forever
- 📊 **Real-time Monitoring** - View API usage at a glance
- ⚡ **Quick Track** - Track usage with one click
- 🔔 **Smart Notifications** - Get alerts when approaching limits
- 🌐 **Universal Tracking** - Works with any API

## Installation

### Method 1: Developer Mode (Recommended for testing)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension icon will appear in your toolbar

### Method 2: From Chrome Web Store (Coming Soon)

## Setup

1. Click the extension icon in your toolbar
2. Click "Configure Dashboard" 
3. Enter your credentials:
   - **Dashboard URL**: `http://localhost:3000` (or your deployed URL)
   - **Email**: Your dashboard login email
   - **Password**: Your dashboard password
4. Click "Save Settings"

## Usage

### From the Popup

1. Click the extension icon to see all your APIs
2. Click on any API card to track +1 usage
3. Use the Quick Track dropdown for fast tracking
4. Click "Open Full Dashboard" for detailed view

### From Your Code

If you have the extension installed, websites can track usage automatically:

```javascript
// Check if extension is available
if (window.apiRateLimitTracker?.isAvailable()) {
  // Track usage after API call
  await window.apiRateLimitTracker.trackUsage('your-api-id', 1);
}
```

Or use the message API:

```javascript
window.postMessage({
  type: 'API_RATE_LIMIT_TRACK',
  apiId: 'your-api-id',
  count: 1,
  requestId: 'unique-id'
}, '*');

window.addEventListener('message', (event) => {
  if (event.data.type === 'API_RATE_LIMIT_TRACK_RESULT') {
    console.log('Tracked:', event.data);
  }
});
```

## Notifications

The extension automatically checks your API usage every 5 minutes and sends notifications:

- ⚠️ **Critical** (>90%): Urgent notification
- ⚡ **Warning** (>70%): Heads up notification

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup UI
- `popup.js` - Popup functionality
- `background.js` - Background service worker
- `content.js` - Content script for page integration
- `icons/` - Extension icons

## Troubleshooting

### Extension shows "Not logged in"
- Check your settings (email and password)
- Make sure your dashboard server is running
- Try refreshing the data

### Tracking fails
- Verify the API ID is correct
- Check that you're logged in
- Ensure the dashboard server is accessible

### Notifications not working
- Check Chrome notification permissions
- Make sure the extension has permission to show notifications

## Development

To modify the extension:

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT
