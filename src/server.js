require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/database');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      await pool.end();
      console.log('Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
};

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log('=================================');
  console.log('🚀 Blida 1 AI House API Server');
  console.log('=================================');
  console.log(`📡 Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log('=================================');
  console.log('Available endpoints:');
  console.log(`  Health:    http://localhost:${PORT}/api/v1/health`);
  console.log(`  Events:    http://localhost:${PORT}/api/v1/events`);
  console.log(`  Team:      http://localhost:${PORT}/api/v1/team`);
  console.log(`  Stats:     http://localhost:${PORT}/api/v1/statistics`);
  console.log('=================================');
});

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
