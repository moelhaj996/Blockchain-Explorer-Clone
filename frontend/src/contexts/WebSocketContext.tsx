import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Block, Transaction, NetworkStats } from '../types';

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  latestBlocks: Block[];
  latestTransactions: Transaction[];
  networkStats: NetworkStats | null;
  subscribeToBlocks: () => void;
  subscribeToTransactions: () => void;
  subscribeToAddress: (address: string) => void;
  unsubscribeFromAddress: (address: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    socketInstance.on('newBlock', (block: Block) => {
      setLatestBlocks(prev => [block, ...prev.slice(0, 19)]);
      toast.success(`New block #${block.number} mined!`, {
        duration: 3000,
        icon: '⛏️'
      });
    });

    socketInstance.on('newTransaction', (transaction: Transaction) => {
      setLatestTransactions(prev => [transaction, ...prev.slice(0, 19)]);
    });

    socketInstance.on('networkStats', (stats: NetworkStats) => {
      setNetworkStats(stats);
    });

    socketInstance.on('addressTransaction', (transaction: Transaction) => {
      toast(`New transaction for watched address`, {
        duration: 4000,
        icon: '📍'
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const subscribeToBlocks = () => {
    if (socket) {
      socket.emit('subscribe:blocks');
    }
  };

  const subscribeToTransactions = () => {
    if (socket) {
      socket.emit('subscribe:transactions');
    }
  };

  const subscribeToAddress = (address: string) => {
    if (socket) {
      socket.emit('subscribe:address', address);
      toast.success(`Watching address: ${address.substring(0, 8)}...`);
    }
  };

  const unsubscribeFromAddress = (address: string) => {
    if (socket) {
      socket.emit('unsubscribe:address', address);
      toast.success(`Stopped watching address: ${address.substring(0, 8)}...`);
    }
  };

  const value: WebSocketContextType = {
    socket,
    connected,
    latestBlocks,
    latestTransactions,
    networkStats,
    subscribeToBlocks,
    subscribeToTransactions,
    subscribeToAddress,
    unsubscribeFromAddress
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}