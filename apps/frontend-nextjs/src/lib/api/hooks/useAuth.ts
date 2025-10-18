/**
 * Authentication API Hooks
 * React Query hooks for auth-related endpoints
 */

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api-wrapper';
import { setTokens, clearTokens } from '@/lib/auth/tokens';

export interface User {
  id: number;
  email: string;
  phone: string | null;
  username: string;
  avatar: string | null;
  role: 'buyer' | 'master' | 'admin';
  region: string | null;
  is_verified: boolean;
  points: number;
  level: number;
  created_at: string;
  bio?: string | null;
  videos_count?: number;
  followers_count?: number;
  following_count?: number;
  rating?: number;
  total_views?: number;
  total_likes?: number;
  completed_requests?: number;
}

export interface LoginCredentials {
  email: string; // backend expects 'email' field
  password: string;
}

export interface RegisterData {
  email_or_phone: string;
  password: string;
  username: string;
  role: 'buyer' | 'master';
}

export interface VerifySMSData {
  phone: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;              // Backend returns "token"
  access_token?: string;      // Fallback if backend sends "access_token"
  refresh_token?: string;
  expires_in?: number;
}

// Query Keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
};

// Get current user
export function useCurrentUser(
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<User, Error>({
    queryKey: authKeys.user,
    queryFn: () => api.get<User>('/users/me'),
    retry: false,
    ...options,
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (data) => {
      
      // Save tokens using unified token management
      // Backend returns "token" not "access_token"
      const accessToken = data.access_token || data.token;
      setTokens(accessToken, data.refresh_token);
      
      // Update api with new token
      // Token is automatically set via interceptors
      
      // Set user in cache
      queryClient.setQueryData(authKeys.user, data.user);
      
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      // Save tokens using unified token management
      // Backend returns "token" not "access_token"
      const accessToken = data.access_token || data.token;
      setTokens(accessToken, data.refresh_token);
      
      // Update api with new token
      // Token is automatically set via interceptors
      
      // Set user in cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
}

// Verify SMS mutation
export function useVerifySMS() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, VerifySMSData>({
    mutationFn: async (data: VerifySMSData) => {
      return api.post<AuthResponse>('/auth/verify-sms', data);
    },
    onSuccess: (data) => {
      // Save tokens using unified token management
      // Backend returns "token" not "access_token"
      const accessToken = data.access_token || data.token;
      setTokens(accessToken, data.refresh_token);
      
      // Update api with new token
      // Token is automatically set via interceptors
      
      // Set user in cache
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post<void>('/auth/logout');
    },
    onSuccess: () => {
      // Clear tokens using unified token management
      clearTokens();
      
      // Token cleared via interceptors
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
}

// Refresh token
export function useRefreshToken() {
  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post<void>('/auth/refresh');
    },
    onSuccess: () => {
      // Token is refreshed via HttpOnly cookie by server
      // No client-side action needed
    },
  });
}

// Get user profile (alias for useCurrentUser)
export function useProfile(
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<User, Error>({
    queryKey: authKeys.profile,
    queryFn: () => api.get<User>('/users/me'),
    retry: false,
    ...options,
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User> & { avatar?: File }>({
    mutationFn: async (data: Partial<User> & { avatar?: File }) => {
      // Upload avatar first if provided
      if (data.avatar) {
        const formData = new FormData();
        formData.append('avatar', data.avatar);
        await api.postForm('/users/me/avatar', formData);
      }
      
      // Then update profile (without avatar field)
      const { avatar, ...profileData } = data;
      return api.put<User>('/users/me', profileData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

// Composite hook for auth (combines current user with logout)
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser()
  const logoutMutation = useLogout()
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}

