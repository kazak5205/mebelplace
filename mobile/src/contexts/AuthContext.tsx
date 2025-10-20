/**
 * Mobile-specific AuthContext
 * Wraps shared AuthContext with React Native specific implementations
 */

import React, { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthProvider as SharedAuthProvider, 
  createAsyncStorageAdapter,
  type AuthService 
} from '@shared/contexts/AuthContext';

// Mock AuthService implementation for mobile
// Replace with actual API calls
const createAuthService = (): AuthService => ({
  async login(email: string, password: string) {
    // TODO: Replace with actual API call
    const response = await fetch('https://mebelplace.com.kz/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    return {
      token: data.token,
      user: data.user,
    };
  },

  async register(userData: any) {
    // TODO: Replace with actual API call
    const response = await fetch('https://mebelplace.com.kz/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    return {
      token: data.token,
      user: data.user,
    };
  },

  async getCurrentUser() {
    // TODO: Replace with actual API call
    const response = await fetch('https://mebelplace.com.kz/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return await response.json();
  },

  async updateUser(userData: any) {
    // TODO: Replace with actual API call
    const response = await fetch('https://mebelplace.com.kz/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    return await response.json();
  },

  async logout() {
    // TODO: Replace with actual API call
    const response = await fetch('https://mebelplace.com.kz/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
      },
    });
    
    // Always clear local storage even if server request fails
    await AsyncStorage.removeItem('authToken');
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
