const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const eventRoutes = require('./routes/events');
const testimonialRoutes = require('./routes/testimonials');
const statisticRoutes = require('./routes/statistics');
const teamRoutes = require('./routes/team');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// API routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/statistics', statisticRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/admin', adminRoutes);

// Apply stricter rate limit to login
app.use('/api/v1/admin/login', authLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI House API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Blida 1 AI House API',
    documentation: '/api/v1/health',
    endpoints: {
      events: '/api/v1/events',
      testimonials: '/api/v1/testimonials',
      statistics: '/api/v1/statistics',
      team: '/api/v1/team',
      contact: '/api/v1/contact',
      admin: '/api/v1/admin'
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
