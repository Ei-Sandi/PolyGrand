import algosdk from 'algosdk';
import { ALGOD_CONFIG } from '../config/constants';

// Initialize Algod client
export const algodClient = new algosdk.Algodv2(
  ALGOD_CONFIG.token,
  ALGOD_CONFIG.server,
  ALGOD_CONFIG.port
);

// Get account balance
export const getAccountBalance = async (address: string): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return Number(accountInfo.amount);
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0;
  }
};

// Get account's ASA balance
export const getAssetBalance = async (address: string, assetId: number): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const asset = accountInfo.assets?.find((a: any) => a['asset-id'] === assetId);
    return asset ? Number(asset.amount) : 0;
  } catch (error) {
    console.error('Error getting asset balance:', error);
    return 0;
  }
};

// Get application global state
export const getApplicationState = async (appId: number): Promise<Record<string, any>> => {
  try {
    const app = await algodClient.getApplicationByID(appId).do();
    const globalState = app.params.globalState || [];
    
    const state: Record<string, any> = {};
    globalState.forEach((item: any) => {
      const key = atob(item.key);
      const value = item.value.type === 1 
        ? atob(item.value.bytes)
        : item.value.uint;
      state[key] = value;
    });
    
    return state;
  } catch (error) {
    console.error('Error getting application state:', error);
    return {};
  }
};

// Format microAlgos to ALGO
export const microAlgosToAlgos = (microAlgos: number): number => {
  return microAlgos / 1_000_000;
};

// Format ALGO to microAlgos
export const algosToMicroAlgos = (algos: number): number => {
  return Math.floor(algos * 1_000_000);
};

// Wait for transaction confirmation
export const waitForConfirmation = async (txId: string): Promise<any> => {
  const status = await algosdk.waitForConfirmation(algodClient, txId, 4);
  return status;
};

export default algodClient;
