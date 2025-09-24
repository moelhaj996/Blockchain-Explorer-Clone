import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, Users, Zap } from 'lucide-react';

import { useWebSocket } from '../contexts/WebSocketContext';
import { blockApi, transactionApi } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchBar from '../components/Search/SearchBar';
import NetworkStatsCards from '../components/Stats/NetworkStatsCards';

const HomePage: React.FC = () => {
  const {
    connected,
    latestBlocks,
    latestTransactions,
    networkStats,
    subscribeToBlocks,
    subscribeToTransactions
  } = useWebSocket();

  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();

    subscribeToBlocks();
    subscribeToTransactions();
  }, []);

  useEffect(() => {
    if (latestBlocks.length > 0) {
      setBlocks(latestBlocks);
    }
  }, [latestBlocks]);

  useEffect(() => {
    if (latestTransactions.length > 0) {
      setTransactions(latestTransactions);
    }
  }, [latestTransactions]);

  const loadInitialData = async () => {
    try {
      const [blocksResponse, transactionsResponse] = await Promise.all([
        blockApi.getLatest(10),
        transactionApi.getLatest(10)
      ]);

      setBlocks(blocksResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const truncateHash = (hash: string) => `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  const truncateAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ethereum Blockchain Explorer
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track blocks, transactions, and addresses on the Ethereum network
        </p>

        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar />
        </div>

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          connected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {connected ? 'Connected to network' : 'Disconnected'}
        </div>
      </div>

      {/* Network Statistics */}
      {networkStats && (
        <div className="mb-12">
          <NetworkStatsCards stats={networkStats} />
        </div>
      )}

      {/* Latest Blocks and Transactions */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Latest Blocks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Latest Blocks
              </h2>
              <Link
                to="/blocks"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {blocks.slice(0, 5).map((block) => (
              <div key={block.number} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Link
                        to={`/block/${block.number}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        #{formatNumber(block.number)}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {truncateHash(block.hash)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {block.transactionCount} txns
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(parseInt(block.gasUsed) / 1000000)}M gas
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-green-600" />
                Latest Transactions
              </h2>
              <Link
                to="/transactions"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.hash} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <Link
                        to={`/tx/${tx.hash}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {truncateHash(tx.hash)}
                      </Link>
                      <div className="text-sm text-gray-500">
                        Block #{tx.blockNumber.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {(parseFloat(tx.value) / 1e18).toFixed(4)} ETH
                    </div>
                    <div className="text-sm text-gray-500">
                      {truncateAddress(tx.from)} → {truncateAddress(tx.to)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Block Time</h3>
          <p className="text-2xl font-bold text-blue-600">~12s</p>
          <p className="text-gray-600 text-sm">Average block time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Activity className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Status</h3>
          <p className="text-2xl font-bold text-green-600">Active</p>
          <p className="text-gray-600 text-sm">Ethereum Mainnet</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blocks Tracked</h3>
          <p className="text-2xl font-bold text-purple-600">{formatNumber(blocks.length)}</p>
          <p className="text-gray-600 text-sm">In this session</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;