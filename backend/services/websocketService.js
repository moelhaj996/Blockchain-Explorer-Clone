const { Server } = require('socket.io');

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Subscribe to block updates
      socket.on('subscribe:blocks', () => {
        socket.join('blocks');
        console.log('Client subscribed to blocks:', socket.id);
      });

      // Subscribe to transaction updates
      socket.on('subscribe:transactions', () => {
        socket.join('transactions');
        console.log('Client subscribed to transactions:', socket.id);
      });

      // Subscribe to address updates
      socket.on('subscribe:address', (address) => {
        socket.join(`address:${address}`);
        console.log('Client subscribed to address:', address, socket.id);
      });

      // Unsubscribe from address updates
      socket.on('unsubscribe:address', (address) => {
        socket.leave(`address:${address}`);
        console.log('Client unsubscribed from address:', address, socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit new block to subscribers
  emitNewBlock(block) {
    this.io.to('blocks').emit('newBlock', {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      gasUsed: block.gasUsed,
      transactionCount: block.transactionCount,
      miner: block.miner
    });
  }

  // Emit new transaction to subscribers
  emitNewTransaction(transaction) {
    this.io.to('transactions').emit('newTransaction', {
      hash: transaction.hash,
      blockNumber: transaction.blockNumber,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gasPrice: transaction.gasPrice,
      gasUsed: transaction.gasUsed,
      status: transaction.status,
      timestamp: transaction.timestamp
    });

    // Also emit to address-specific rooms
    this.io.to(`address:${transaction.from}`).emit('addressTransaction', transaction);
    if (transaction.to) {
      this.io.to(`address:${transaction.to}`).emit('addressTransaction', transaction);
    }
  }

  // Emit network statistics
  emitNetworkStats(stats) {
    this.io.emit('networkStats', stats);
  }
}

module.exports = WebSocketService;