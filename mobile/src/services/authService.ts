/**
 * Auth Service implementation for mobile using shared authApi
 * Maintains compatibility with existing mobile screens
 */
import { apiClient } from './apiService';
import { authApi, userApi } from '@shared/utils/api';
import type { User } from '@shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseAuthService = authApi(apiClient);
const baseUserService = userApi(apiClient);

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: 'client' | 'master' | 'user';
  firstName?: string;
  lastName?: string;
}

class MobileAuthService {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await baseAuthService.login(email, password);
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    return result;
  }

  async register(userData: RegisterData): Promise<{ token: string; user: User }> {
    const result = await baseAuthService.register({
      email: userData.email,
      password: userData.password,
      name: userData.username || `${userData.firstName} ${userData.lastName}`.trim(),
      role: userData.role,
    });
    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
    }
    return result;
  }

  async getCurrentUser(): Promise<User> {
    return baseAuthService.getMe();
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const currentUser = await baseAuthService.getMe();
    return baseUserService.update(currentUser.id, userData);
  }

  async uploadAvatar(formData: FormData): Promise<User> {
    // Используем /api/auth/profile напрямую для загрузки аватара
    const result = await apiClient.upload('/auth/profile', formData);
    return result.data;
  }

  async logout(): Promise<void> {
    await baseAuthService.logout();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
  }
}

export const authService = new MobileAuthService();

