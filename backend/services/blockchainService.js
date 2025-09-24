const { Web3 } = require('web3');
const Block = require('../models/Block');
const Transaction = require('../models/Transaction');

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.RPC_URL);
    this.isProcessing = false;
  }

  // Get latest block number from blockchain
  async getLatestBlockNumber() {
    try {
      return await this.web3.eth.getBlockNumber();
    } catch (error) {
      console.error('Error getting latest block number:', error);
      throw error;
    }
  }

  // Process a single block
  async processBlock(blockNumber) {
    try {
      console.log(`Processing block ${blockNumber}...`);

      // Check if block already exists
      const existingBlock = await Block.findOne({ number: blockNumber });
      if (existingBlock) {
        console.log(`Block ${blockNumber} already exists`);
        return existingBlock;
      }

      // Fetch block with transactions
      const blockData = await this.web3.eth.getBlock(blockNumber, true);
      if (!blockData) {
        console.log(`Block ${blockNumber} not found`);
        return null;
      }

      // Create block document
      const block = new Block({
        number: Number(blockData.number),
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        gasUsed: blockData.gasUsed.toString(),
        gasLimit: blockData.gasLimit.toString(),
        baseFeePerGas: blockData.baseFeePerGas?.toString(),
        difficulty: blockData.difficulty?.toString(),
        totalDifficulty: blockData.totalDifficulty?.toString(),
        size: Number(blockData.size),
        transactionCount: blockData.transactions.length,
        miner: blockData.miner,
        extraData: blockData.extraData,
        nonce: blockData.nonce
      });

      // Process transactions
      const transactionIds = [];
      for (const txData of blockData.transactions) {
        try {
          const transaction = await this.processTransaction(txData, blockData);
          if (transaction) {
            transactionIds.push(transaction._id);
          }
        } catch (error) {
          console.error(`Error processing transaction ${txData.hash}:`, error);
        }
      }

      block.transactions = transactionIds;
      await block.save();

      console.log(`Block ${blockNumber} processed successfully`);

      // Emit to WebSocket if available
      if (global.websocketService) {
        global.websocketService.emitNewBlock(block);
      }

      return block;
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
      throw error;
    }
  }

  // Process a single transaction
  async processTransaction(txData, blockData) {
    try {
      // Get transaction receipt for status and gas used
      const receipt = await this.web3.eth.getTransactionReceipt(txData.hash);

      const transaction = new Transaction({
        hash: txData.hash,
        blockNumber: Number(txData.blockNumber),
        blockHash: txData.blockHash,
        transactionIndex: Number(txData.transactionIndex),
        from: txData.from,
        to: txData.to,
        value: txData.value.toString(),
        gasPrice: txData.gasPrice.toString(),
        gasUsed: receipt ? receipt.gasUsed.toString() : null,
        gasLimit: txData.gas.toString(),
        nonce: Number(txData.nonce),
        input: txData.input,
        status: receipt ? (receipt.status ? 'success' : 'failed') : 'pending',
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        contractAddress: receipt?.contractAddress || null
      });

      // Parse token transfers from logs
      if (receipt && receipt.logs) {
        transaction.tokenTransfers = await this.parseTokenTransfers(receipt.logs);
      }

      await transaction.save();

      // Emit to WebSocket if available
      if (global.websocketService) {
        global.websocketService.emitNewTransaction(transaction);
      }

      return transaction;
    } catch (error) {
      console.error(`Error processing transaction ${txData.hash}:`, error);
      return null;
    }
  }

  // Parse ERC-20 token transfers from transaction logs
  async parseTokenTransfers(logs) {
    const transfers = [];

    // ERC-20 Transfer event signature
    const transferSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    for (const log of logs) {
      if (log.topics[0] === transferSignature && log.topics.length >= 3) {
        try {
          const from = '0x' + log.topics[1].slice(26);
          const to = '0x' + log.topics[2].slice(26);
          const value = this.web3.utils.hexToNumberString(log.data);

          transfers.push({
            token: log.address,
            from,
            to,
            value,
            tokenName: '',
            tokenSymbol: '',
            tokenDecimals: 18
          });
        } catch (error) {
          console.error('Error parsing token transfer:', error);
        }
      }
    }

    return transfers;
  }

  // Sync blocks from a starting point
  async syncBlocks(startBlock = null) {
    if (this.isProcessing) {
      console.log('Block processing already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      const latestBlockNumber = await this.getLatestBlockNumber();

      let currentBlock = startBlock;
      if (!currentBlock) {
        const lastBlock = await Block.findOne().sort({ number: -1 });
        currentBlock = lastBlock ? Number(lastBlock.number) + 1 : Number(latestBlockNumber) - 100;
      }

      console.log(`Syncing blocks from ${currentBlock} to ${latestBlockNumber}`);

      // Process blocks in batches
      const batchSize = 5;
      for (let i = currentBlock; i <= latestBlockNumber; i += batchSize) {
        const promises = [];
        for (let j = i; j < Math.min(i + batchSize, Number(latestBlockNumber) + 1); j++) {
          promises.push(this.processBlock(j));
        }

        await Promise.all(promises);
        console.log(`Processed blocks ${i} to ${Math.min(i + batchSize - 1, latestBlockNumber)}`);
      }

      console.log('Block sync completed');
    } catch (error) {
      console.error('Error syncing blocks:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Start continuous monitoring
  startRealTimeMonitoring() {
    console.log('Starting real-time block monitoring...');

    setInterval(async () => {
      try {
        if (!this.isProcessing) {
          const latestBlockNumber = await this.getLatestBlockNumber();
          const lastProcessedBlock = await Block.findOne().sort({ number: -1 });

          if (!lastProcessedBlock || Number(latestBlockNumber) > lastProcessedBlock.number) {
            const startFrom = lastProcessedBlock ? lastProcessedBlock.number + 1 : Number(latestBlockNumber);
            await this.syncBlocks(startFrom);
          }
        }
      } catch (error) {
        console.error('Error in real-time monitoring:', error);
      }
    }, 15000); // Check every 15 seconds
  }
}

module.exports = BlockchainService;