import { apiClient, formatApiError } from './client';
import { ApiResponse, AuthResponse, User } from './types';
import { AxiosPromise } from 'axios';

/**
 * A generic request handler to reduce boilerplate.
 * It handles the try-catch block, formats errors, and normalizes the response payload.
 */
async function handleRequest<T>(
  request: AxiosPromise<ApiResponse<T>>,
  payloadSelector: (data: ApiResponse<T> | T) => T = (data: any) => data.data ?? data.user ?? data
) {
  try {
    const { data } = await request;
    const payload = payloadSelector(data);
    return { success: true, data: payload };
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

export const authApi = {
  sendOTP: async (phone: string) => {
    return handleRequest(apiClient.post('/auth/send-otp', { phone }));
  },

  verifyOTP: async (phone: string, otp: string, name?: string) => {
    // verify-otp returns tokens and isNewUser at the top-level of the response.
    // Use a payloadSelector that returns the full response object so callers
    // (like AuthContext.login) receive accessToken/refreshToken/isNewUser/user.
    return handleRequest<AuthResponse>(
      apiClient.post('/auth/verify-otp', {
        phone,
        otp,
        name,
      }),
      // return the entire response payload instead of only nested `data.user`
      (data) => data as any
    );
  },

  resendOTP: async (phone: string) => {
    return handleRequest(apiClient.post('/auth/resend-otp', { phone }));
  },

  getProfile: async () => handleRequest<User>(apiClient.get('/auth/profile')),

  updateProfile: async (profileData: Partial<User>) =>
    handleRequest<User>(apiClient.put('/auth/profile', profileData)),

  logout: async () => handleRequest(apiClient.post('/auth/logout')),
};
