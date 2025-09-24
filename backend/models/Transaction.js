const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, index: true },
  blockNumber: { type: Number, required: true, index: true },
  blockHash: { type: String, required: true },
  transactionIndex: { type: Number, required: true },
  from: { type: String, required: true, index: true },
  to: { type: String, index: true },
  value: { type: String, required: true },
  gasPrice: { type: String, required: true },
  gasUsed: { type: String },
  gasLimit: { type: String, required: true },
  nonce: { type: Number, required: true },
  input: { type: String },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  timestamp: { type: Date, required: true },

  // Contract creation
  contractAddress: { type: String },

  // Token transfers (ERC-20)
  tokenTransfers: [{
    token: { type: String },
    from: { type: String },
    to: { type: String },
    value: { type: String },
    tokenName: { type: String },
    tokenSymbol: { type: String },
    tokenDecimals: { type: Number }
  }],

  // Internal transactions
  internalTransactions: [{
    from: { type: String },
    to: { type: String },
    value: { type: String },
    type: { type: String }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
transactionSchema.index({ from: 1, blockNumber: -1 });
transactionSchema.index({ to: 1, blockNumber: -1 });
transactionSchema.index({ blockNumber: -1, transactionIndex: 1 });
transactionSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);