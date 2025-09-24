const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const Transaction = require('../models/Transaction');

// Get latest blocks
router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const blocks = await Block.find()
      .sort({ number: -1 })
      .limit(limit)
      .select('number hash timestamp gasUsed transactionCount miner');

    res.json({
      success: true,
      data: blocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get block by number or hash
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    let query;
    if (identifier.startsWith('0x')) {
      query = { hash: identifier };
    } else {
      query = { number: parseInt(identifier) };
    }

    const block = await Block.findOne(query).populate('transactions');

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found'
      });
    }

    res.json({
      success: true,
      data: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get block transactions
router.get('/:number/transactions', async (req, res) => {
  try {
    const blockNumber = parseInt(req.params.number);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ blockNumber })
      .sort({ transactionIndex: 1 })
      .skip(skip)
      .limit(limit)
      .select('hash from to value gasPrice gasUsed status');

    const total = await Transaction.countDocuments({ blockNumber });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get network statistics
router.get('/stats/network', async (req, res) => {
  try {
    // Get latest block for current stats
    const latestBlock = await Block.findOne().sort({ number: -1 });

    // Get blocks from last hour for average block time
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBlocks = await Block.find({
      timestamp: { $gte: oneHourAgo }
    }).sort({ number: -1 });

    // Calculate average block time
    let avgBlockTime = 15;
    if (recentBlocks.length > 1) {
      const timeDiff = recentBlocks[0].timestamp - recentBlocks[recentBlocks.length - 1].timestamp;
      avgBlockTime = Math.round(timeDiff / (recentBlocks.length - 1) / 1000);
    }

    // Get transaction count from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyTxCount = await Transaction.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    res.json({
      success: true,
      data: {
        latestBlock: latestBlock?.number || 0,
        averageBlockTime: avgBlockTime,
        dailyTransactions: dailyTxCount,
        totalBlocks: await Block.countDocuments(),
        totalTransactions: await Transaction.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;