import { apiClient, formatApiError } from './client';
import { ApiResponse, Subscription } from './types';

export const subscriptionsApi = {
  getSubscriptions: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getSubscriptionById: async (id: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  createSubscription: async (subscriptionData: {
    items: Array<{ product: string; quantity: number }>;
    frequency: 'daily' | 'weekly' | 'monthly';
    deliveryAddressId: string;
    startDate: string;
    weeklySchedule?: number[];
    monthlyDates?: number[];
  }) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', subscriptionData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  pauseSubscription: async (id: string, pausedUntil: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`, {
        pausedUntil,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  resumeSubscription: async (id: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  cancelSubscription: async (id: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  updateSubscription: async (id: string, subscriptionData: Partial<Subscription>) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, subscriptionData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
