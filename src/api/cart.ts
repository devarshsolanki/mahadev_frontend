import { apiClient, formatApiError } from './client';
import { ApiResponse, Cart } from './types';

export const cartApi = {
  getCart: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Cart>>('/cart');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/add', {
        productId,
        quantity,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
        quantity,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  removeCartItem: async (itemId: string) => {
    try {
      const { data } = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  clearCart: async () => {
    try {
      const { data } = await apiClient.delete<ApiResponse<any>>('/cart/clear');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  applyCoupon: async (couponCode: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/coupon/apply', {
        couponCode,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  removeCoupon: async () => {
    try {
      const { data } = await apiClient.delete<ApiResponse<Cart>>('/cart/coupon/remove');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  validateCart: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>('/cart/validate');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
