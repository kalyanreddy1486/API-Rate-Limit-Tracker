const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');
const usageRoutes = require('./routes/usage.routes');
const alertRoutes = require('./routes/alert.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'development' ? true : env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/alerts', alertRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
