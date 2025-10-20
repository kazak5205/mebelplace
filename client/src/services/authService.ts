/**
 * Auth Service implementation for client using shared authApi
 */
import { apiClient } from './api';
import { authApi, userApi } from '@shared/utils/api';
import type { User } from '@shared/types';
import type { RegisterData, AuthService } from '@shared/contexts/AuthContext';

const baseAuthService = authApi(apiClient);
const baseUserService = userApi(apiClient);

class ClientAuthService implements AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return baseAuthService.login(email, password);
  }

  async register(userData: RegisterData): Promise<{ token: string; user: User }> {
    return baseAuthService.register(userData);
  }

  async getCurrentUser(): Promise<User> {
    return baseAuthService.getMe();
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    // Get current user ID from token or context
    const currentUser = await baseAuthService.getMe();
    return baseUserService.update(currentUser.id, userData);
  }

  async logout(): Promise<void> {
    return baseAuthService.logout();
  }
}

export const authService = new ClientAuthService();
