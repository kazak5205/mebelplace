import { api } from '../client';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/lib/store/slices/authSlice';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify SMS code
  verifySMS: async (phone: string, code: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-sms', { phone, code });
    return response.data;
  },

  // Verify email code
  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
