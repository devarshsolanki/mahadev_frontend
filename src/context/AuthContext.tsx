import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/api/types';
import { authApi } from '@/api/auth';
import { setTokens, clearTokens } from '@/api/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string, name?: string) => Promise<any>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  completeRegistration: (name: string, tempAuthData: any) => Promise<void>;
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
      // If server returned access/refresh tokens, store them and set user regardless
      // This covers both login and signup flows where the server issues tokens.
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        if (data.user) setUser(data.user);
        if (data.isNewUser) {
          toast.success('Registration successful!');
        } else {
          toast.success('Login successful!');
        }
      }
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const completeRegistration = async (name: string, tempAuthData: any) => {
    try {
      setTokens(tempAuthData.accessToken, tempAuthData.refreshToken);
      await authApi.updateProfile({ name });
      await loadUser();
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      clearTokens();
      setUser(null);
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
        completeRegistration,
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
