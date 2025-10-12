import { apiClient, formatApiError } from './client';
import { ApiResponse, Order, DeliverySlot } from './types';

export const ordersApi = {
  getMyOrders: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders/my-orders');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getOrderById: async (orderId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  trackOrder: async (orderId: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>(`/orders/${orderId}/track`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  cancelOrder: async (orderId: string, reason?: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};

export const checkoutApi = {
  createOrder: async (orderData: {
    deliveryAddressId: string;
    paymentMethod: string;
    deliverySlot?: { date: string; time: string };
    walletPIN?: string;
  }) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Order>>('/checkout/create-order', orderData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getDeliverySlots: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<DeliverySlot[]>>('/checkout/delivery-slots');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  verifyPayment: async (paymentData: any) => {
    try {
      const { data } = await apiClient.post<ApiResponse<any>>('/checkout/verify-payment', paymentData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getDeliveryFee: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<{ fee: number }>>('/checkout/delivery-fee');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
