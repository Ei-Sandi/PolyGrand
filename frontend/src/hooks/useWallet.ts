import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PeraWalletConnect } from '@perawallet/connect';
import type { WalletAccount } from '../types';
import { getAccountBalance } from '../services/algorand';

// Lazy initialization to avoid SSR/hydration issues
let peraWallet: PeraWalletConnect | null = null;

const getPeraWallet = () => {
  if (!peraWallet) {
    try {
      peraWallet = new PeraWalletConnect();
    } catch (error) {
      console.error('Failed to initialize Pera Wallet:', error);
    }
  }
  return peraWallet;
};

interface WalletState {
  account: WalletAccount | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      account: null,
      isConnected: false,
      isConnecting: false,

      connect: async () => {
        try {
          set({ isConnecting: true });
          
          const wallet = getPeraWallet();
          if (!wallet) {
            throw new Error('Pera Wallet not available');
          }
          
          const accounts = await wallet.connect();
          const address = accounts[0];
          
          const balance = await getAccountBalance(address);
          
          set({
            account: { address, balance },
            isConnected: true,
            isConnecting: false,
          });
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({ isConnecting: false });
        }
      },

      disconnect: () => {
        const wallet = getPeraWallet();
        if (wallet) {
          wallet.disconnect();
        }
        set({ account: null, isConnected: false });
      },

      updateBalance: async () => {
        const { account } = get();
        if (!account) return;

        try {
          const balance = await getAccountBalance(account.address);
          set({ account: { ...account, balance } });
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      },
    }),
    {
      name: 'polygrand-wallet',
      partialize: (state) => ({ 
        account: state.account,
        isConnected: state.isConnected 
      }),
    }
  )
);

// Export peraWallet getter for transaction signing
export { getPeraWallet as peraWallet };
