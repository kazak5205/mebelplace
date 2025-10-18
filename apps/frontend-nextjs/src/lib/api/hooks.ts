/**
 * React Hooks for MebelPlace API
 * Custom hooks for easy API integration in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { apiService } from '@/services/api';

// Generic hooks
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialPage: number = 1,
  limit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(pageNum, limit);
      if (response.success) {
        const newData = response.data.data;
        setData(prev => append ? [...prev, ...newData] : newData);
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
      } else {
        setError(response.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiCall, limit]);

  useEffect(() => {
    loadPage(initialPage, false);
  }, [loadPage, initialPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPage(page + 1, true);
    }
  }, [loading, hasMore, page, loadPage]);

  const refresh = useCallback(() => {
    loadPage(1, false);
  }, [loadPage]);

  return { data, loading, error, hasMore, loadMore, refresh, page };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email_or_phone: string, password: string) => {
    const response = await apiService.login(email_or_phone, password);
    if (response.access_token) {
      apiService.setToken(response.access_token);
      setUser(response.user);
      return { success: true, data: response };
    }
    return { success: false, error: 'Login failed' };
  }, []);

  const register = useCallback(async (data: {
    email_or_phone: string;
    password: string;
    username?: string;
  }) => {
    const response = await apiService.register(data);
    return { success: true, data: response };
  }, []);

  const logout = useCallback(async () => {
    apiService.logout();
    setUser(null);
  }, []);

  const verifySMS = useCallback(async (phone: string, code: string) => {
    // TODO: Implement SMS verification
    return { success: false, error: 'SMS verification not implemented' };
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    // TODO: Implement email verification
    return { success: false, error: 'Email verification not implemented' };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiService.setToken(token);
      // TODO: Implement getMe method
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    verifySMS,
    verifyEmail,
    isAuthenticated: !!user,
  };
}

// User hooks
export function useUser(id?: string) {
  return useApi(() => id ? apiClient.getUser(id) : apiClient.getMe());
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateProfile(data);
      if (!response.success) {
        setError(response.error || 'Failed to update profile');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading, error };
}

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.uploadAvatar(file);
      if (!response.success) {
        setError(response.error || 'Failed to upload avatar');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadAvatar, loading, error };
}

// Video hooks
export function useVideoFeed(page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getVideoFeed({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useVideoComments(videoId: string, page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getVideoComments(videoId, { page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useUploadVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File, data: { title: string; description?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.uploadVideo(file, data);
      if (!response.success) {
        setError(response.error || 'Failed to upload video');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadVideo, loading, error };
}

export function useVideoActions() {
  const [loading, setLoading] = useState(false);

  const likeVideo = useCallback(async (videoId: string) => {
    setLoading(true);
    try {
      return await apiClient.likeVideo(videoId);
    } finally {
      setLoading(false);
    }
  }, []);

  const unlikeVideo = useCallback(async (videoId: string) => {
    setLoading(true);
    try {
      return await apiClient.unlikeVideo(videoId);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (videoId: string, text: string, parentId?: number) => {
    setLoading(true);
    try {
      return await apiClient.addVideoComment(videoId, { text, parent_id: parentId });
    } finally {
      setLoading(false);
    }
  }, []);

  return { likeVideo, unlikeVideo, addComment, loading };
}

// Request hooks
export function useRequests(page: number = 1, limit: number = 20, category?: string) {
  return usePaginatedApi((p, l) => apiClient.getRequests({ page: p, limit: l, category }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useRequest(id: string) {
  return useApi(() => apiClient.getRequest(id), [id]);
}

export function useRequestProposals(id: string, page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getRequestProposals(id, { page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useCreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (data: {
    title: string;
    description: string;
    category: string;
    budget?: number;
    region?: string;
    photos?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createRequest(data);
      if (!response.success) {
        setError(response.error || 'Failed to create request');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRequest, loading, error };
}

// Hook for uploading files
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);
      
      // For now, return a mock URL - this should be replaced with actual file upload logic
      const mockUrl = `https://mebelplace.com.kz/uploads/${Date.now()}_${file.name}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploadFile, uploading, error };
}

// Wallet hooks
export function useWalletBalance() {
  return useApi(async () => {
    // Mock implementation - should be replaced with real API call
    return {
      success: true,
      data: {
        available: 15000,
        pending: 5000,
        frozen: 0,
        total: 20000
      }
    };
  });
}

export function useWalletTransactions() {
  return useApi(async () => {
    // Mock implementation - should be replaced with real API call
    return {
      success: true,
      data: [
        {
          id: '1',
          type: 'income',
          amount: 15000,
          description: 'Оплата за заказ #123',
          category: 'order_payment',
          status: 'completed',
          createdAt: new Date().toISOString(),
          reference: 'ORDER_123'
        },
        {
          id: '2',
          type: 'expense',
          amount: 5000,
          description: 'Вывод средств',
          category: 'withdrawal',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          reference: 'WITHDRAWAL_456'
        }
      ]
    };
  });
}

export function useWalletStats() {
  return useApi(async () => {
    // Mock implementation - should be replaced with real API call
    return {
      success: true,
      data: {
        totalIncome: 50000,
        totalExpense: 15000,
        monthlyIncome: 25000,
        monthlyExpense: 8000,
        transactionCount: 12
      }
    };
  });
}

export function useCreateProposal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProposal = useCallback(async (requestId: string, data: {
    message: string;
    price: number;
    photos?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createProposal(requestId, data);
      if (!response.success) {
        setError(response.error || 'Failed to create proposal');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProposal, loading, error };
}

// Chat hooks
export function useChats(page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getChats({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useChatMessages(chatId: string, page: number = 1, limit: number = 50) {
  return usePaginatedApi((p, l) => apiClient.getChatMessages(chatId, { page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChat = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createChat({ user_id: userId });
      if (!response.success) {
        setError(response.error || 'Failed to create chat');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createChat, loading, error };
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (chatId: string, text: string, type: 'text' | 'image' | 'video' | 'file' = 'text', fileUrl?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.sendMessage(chatId, { text, type, file_url: fileUrl });
      if (!response.success) {
        setError(response.error || 'Failed to send message');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendMessage, loading, error };
}

// Channel hooks
export function useChannels(page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getChannels({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useChannelPosts(channelId: string, page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getChannelPosts(channelId, { page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useChannelActions() {
  const [loading, setLoading] = useState(false);

  const subscribe = useCallback(async (channelId: string) => {
    setLoading(true);
    try {
      return await apiClient.subscribeToChannel(channelId);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (channelId: string) => {
    setLoading(true);
    try {
      return await apiClient.unsubscribeFromChannel(channelId);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (channelId: string, content: string, mediaUrls?: string[]) => {
    setLoading(true);
    try {
      return await apiClient.createChannelPost(channelId, { content, media_urls: mediaUrls });
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribe, unsubscribe, createPost, loading };
}

// Search hooks
export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, type: 'all' | 'users' | 'masters' | 'requests' = 'all', page: number = 1, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.search({ q: query, type, page, limit });
      if (response.success) {
        setResults((response.data as any).data || []);
      } else {
        setError(response.error || 'Search failed');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string, page: number = 1, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.searchUsers({ q: query, page, limit });
      if (response.success) {
        setResults((response.data as any).data || []);
      } else {
        setError(response.error || 'User search failed');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMasters = useCallback(async (query: string, location?: string, page: number = 1, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.searchMasters({ q: query, location, page, limit });
      if (response.success) {
        setResults((response.data as any).data || []);
      } else {
        setError(response.error || 'Master search failed');
      }
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, searchUsers, searchMasters, results, loading, error };
}

// Notification hooks
export function useNotifications(page: number = 1, limit: number = 20, unread?: boolean) {
  return usePaginatedApi((p, l) => apiClient.getNotifications({ page: p, limit: l, unread }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useNotificationActions() {
  const [loading, setLoading] = useState(false);

  const markAsRead = useCallback(async (id: string) => {
    setLoading(true);
    try {
      return await apiClient.markNotificationAsRead(id);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    try {
      return await apiClient.markAllNotificationsAsRead();
    } finally {
      setLoading(false);
    }
  }, []);

  return { markAsRead, markAllAsRead, loading };
}

// Subscription hooks
export function useSubscriptions() {
  return useApi(() => apiClient.getMySubscriptions());
}

export function useSubscriptionActions() {
  const [loading, setLoading] = useState(false);

  const subscribe = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      return await apiClient.subscribeToUser(userId);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      return await apiClient.unsubscribeFromUser(userId);
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribe, unsubscribe, loading };
}

// Analytics hooks
export function useUserAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useApi(() => apiClient.getUserAnalytics({ period }), [period]);
}

export function usePlatformAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useApi(() => apiClient.getPlatformAnalytics({ period }), [period]);
}

// Gamification hooks
export function useUserLevel() {
  return useApi(() => apiClient.getUserLevel());
}

export function useAchievements() {
  return useApi(() => apiClient.getAchievements());
}

export function useLeaderboard(page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getLeaderboard({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

// Call hooks
export function useCallHistory(page: number = 1, limit: number = 20) {
  return usePaginatedApi((p, l) => apiClient.getCallHistory({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, page, limit);
}

export function useActiveCalls() {
  return useApi(() => apiClient.getActiveCalls());
}

export function useCallActions() {
  const [loading, setLoading] = useState(false);

  const initiateCall = useCallback(async (userId: string, type: 'video' | 'audio' = 'video') => {
    setLoading(true);
    try {
      return await apiClient.initiateCall({ userId, type });
    } finally {
      setLoading(false);
    }
  }, []);

  const answerCall = useCallback(async (callId: string) => {
    setLoading(true);
    try {
      return await apiClient.answerCall(callId);
    } finally {
      setLoading(false);
    }
  }, []);

  const endCall = useCallback(async (callId: string) => {
    setLoading(true);
    try {
      return await apiClient.endCall(callId);
    } finally {
      setLoading(false);
    }
  }, []);

  return { initiateCall, answerCall, endCall, loading };
}

// Additional hooks for pages that need them

export function useUserVideos(userId?: number) {
  return usePaginatedApi((p, l) => apiClient.getVideoFeed({ user_id: userId, page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, 1, 20);
}

export function useMyOrders() {
  return usePaginatedApi((p, l) => apiClient.getMyOrders({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, 1, 20);
}

export function useMyRequests() {
  return usePaginatedApi((p, l) => apiClient.getRequests({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, 1, 20);
}

export function useMyProposals() {
  return usePaginatedApi((p, l) => apiClient.getMyProposals({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, 1, 20);
}

export function useVideoAnalytics() {
  return useApi(() => apiClient.getUserAnalytics());
}

export function useRequestAnalytics() {
  return useApi(() => apiClient.getUserAnalytics());
}

export function useMyChannel() {
  return useApi(() => apiClient.getMyChannel());
}

export function useSupportTickets() {
  return usePaginatedApi((p, l) => apiClient.getSupportTickets({ page: p, limit: l }) as Promise<ApiResponse<PaginatedResponse<any>>>, 1, 20);
}

export function useCreateSupportTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCallback(async (data: { subject: string; message: string; priority: string }) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.createSupportTicket(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTicket, loading, error };
}