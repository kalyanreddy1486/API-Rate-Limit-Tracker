## ✨ What is API Rate Limit Tracker?

**API Rate Limit Tracker** is a full-stack dashboard with a Chrome extension that helps developers monitor their API usage in real-time. It prevents service interruptions and overage fees by providing visual progress bars, automatic alerts, and seamless tracking across all your projects.

### 🎯 Why Use This?

- 📊 **Visual Dashboard** - See all your API usage at a glance with color-coded progress bars
- 🔔 **Smart Alerts** - Get notified at 70% (warning) and 90% (critical) usage
- 🔌 **Chrome Extension** - Track usage with one click from any webpage
- 🔐 **Secure** - Your API keys are encrypted with AES-256
- 🚀 **Universal** - Works with any API (OpenAI, Gemini, Stripe, etc.)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/kalyanreddy1486/API-Rate-Limit-Tracker.git
cd API-Rate-Limit-Tracker

# Setup Backend
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL
npm install
npx prisma migrate dev

# Setup Frontend
cd ../client
npm install
```

### Running the Application

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend
cd client
npm run dev
```

Visit: **http://localhost:5177**

---

## 🔌 Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `extension` folder
5. Click the extension icon and configure your dashboard settings

---

## 📸 Screenshots

<p align="center">
  <i>Dashboard showing API usage with visual progress bars</i><br><br>
  <i>Chrome extension popup for quick tracking</i>
</p>

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Extension |
|----------|---------|----------|-----------|
| React 18 | Express 5 | PostgreSQL 14 | Manifest V3 |
| Vite | Prisma ORM | JWT Auth | Background Worker |
| Tailwind CSS | bcrypt | AES-256 Encryption | Content Script |

---

## 💡 Usage Example

### Track API Usage in Your Projects

```javascript
// Using the standalone tracker
const tracker = new APITracker({
  email: 'your@email.com',
  password: 'your-password',
  dashboardUrl: 'http://localhost:3000'
});

// After making an API call
await callOpenAI(prompt);
await tracker.trackUsage('your-api-id', 1);
```

### Via Chrome Extension

```javascript
// If extension is installed
if (window.apiRateLimitTracker?.isAvailable()) {
  await window.apiRateLimitTracker.trackUsage('api-id', 1);
}
```

---

## 📁 Project Structure

```
API-Rate-Limit-Tracker/
├── 📂 client/              # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Dashboard, Login, Signup
│   │   └── services/       # API services
│   └── package.json
├── 📂 server/              # Express backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Encryption, notifications
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── 📂 extension/           # Chrome extension
│   ├── manifest.json
│   ├── popup.html/js       # Extension popup
│   ├── background.js       # Service worker
│   └── icons/
└── 📂 test-project/        # Test utilities
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure login with 7-day token expiry
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **API Key Encryption** - AES-256-CBC encryption
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **CORS Protection** - Configured for secure cross-origin requests

---

## 🎯 Use Cases

### For Freelancers
Manage multiple client projects using the same API keys without exceeding limits.

### For Startups
Monitor API costs across your entire stack (Stripe, SendGrid, OpenAI, etc.).

### For Chrome Extension Developers
Track how users consume your API-powered features.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using React, Express, and PostgreSQL
- Icons and UI inspiration from modern dashboard designs

---

<p align="center">
  <b>Made with ❤️ by Kalyan Reddy</b><br>
  <a href="https://github.com/kalyanreddy1486">GitHub</a>
</p>
