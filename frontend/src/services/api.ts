import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import type { Market, Trade, UserPosition, LeaderboardEntry, MarketStats } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transform backend market response to frontend Market type
function transformMarket(backendMarket: any): Market {
  // Handle multi-outcome markets by taking first two outcomes
  const outcomes = backendMarket.outcomes || [];
  const outcomeAName = outcomes[0] || 'Yes';
  const outcomeBName = outcomes[1] || 'No';
  
  // Get prices for outcomes
  const prices = backendMarket.prices || {};
  const outcomeAPrice = prices[outcomeAName] || 0.5;
  const outcomeBPrice = prices[outcomeBName] || 0.5;
  
  return {
    id: backendMarket.id || 0, // Keep original backend ID (market_abc123)
    appId: backendMarket.app_id || 0,
    title: backendMarket.question || '',
    description: backendMarket.description || '',
    category: backendMarket.category,
    outcomeAName,
    outcomeBName,
    outcomeAAsaId: backendMarket.outcome_token_ids?.[outcomeAName] || 0,
    outcomeBAsaId: backendMarket.outcome_token_ids?.[outcomeBName] || 0,
    creatorAddress: backendMarket.creator_address || '',
    resolverAddress: backendMarket.creator_address || '', // Using creator as resolver for now
    resolutionTime: backendMarket.end_time || '',
    isResolved: backendMarket.status === 'resolved',
    winningOutcome: backendMarket.resolved_outcome ? (backendMarket.resolved_outcome === outcomeAName ? 0 : 1) : null,
    createdAt: backendMarket.created_at || '',
    totalVolume: backendMarket.total_volume || 0,
    outcomeAPrice,
    outcomeBPrice,
  };
}

// Markets
export const getMarkets = async (): Promise<Market[]> => {
  const response = await api.get('/markets/');
  return (response.data || []).map(transformMarket);
};

export const getMarket = async (id: string | number): Promise<Market> => {
  const response = await api.get(`/markets/${id}`);
  return transformMarket(response.data);
};

export const createMarket = async (marketData: any): Promise<Market> => {
  const response = await api.post('/markets/', marketData);
  return transformMarket(response.data);
};

// Trading
export const executeTrade = async (
  marketId: string,
  traderAddress: string,
  outcome: string,
  amount: number
) => {
  const response = await api.post(`/markets/${marketId}/trade`, {
    trader_address: traderAddress,
    outcome,
    amount,
  });
  return response.data;
};

export const buyOutcome = async (marketId: number, outcome: number, amount: number) => {
  const response = await api.post(`/markets/${marketId}/buy`, { outcome, amount });
  return response.data;
};

export const claimWinnings = async (marketId: number) => {
  const response = await api.post(`/markets/${marketId}/claim`);
  return response.data;
};

// User
export const getUserPositions = async (address: string): Promise<UserPosition[]> => {
  const response = await api.get(`/user/${address}/positions`);
  return response.data;
};

export const getUserTrades = async (address: string): Promise<Trade[]> => {
  const response = await api.get(`/user/${address}/history`);
  return response.data;
};

// Stats
export const getPlatformStats = async (): Promise<MarketStats> => {
  const response = await api.get('/stats/platform');
  // Transform backend response to match frontend expectations
  return {
    totalMarkets: response.data.total_markets || 0,
    totalVolume: response.data.total_volume || 0,
    activeUsers: response.data.total_traders || 0,
    resolvedMarkets: response.data.resolved_markets || 0,
  };
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await api.get('/leaderboard');
  return response.data;
};

export default api;
