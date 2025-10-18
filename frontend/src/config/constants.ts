// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Algorand Configuration
export const ALGORAND_NETWORK = import.meta.env.VITE_ALGORAND_NETWORK || 'testnet';

export const ALGOD_CONFIG = {
  server: import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
  token: import.meta.env.VITE_ALGOD_TOKEN || '',
  port: import.meta.env.VITE_ALGOD_PORT || '',
};

// App Configuration
export const APP_NAME = 'PolyGrand';
export const APP_DESCRIPTION = 'Next-generation prediction markets on Algorand';

// Trading Configuration
export const MIN_TRADE_AMOUNT = 1_000_000; // 1 ALGO in microAlgos
export const MAX_TRADE_AMOUNT = 1000_000_000; // 1000 ALGO
export const PLATFORM_FEE = 0.002; // 0.2%
