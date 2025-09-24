import axios from 'axios';
import { ApiResponse, PaginatedResponse, Block, Transaction, Address, NetworkStats, SearchResult, SearchSuggestion } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// Block API
export const blockApi = {
  getLatest: (limit = 20): Promise<ApiResponse<Block[]>> => {
    return api.get(`/blocks/latest?limit=${limit}`);
  },

  getByIdentifier: (identifier: string): Promise<ApiResponse<Block>> => {
    return api.get(`/blocks/${identifier}`);
  },

  getTransactions: (blockNumber: number, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> => {
    return api.get(`/blocks/${blockNumber}/transactions?page=${page}&limit=${limit}`);
  },

  getNetworkStats: (): Promise<ApiResponse<NetworkStats>> => {
    return api.get('/blocks/stats/network');
  }
};

// Transaction API
export const transactionApi = {
  getLatest: (limit = 20): Promise<ApiResponse<Transaction[]>> => {
    return api.get(`/transactions/latest?limit=${limit}`);
  },

  getByHash: (hash: string): Promise<ApiResponse<Transaction>> => {
    return api.get(`/transactions/${hash}`);
  },

  getPending: (limit = 20): Promise<ApiResponse<Transaction[]>> => {
    return api.get(`/transactions/pending/latest?limit=${limit}`);
  }
};

// Address API
export const addressApi = {
  getInfo: (address: string): Promise<ApiResponse<Address>> => {
    return api.get(`/addresses/${address}`);
  },

  getTransactions: (address: string, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> => {
    return api.get(`/addresses/${address}/transactions?page=${page}&limit=${limit}`);
  },

  getTokenTransfers: (address: string, page = 1, limit = 20): Promise<ApiResponse<any[]>> => {
    return api.get(`/addresses/${address}/tokens?page=${page}&limit=${limit}`);
  }
};

// Search API
export const searchApi = {
  search: (query: string): Promise<ApiResponse<SearchResult>> => {
    return api.get(`/search?q=${encodeURIComponent(query)}`);
  },

  getSuggestions: (query: string): Promise<ApiResponse<SearchSuggestion[]>> => {
    return api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }
};

export default api;