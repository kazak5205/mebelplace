// Unified AuthContext для client и mobile
// Синхронизировано между web и mobile приложениями

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

// Storage interface для абстракции localStorage и AsyncStorage
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Auth service interface
export interface AuthService {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  register(userData: RegisterData): Promise<{ token: string; user: User }>;
  getCurrentUser(): Promise<User>;
  updateUser(userData: Partial<User>): Promise<User>;
  logout(): Promise<void>;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  role: 'client' | 'master';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  storage: StorageAdapter;
  authService: AuthService;
}

const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'userData',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  storage, 
  authService 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Refresh user data from server
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // Keep using stored user data
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      await storage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      await storage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if server request fails
    } finally {
      await clearAuth();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = await authService.updateUser(userData);
      
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }

      const freshUser = await authService.getCurrentUser();
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
      setUser(freshUser);
    } catch (error) {
      console.error('Refresh user failed:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    await storage.removeItem(STORAGE_KEYS.TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Storage adapters для разных платформ

// LocalStorage adapter для web
export const createLocalStorageAdapter = (): StorageAdapter => ({
  async getItem(key: string) {
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    localStorage.removeItem(key);
  },
});

// AsyncStorage adapter для React Native (используется в mobile)
// Импортируйте AsyncStorage отдельно в mobile приложении
export const createAsyncStorageAdapter = (AsyncStorage: any): StorageAdapter => ({
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
});

export default AuthContext;

