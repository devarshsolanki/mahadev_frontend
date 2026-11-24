import { apiClient, formatApiError } from './client';
import { Address, AuthResponse, User } from './types';
import { AxiosResponse } from 'axios';

async function handleRequest<T>(
  request: Promise<AxiosResponse<unknown>>,
  selectPayload: (response: Record<string, unknown>) => T
) {
  try {
    const { data } = await request;
    return selectPayload(data as Record<string, unknown>);
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

const selectAuthResponse = (response: Record<string, unknown>) =>
  response as unknown as AuthResponse;

const selectUser = (response: Record<string, unknown>) =>
  (response.user ?? response.data) as User;

const selectAddresses = (response: Record<string, unknown>) =>
  response.data as Address[];

export const authApi = {
  sendOtp: async (email: string) => {
    return handleRequest(
      apiClient.post('/api/v1/auth/send-otp', { email }),
      (response) => response
    );
  },

  verifyOtp: async (email: string, otp: string) => {
    return handleRequest(
      apiClient.post('/api/v1/auth/verify-otp', { email, otp }),
      selectAuthResponse
    );
  },

  resendOtp: async (email: string) => {
    return handleRequest(
      apiClient.post('/api/v1/auth/resend-otp', { email }),
      (response) => response
    );
  },

  googleLogin: async (idToken: string) => {
    return handleRequest(
      apiClient.post('/api/v1/auth/google', { idToken }),
      selectAuthResponse
    );
  },

  completeProfile: async (name: string, phone: string) => {
    return handleRequest(
      apiClient.put('/api/v1/auth/complete-profile', { name, phone }),
      selectUser
    );
  },

  getProfile: async () => handleRequest(
    apiClient.get('/api/v1/auth/profile'),
    selectUser
  ),

  getAddresses: async () => handleRequest(
    apiClient.get('/api/v1/auth/addresses'),
    selectAddresses
  ),

  updateProfile: async (profileData: Partial<User>) => handleRequest(
    apiClient.put('/api/v1/auth/profile', profileData),
    selectUser
  ),

  logout: async () => handleRequest(
    apiClient.post('/api/v1/auth/logout'),
    (response) => response
  ),
};
