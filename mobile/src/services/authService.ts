/**
 * Auth Service implementation for mobile using shared authApi
 * Maintains compatibility with existing mobile screens
 * Updated to use phone-based authentication
 */
import { apiClient } from './apiService';
import { authApi } from '@shared/utils/api';
import type { User } from '@shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseAuthService = authApi(apiClient);

export interface RegisterData {
  username: string;
  phone: string;
  password: string;
  role?: 'client' | 'master' | 'user';
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  phone: string;
  password: string;
  smsCode?: string;
}

class MobileAuthService {
  // Login with phone number (and optional SMS code)
  async login(phone: string, password: string, smsCode?: string): Promise<{ token: string; user: User; refreshToken?: string }> {
    const result = await baseAuthService.login(phone, password, smsCode);
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    if (result.refreshToken) {
      await AsyncStorage.setItem('refreshToken', result.refreshToken);
    }
    return result;
  }

  // Simple login without SMS (for development/testing)
  async simpleLogin(phone: string, password: string): Promise<{ token: string; user: User; refreshToken?: string }> {
    const result = await baseAuthService.simpleLogin(phone, password);
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    if (result.refreshToken) {
      await AsyncStorage.setItem('refreshToken', result.refreshToken);
    }
    return result;
  }

  // Register new user with phone number
  async register(userData: RegisterData): Promise<{ user: User }> {
    const result = await baseAuthService.register({
      phone: userData.phone,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
    });
    return result;
  }

  // SMS verification
  async sendSms(phone: string, password?: string): Promise<any> {
    return baseAuthService.sendSms(phone, password);
  }

  async verifySms(phone: string, code: string): Promise<any> {
    return baseAuthService.verifySms(phone, code);
  }

  // Password reset
  async forgotPassword(phone: string): Promise<any> {
    return baseAuthService.forgotPassword(phone);
  }

  async resetPassword(phone: string, smsCode: string, newPassword: string): Promise<any> {
    return baseAuthService.resetPassword(phone, smsCode, newPassword);
  }

  // User profile
  async getCurrentUser(): Promise<User> {
    return baseAuthService.getMe();
  }

  async updateProfile(userData: any): Promise<User> {
    return baseAuthService.updateMe(userData);
  }

  async uploadAvatar(fileUri: string): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    return baseAuthService.uploadAvatar(formData);
  }

  // Logout
  async logout(): Promise<void> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    await baseAuthService.logout(refreshToken || undefined);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  // Token refresh
  async refreshToken(): Promise<{ token: string; user: User }> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const result = await baseAuthService.refresh(refreshToken);
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    return result;
  }
}

export const authService = new MobileAuthService();

