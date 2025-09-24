// Block types
export interface Block {
  _id: string;
  number: number;
  hash: string;
  parentHash: string;
  timestamp: string | Date;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;
  difficulty?: string;
  totalDifficulty?: string;
  size?: number;
  transactionCount: number;
  transactions: string[] | Transaction[];
  miner: string;
  reward?: string;
  extraData?: string;
  nonce?: string;
}

// Transaction types
export interface Transaction {
  _id: string;
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasUsed?: string;
  gasLimit: string;
  nonce: number;
  input?: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string | Date;
  contractAddress?: string;
  tokenTransfers?: TokenTransfer[];
  internalTransactions?: InternalTransaction[];
}

// Token transfer types
export interface TokenTransfer {
  token: string;
  from: string;
  to: string;
  value: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

// Internal transaction types
export interface InternalTransaction {
  from: string;
  to: string;
  value: string;
  type: string;
}

// Address types
export interface Address {
  address: string;
  balance: string;
  transactionCount: number;
  sentTransactions: number;
  receivedTransactions: number;
  firstSeen: string | Date | null;
  lastSeen: string | Date | null;
}

// Network statistics types
export interface NetworkStats {
  latestBlock: number;
  averageBlockTime: number;
  dailyTransactions: number;
  totalBlocks: number;
  totalTransactions: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Search types
export interface SearchResult {
  query: string;
  results: {
    blocks: Block[];
    transactions: Transaction[];
    addresses: Address[];
  };
  totalResults: number;
}

export interface SearchSuggestion {
  type: 'block' | 'transaction' | 'address';
  display: string;
  value: string;
  subtitle: string;
}