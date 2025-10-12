import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/api/types';
import { authApi } from '@/api/auth';
import { setTokens, clearTokens } from '@/api/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await authApi.getProfile();
      setUser(data);
    } catch (error) {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (phone: string, otp: string, name?: string) => {
    try {
      const { data } = await authApi.verifyOTP(phone, otp, name);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUser(null);
      toast.success('Logged out successfully');
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
        login,
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
