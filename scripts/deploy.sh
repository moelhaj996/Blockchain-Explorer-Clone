#!/bin/bash

set -e

echo "🚀 Deploying Blockchain Explorer..."

# Check if required environment variables are set
if [ -z "$RPC_URL" ]; then
    echo "❌ ERROR: RPC_URL environment variable is not set"
    echo "Please set RPC_URL to your Ethereum RPC endpoint (e.g., Alchemy or Infura)"
    echo "Example: export RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "RPC_URL=$RPC_URL" >> .env
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    echo "📋 Backend logs:"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
    echo "📋 Frontend logs:"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Access your Blockchain Explorer:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "📊 Database:"
echo "   MongoDB: mongodb://localhost:27017"
echo ""
echo "🔧 Management:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""

# Show running containers
echo "📋 Running containers:"
docker-compose ps