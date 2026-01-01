import { apiClient, formatApiError } from './client';
import { ApiResponse, Wallet, Transaction } from './types';

export const walletApi = {
  getWallet: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Wallet>>('/wallet');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  addMoney: async (amount: number, paymentMethod: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<any>>('/wallet/add-money', {
        amount,
        paymentMethod,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getTransactions: async (params?: { page?: number; limit?: number; type?: string }) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Transaction[]>>(
        '/wallet/transactions',
        { params }
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getTransactionById: async (id: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Transaction>>(`/wallet/transactions/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  setPIN: async (pin: string, oldPin?: string) => {
    try {
      const payload: { pin: string; oldPin?: string } = { pin };
      if (oldPin) {
        payload.oldPin = oldPin;
      }
      const { data } = await apiClient.post<ApiResponse<any>>('/wallet/set-pin', payload);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  verifyPIN: async (pin: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<any>>('/wallet/verify-pin', { pin });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getStatistics: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>('/wallet/statistics');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
