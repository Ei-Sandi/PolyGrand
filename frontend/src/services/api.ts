import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import type { Market, Trade, UserPosition, LeaderboardEntry, MarketStats, CreateMarketParams } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Markets
export const getMarkets = async (): Promise<Market[]> => {
  const response = await api.get('/markets');
  return response.data;
};

export const getMarket = async (id: number): Promise<Market> => {
  const response = await api.get(`/markets/${id}`);
  return response.data;
};

export const createMarket = async (marketData: CreateMarketParams): Promise<Market> => {
  const response = await api.post('/markets', marketData);
  return response.data;
};

// Trading
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
  return response.data;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await api.get('/leaderboard');
  return response.data;
};

export default api;
