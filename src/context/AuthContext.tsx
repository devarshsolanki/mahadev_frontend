import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthResponse, User } from '@/api/types';
import { authApi } from '@/api/auth';
import { setTokens, clearTokens } from '@/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string) => ReturnType<typeof authApi.sendOtp>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResponse>;
  resendOtp: (email: string) => ReturnType<typeof authApi.resendOtp>;
  googleLogin: (idToken: string) => Promise<AuthResponse>;
  completeProfile: (name: string, phone: string) => Promise<User>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await authApi.getProfile();
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const acceptAuthResponse = (data: AuthResponse) => {
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const data = await authApi.verifyOtp(email, otp);
    acceptAuthResponse(data);
    return data;
  };

  const googleLogin = async (idToken: string) => {
    const data = await authApi.googleLogin(idToken);
    acceptAuthResponse(data);
    return data;
  };

  const completeProfile = async (name: string, phone: string) => {
    const updatedUser = await authApi.completeProfile(name, phone);
    setUser(updatedUser);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profile'] }),
      queryClient.invalidateQueries({ queryKey: ['user'] }),
      queryClient.invalidateQueries({ queryKey: ['addresses'] }),
    ]);
    return updatedUser;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const refetchUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp: authApi.sendOtp,
        verifyOtp,
        resendOtp: authApi.resendOtp,
        googleLogin,
        completeProfile,
        updateUser,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
