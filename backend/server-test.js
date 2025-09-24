require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

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
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    rpc_url: process.env.RPC_URL ? 'configured' : 'not set'
  });
});

// Test API endpoints with mock data
app.get('/api/blocks/latest', (req, res) => {
  const mockBlocks = [
    {
      number: 18500000,
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: new Date(),
      gasUsed: '30000000',
      transactionCount: 150,
      miner: '0x742d35Cc6634C0532925a3b8D000000000000000'
    },
    {
      number: 18499999,
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: new Date(Date.now() - 12000),
      gasUsed: '29500000',
      transactionCount: 142,
      miner: '0x742d35Cc6634C0532925a3b8D111111111111111'
    }
  ];

  res.json({
    success: true,
    data: mockBlocks
  });
});

app.get('/api/transactions/latest', (req, res) => {
  const mockTransactions = [
    {
      hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      blockNumber: 18500000,
      from: '0x742d35Cc6634C0532925a3b8D000000000000000',
      to: '0x742d35Cc6634C0532925a3b8D111111111111111',
      value: '1000000000000000000',
      gasPrice: '20000000000',
      gasUsed: '21000',
      status: 'success',
      timestamp: new Date()
    },
    {
      hash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      blockNumber: 18499999,
      from: '0x742d35Cc6634C0532925a3b8D222222222222222',
      to: '0x742d35Cc6634C0532925a3b8D333333333333333',
      value: '500000000000000000',
      gasPrice: '25000000000',
      gasUsed: '21000',
      status: 'success',
      timestamp: new Date(Date.now() - 12000)
    }
  ];

  res.json({
    success: true,
    data: mockTransactions
  });
});

app.get('/api/blocks/stats/network', (req, res) => {
  res.json({
    success: true,
    data: {
      latestBlock: 18500000,
      averageBlockTime: 12,
      dailyTransactions: 1200000,
      totalBlocks: 18500000,
      totalTransactions: 2000000000
    }
  });
});

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;