const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { Web3 } = require('web3');

const web3 = new Web3(process.env.RPC_URL);

// Get address information
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    // Get current balance from blockchain
    const balanceWei = await web3.eth.getBalance(address);
    const balance = web3.utils.fromWei(balanceWei, 'ether');

    // Get transaction statistics
    const sentTxCount = await Transaction.countDocuments({ from: address });
    const receivedTxCount = await Transaction.countDocuments({ to: address });
    const totalTxCount = sentTxCount + receivedTxCount;

    // Get first and last transaction
    const firstTx = await Transaction.findOne({
      $or: [{ from: address }, { to: address }]
    }).sort({ blockNumber: 1, transactionIndex: 1 });

    const lastTx = await Transaction.findOne({
      $or: [{ from: address }, { to: address }]
    }).sort({ blockNumber: -1, transactionIndex: -1 });

    res.json({
      success: true,
      data: {
        address,
        balance,
        transactionCount: totalTxCount,
        sentTransactions: sentTxCount,
        receivedTransactions: receivedTxCount,
        firstSeen: firstTx?.timestamp || null,
        lastSeen: lastTx?.timestamp || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get address transactions
router.get('/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Validate address
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }

    const transactions = await Transaction.find({
      $or: [{ from: address }, { to: address }]
    })
    .sort({ blockNumber: -1, transactionIndex: -1 })
    .skip(skip)
    .limit(limit)
    .select('hash blockNumber from to value gasPrice gasUsed status timestamp');

    const total = await Transaction.countDocuments({
      $or: [{ from: address }, { to: address }]
    });

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

// Get address token transfers
router.get('/:address/tokens', async (req, res) => {
  try {
    const { address } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Find transactions with token transfers involving this address
    const transactions = await Transaction.find({
      $or: [
        { 'tokenTransfers.from': address },
        { 'tokenTransfers.to': address }
      ]
    })
    .sort({ blockNumber: -1 })
    .skip(skip)
    .limit(limit)
    .select('hash blockNumber timestamp tokenTransfers');

    // Extract relevant token transfers
    const tokenTransfers = [];
    transactions.forEach(tx => {
      tx.tokenTransfers.forEach(transfer => {
        if (transfer.from === address || transfer.to === address) {
          tokenTransfers.push({
            transactionHash: tx.hash,
            blockNumber: tx.blockNumber,
            timestamp: tx.timestamp,
            ...transfer.toObject()
          });
        }
      });
    });

    res.json({
      success: true,
      data: tokenTransfers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;