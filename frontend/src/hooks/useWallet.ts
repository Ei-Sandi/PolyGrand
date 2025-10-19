import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletAccount {
  address: string;
  balance: number;
  name: string;
}

interface WalletState {
  account: WalletAccount | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  showModal: boolean;
  initializeWallet: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnectSession: () => Promise<void>;
  updateBalance: () => Promise<void>;
  setShowModal: (show: boolean) => void;
}

// Generate a realistic fake Algorand address
function generateFakeAddress(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let address = '';
  for (let i = 0; i < 58; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

// Generate realistic balance between 10-1000 ALGO
function generateFakeBalance(): number {
  return Math.floor(Math.random() * 990) + 10;
}

// List of fake wallet names for realism
const WALLET_NAMES = [
  'Demo Wallet',
  'Test Account',
  'Trading Wallet',
  'Main Wallet',
  'Secondary Account',
];

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      account: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      showModal: false,

      // Initialize wallet (no-op for fake wallet)
      initializeWallet: () => {
        console.log('✅ Mock wallet initialized (no actual Pera Wallet needed)');
      },

      // Fake connect that simulates Pera Wallet behavior
      connect: async () => {
        try {
          set({ isConnecting: true, error: null, showModal: true });

          // Simulate network delay (realistic!)
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Generate fake but realistic account data
          const fakeAddress = generateFakeAddress();
          const fakeBalance = generateFakeBalance();
          const fakeName = WALLET_NAMES[Math.floor(Math.random() * WALLET_NAMES.length)];

          console.log('✅ Mock wallet connected:', fakeAddress);

          set({
            account: { 
              address: fakeAddress, 
              balance: fakeBalance,
              name: fakeName 
            },
            isConnected: true,
            isConnecting: false,
            error: null,
            showModal: false,
          });

          // Show success notification
          console.log(`Connected to ${fakeName}`);
          console.log(`Balance: ${fakeBalance.toFixed(2)} ALGO`);
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({
            isConnecting: false,
            error: error instanceof Error ? error.message : 'Failed to connect wallet',
            account: null,
            isConnected: false,
            showModal: false,
          });
          throw error;
        }
      },

      // Disconnect wallet
      disconnect: async () => {
        try {
          // Simulate disconnect delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set({ 
            account: null, 
            isConnected: false,
            error: null 
          });
          console.log('✅ Mock wallet disconnected');
        } catch (error) {
          console.error('Error disconnecting wallet:', error);
          // Still clear the state even if disconnect fails
          set({ 
            account: null, 
            isConnected: false,
            error: null 
          });
        }
      },

      // Reconnect to existing session (loads from localStorage via persist)
      reconnectSession: async () => {
        const { account, isConnected } = get();
        
        if (isConnected && account) {
          console.log('✅ Reconnected to saved session:', account.address);
        } else {
          console.log('ℹ️ No existing session to reconnect');
        }
      },

      // Update account balance (simulates balance changes)
      updateBalance: async () => {
        const { account } = get();
        if (!account) return;

        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Randomly adjust balance slightly for realism
          const change = (Math.random() - 0.5) * 10; // +/- 5 ALGO
          const newBalance = Math.max(0, account.balance + change);
          
          set({ 
            account: { ...account, balance: newBalance },
            error: null 
          });
          console.log(`Balance updated: ${newBalance.toFixed(2)} ALGO`);
        } catch (error) {
          console.error('Failed to update balance:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update balance' 
          });
        }
      },

      setShowModal: (show: boolean) => {
        set({ showModal: show });
      },
    }),
    {
      name: 'polygrand-wallet-storage',
      partialize: (state) => ({
        account: state.account,
        isConnected: state.isConnected,
      }),
    }
  )
);

// Export helper to get the wallet instance (returns null for fake wallet)
export const getPeraWallet = () => {
  return null;
};
