import { apiClient, formatApiError } from './client';
import { ApiResponse, Subscription } from './types';

export interface SubscriptionCreatePayload {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  frequency: 'daily' | 'weekly' | 'monthly';
  deliveryTime: {
    hour: number;
    minute: number;
  };
  deliveryDays?: number[]; // For weekly subscriptions (0=Sunday, 6=Saturday)
  deliveryDate?: number; // For monthly subscriptions (1-31)
  deliveryAddressId: string;
  paymentMethod?: 'wallet' | 'cod' | 'card' | 'upi';
  customerNotes?: string;
  startDate?: string;
}

export interface SubscriptionUpdatePayload {
  deliveryTime?: {
    hour: number;
    minute: number;
  };
  deliveryDays?: number[];
  deliveryDate?: number;
  customerNotes?: string;
}

export interface PauseSubscriptionPayload {
  reason?: string;
  resumeDate?: string; // ISO date string
}

export const subscriptionsApi = {
  // Get all subscriptions for current user
  getSubscriptions: async (status?: string) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const { data } = await apiClient.get<ApiResponse<Subscription[]>>(
        `/api/v1/subscriptions${params.toString() ? '?' + params.toString() : ''}`
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Get single subscription by ID
  getSubscriptionById: async (subscriptionId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Subscription>>(
        `/api/v1/subscriptions/${subscriptionId}`
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Create new subscription
  createSubscription: async (payload: SubscriptionCreatePayload) => {
    try {
      // Validate payload structure
      if (!payload.items || payload.items.length === 0) {
        throw new Error('At least one item is required');
      }

      if (!payload.frequency || !['daily', 'weekly', 'monthly'].includes(payload.frequency)) {
        throw new Error('Invalid frequency');
      }

      if (!payload.deliveryAddressId) {
        throw new Error('Delivery address is required');
      }

      if (!payload.deliveryTime) {
        throw new Error('Delivery time is required');
      }

      if (payload.deliveryTime.hour < 0 || payload.deliveryTime.hour > 23) {
        throw new Error('Hour must be between 0-23');
      }

      if (payload.deliveryTime.minute < 0 || payload.deliveryTime.minute > 59) {
        throw new Error('Minute must be between 0-59');
      }

      // Validate frequency-specific fields
      if (payload.frequency === 'weekly') {
        if (!payload.deliveryDays || payload.deliveryDays.length === 0) {
          throw new Error('Delivery days are required for weekly subscriptions');
        }
      }

      if (payload.frequency === 'monthly') {
        if (!payload.deliveryDate || payload.deliveryDate < 1 || payload.deliveryDate > 31) {
          throw new Error('Valid delivery date (1-31) is required for monthly subscriptions');
        }
      }

      const { data } = await apiClient.post<ApiResponse<Subscription>>(
        '/api/v1/subscriptions',
        payload
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, payload: SubscriptionUpdatePayload) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Subscription>>(
        `/api/v1/subscriptions/${subscriptionId}`,
        payload
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Pause subscription
  pauseSubscription: async (subscriptionId: string, payload: PauseSubscriptionPayload = {}) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(
        `/api/v1/subscriptions/${subscriptionId}/pause`,
        payload
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Resume subscription
  resumeSubscription: async (subscriptionId: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(
        `/api/v1/subscriptions/${subscriptionId}/resume`
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Subscription>>(
        `/api/v1/subscriptions/${subscriptionId}/cancel`,
        { reason }
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Get subscription statistics
  getStatistics: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>(
        '/api/v1/subscriptions/statistics'
      );
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  }
};
