import { apiClient, formatApiError } from './client';
import { ApiResponse, AuthResponse, User } from './types';

export const authApi = {
  sendOTP: async (phone: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/send-otp', { phone });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  verifyOTP: async (phone: string, otp: string, name?: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', {
        phone,
        otp,
        name,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  resendOTP: async (phone: string) => {
    try {
      const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', { phone });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getProfile: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    try {
      const { data } = await apiClient.put<ApiResponse<User>>('/auth/profile', profileData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  logout: async () => {
    try {
      const { data } = await apiClient.post<ApiResponse<any>>('/auth/logout');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
