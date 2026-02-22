import { create } from 'zustand';
import { Wallet, Transaction } from '@/types';
import { api } from '@/lib/api';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  requestDeposit: (data: {
    amount: number;
    paymentMethod: string;
    receiptUrl: string;
  }) => Promise<boolean>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getWallet();
      const wallet = response.data as Wallet;
      set({
        balance: Number(wallet?.balance ?? 0),
        transactions: wallet?.transactions ?? [],
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await api.getTransactions();
      set({ transactions: (response.data as Transaction[]) || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  requestDeposit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.requestDeposit(data);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));
