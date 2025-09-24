# Blockchain Explorer Clone

A comprehensive blockchain explorer built with React.js, Node.js, and MongoDB. This application replicates core functionality of Etherscan for tracking blocks, transactions, and addresses on the Ethereum network.

## 🚀 Features

### Core Features
- **Real-time Block Tracking** - Live updates of new blocks as they are mined
- **Transaction Explorer** - Detailed transaction information and status
- **Address Analytics** - Balance, transaction history, and token holdings
- **Universal Search** - Search blocks, transactions, and addresses
- **WebSocket Integration** - Real-time updates via WebSocket connections

### Advanced Features
- **Network Statistics** - Block time, gas price trends, network metrics
- **Token Transfers** - ERC-20 token transfer tracking
- **Mobile Responsive** - Optimized for all device sizes
- **API Services** - RESTful API for external integrations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Blockchain    │
│   (React.js)    │◄──►│ (Node.js/Express)│◄──►│   Node (RPC)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │    Database      │
                       │    (MongoDB)     │
                       └──────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: React.js + TypeScript, Tailwind CSS, Socket.io-client
- **Backend**: Node.js + Express.js, Socket.io for WebSocket
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Ethereum RPC via Alchemy/Infura
- **DevOps**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Ethereum RPC endpoint (Alchemy/Infura)

### Environment Setup
1. Clone the repository
2. Set up environment variables:
   - `RPC_URL`: Your Ethereum RPC endpoint
   - `MONGODB_URI`: MongoDB connection string
   - `PORT`: Backend port (default: 5000)

### Development Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Docker Setup
```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build
```

## 📁 Project Structure

```
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── docker-compose.yml   # Docker services
└── README.md
```

## 🔧 API Endpoints

### Blocks
- `GET /api/blocks/latest` - Get latest blocks
- `GET /api/blocks/:identifier` - Get block by number or hash
- `GET /api/blocks/:number/transactions` - Get block transactions

### Transactions
- `GET /api/transactions/latest` - Get latest transactions
- `GET /api/transactions/:hash` - Get transaction details
- `GET /api/transactions/pending/latest` - Get pending transactions

### Addresses
- `GET /api/addresses/:address` - Get address information
- `GET /api/addresses/:address/transactions` - Get address transactions
- `GET /api/addresses/:address/tokens` - Get token transfers

### Search
- `GET /api/search?q=query` - Universal search
- `GET /api/search/suggestions?q=query` - Search suggestions

## 📊 Performance Metrics

- **API Response Time**: < 200ms for most endpoints
- **Database Queries**: < 100ms average query time
- **Block Processing**: Process blocks within 5 seconds of mining
- **WebSocket Latency**: < 50ms for real-time updates

## 🔐 Security Features

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Secure headers with Helmet.js
- Environment variable protection

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 📈 Monitoring

- Application performance monitoring
- Error tracking and alerting
- API usage analytics
- Database performance metrics
- Real-time system health checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ethereum community for RPC specifications
- React and Node.js communities
- All open source contributors

---

Built with ❤️ for the blockchain community