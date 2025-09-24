const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, index: true },
  hash: { type: String, required: true, unique: true },
  parentHash: { type: String, required: true },
  timestamp: { type: Date, required: true },
  gasUsed: { type: String, required: true },
  gasLimit: { type: String, required: true },
  baseFeePerGas: { type: String },
  difficulty: { type: String },
  totalDifficulty: { type: String },
  size: { type: Number },
  transactionCount: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  miner: { type: String, required: true },
  reward: { type: String },
  extraData: { type: String },
  nonce: { type: String }
}, {
  timestamps: true
});

// Indexes for performance
blockSchema.index({ number: -1 });
blockSchema.index({ timestamp: -1 });
blockSchema.index({ hash: 1 });
blockSchema.index({ miner: 1 });

module.exports = mongoose.model('Block', blockSchema);