/**
 * Mobile-specific AuthContext
 * Wraps shared AuthContext with React Native specific implementations
 * SYNCHRONIZED WITH WEB VERSION - uses real authService
 */

import React, { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthProvider as SharedAuthProvider, 
  createAsyncStorageAdapter,
  type AuthService 
} from '@shared/contexts/AuthContext';
import { authService as realAuthService } from '../services/authService';

// Real AuthService implementation using our authService
const createAuthService = (): AuthService => ({
  async login(email: string, password: string) {
    const result = await realAuthService.login(email, password);
    return {
      token: result.data.token,
      user: result.data.user,
    };
  },

  async register(userData: any) {
    const result = await realAuthService.register(userData);
    return {
      token: result.data.token,
      user: result.data.user,
    };
  },

  async getCurrentUser() {
    return await realAuthService.getCurrentUser();
  },

  async updateUser(userData: any) {
    const result = await realAuthService.updateUser(userData);
    return result.data || result;
  },

  async logout() {
    await realAuthService.logout();
    await AsyncStorage.removeItem('userData');
  },
});

interface MobileAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<MobileAuthProviderProps> = ({ children }) => {
  const storage = createAsyncStorageAdapter(AsyncStorage);
  const authService = createAuthService();

  return (
    <SharedAuthProvider storage={storage} authService={authService}>
      {children}
    </SharedAuthProvider>
  );
};

// Re-export shared hooks and types
export { useAuth } from '@shared/contexts/AuthContext';
export type { RegisterData } from '@shared/contexts/AuthContext';
