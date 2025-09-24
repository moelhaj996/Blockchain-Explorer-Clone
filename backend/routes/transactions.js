const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get latest transactions
router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const transactions = await Transaction.find()
      .sort({ blockNumber: -1, transactionIndex: -1 })
      .limit(limit)
      .select('hash blockNumber from to value gasPrice gasUsed status timestamp');

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction by hash
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    const transaction = await Transaction.findOne({ hash });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pending transactions
router.get('/pending/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('hash from to value gasPrice timestamp');

    res.json({
      success: true,
      data: pendingTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;