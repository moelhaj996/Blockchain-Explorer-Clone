const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const Transaction = require('../models/Transaction');
const { Web3 } = require('web3');

const web3 = new Web3(process.env.RPC_URL);

// Universal search endpoint
router.get('/', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 3 characters long'
      });
    }

    const results = {
      blocks: [],
      transactions: [],
      addresses: []
    };

    // Search for blocks
    if (/^\d+$/.test(query)) {
      // Block number search
      const blockNumber = parseInt(query);
      const block = await Block.findOne({ number: blockNumber })
        .select('number hash timestamp transactionCount');

      if (block) {
        results.blocks.push({
          type: 'block',
          number: block.number,
          hash: block.hash,
          timestamp: block.timestamp,
          transactionCount: block.transactionCount
        });
      }
    }

    if (query.startsWith('0x')) {
      if (query.length === 66) {
        // Could be block hash or transaction hash

        // Search blocks by hash
        const block = await Block.findOne({ hash: query })
          .select('number hash timestamp transactionCount');

        if (block) {
          results.blocks.push({
            type: 'block',
            number: block.number,
            hash: block.hash,
            timestamp: block.timestamp,
            transactionCount: block.transactionCount
          });
        }

        // Search transactions by hash
        const transaction = await Transaction.findOne({ hash: query })
          .select('hash blockNumber from to value status timestamp');

        if (transaction) {
          results.transactions.push({
            type: 'transaction',
            hash: transaction.hash,
            blockNumber: transaction.blockNumber,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value,
            status: transaction.status,
            timestamp: transaction.timestamp
          });
        }
      } else if (query.length === 42) {
        // Ethereum address
        if (web3.utils.isAddress(query)) {
          try {
            const balance = await web3.eth.getBalance(query);
            const txCount = await Transaction.countDocuments({
              $or: [{ from: query }, { to: query }]
            });

            results.addresses.push({
              type: 'address',
              address: query,
              balance: web3.utils.fromWei(balance, 'ether'),
              transactionCount: txCount
            });
          } catch (error) {
            console.error('Error fetching address data:', error);
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        query,
        results,
        totalResults: results.blocks.length + results.transactions.length + results.addresses.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = [];

    // Suggest recent block numbers
    if (/^\d+$/.test(query)) {
      const blockNumber = parseInt(query);
      const blocks = await Block.find({
        number: { $gte: blockNumber }
      })
      .sort({ number: 1 })
      .limit(5)
      .select('number hash timestamp');

      blocks.forEach(block => {
        suggestions.push({
          type: 'block',
          display: `Block #${block.number}`,
          value: block.number.toString(),
          subtitle: `Hash: ${block.hash.substring(0, 16)}...`
        });
      });
    }

    // Suggest addresses that start with the query
    if (query.startsWith('0x') && query.length <= 42) {
      const addresses = await Transaction.aggregate([
        {
          $match: {
            $or: [
              { from: { $regex: `^${query}`, $options: 'i' } },
              { to: { $regex: `^${query}`, $options: 'i' } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            fromAddresses: { $addToSet: '$from' },
            toAddresses: { $addToSet: '$to' }
          }
        }
      ]);

      if (addresses.length > 0) {
        const allAddresses = [...addresses[0].fromAddresses, ...addresses[0].toAddresses];
        const matchingAddresses = allAddresses
          .filter(addr => addr && addr.toLowerCase().startsWith(query.toLowerCase()))
          .slice(0, 3);

        matchingAddresses.forEach(address => {
          suggestions.push({
            type: 'address',
            display: address,
            value: address,
            subtitle: 'Ethereum Address'
          });
        });
      }
    }

    res.json({
      success: true,
      data: suggestions.slice(0, 10) // Limit to 10 suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;