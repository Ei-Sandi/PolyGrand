// Market Types
export interface Market {
  id: number;
  appId: number;
  title: string;
  description: string;
  category?: string;
  outcomeAName: string;
  outcomeBName: string;
  outcomeAAsaId: number;
  outcomeBAsaId: number;
  creatorAddress: string;
  resolverAddress: string;
  resolutionTime: string;
  isResolved: boolean;
  winningOutcome: number | null;
  createdAt: string;
  // Derived fields
  totalVolume?: number;
  outcomeAPrice?: number;
  outcomeBPrice?: number;
  outcomeASupply?: number;
  outcomeBSupply?: number;
}

// Trade Types
export interface Trade {
  id: number;
  marketId: number;
  userAddress: string;
  outcome: number;
  amount: number;
  tokens: number;
  txnId: string;
  createdAt: string;
}

// User Position
export interface UserPosition {
  id: number;
  marketId: number;
  userAddress: string;
  outcomeABalance: number;
  outcomeBBalance: number;
}

// Wallet Types
export interface WalletAccount {
  address: string;
  balance: number;
}

// Market Creation
export interface CreateMarketParams {
  title: string;
  description: string;
  category: string;
  outcomes: string[];
  resolutionDate: string;
  initialLiquidity: number;
  creatorAddress: string;
}

// Transaction Types
export interface BuyTransactionParams {
  marketId: number;
  outcome: number;
  amount: number;
}

export interface ClaimTransactionParams {
  marketId: number;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  address: string;
  totalProfit: number;
  totalVolume: number;
  winRate: number;
  marketsTraded: number;
}

// Market Statistics
export interface MarketStats {
  totalMarkets: number;
  totalVolume: number;
  activeUsers: number;
  resolvedMarkets: number;
}
