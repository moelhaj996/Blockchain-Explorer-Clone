require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const BlockchainService = require('./services/blockchainService');
const WebSocketService = require('./services/websocketService');

// Import routes
const blockRoutes = require('./routes/blocks');
const transactionRoutes = require('./routes/transactions');
const addressRoutes = require('./routes/addresses');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/blocks', blockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain_explorer')
.then(() => {
  console.log('✅ Connected to MongoDB');

  // Initialize services
  const blockchainService = new BlockchainService();
  const websocketService = new WebSocketService(server);

  // Make services available globally
  global.blockchainService = blockchainService;
  global.websocketService = websocketService;

  // Start blockchain monitoring
  blockchainService.startRealTimeMonitoring();

  // Initial sync (sync last 10 blocks for development)
  setTimeout(async () => {
    try {
      const latestBlock = await blockchainService.getLatestBlockNumber();
      await blockchainService.syncBlocks(Math.max(0, Number(latestBlock) - 10));
    } catch (error) {
      console.error('Initial sync error:', error);
    }
  }, 5000);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/health`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

module.exports = app;