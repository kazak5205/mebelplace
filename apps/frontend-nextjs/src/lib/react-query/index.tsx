import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 3;
          }
          return false;
        }
        // Retry on 5xx errors and network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry on 5xx errors and network errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    userProfile: (userId: number) => ['auth', 'userProfile', userId] as const,
  },
  
  // Videos
  videos: {
    all: ['videos'] as const,
    feed: (params?: any) => ['videos', 'feed', params] as const,
    byId: (id: number) => ['videos', id] as const,
    comments: (videoId: number, page?: number) => ['videos', videoId, 'comments', page] as const,
    userVideos: (userId: number, page?: number) => ['videos', 'user', userId, page] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    byId: (id: number) => ['users', id] as const,
    blocked: ['users', 'blocked'] as const,
    search: (query: string) => ['users', 'search', query] as const,
  },
  
  // Chats
  chats: {
    all: ['chats'] as const,
    byId: (id: number) => ['chats', id] as const,
    messages: (chatId: number, page?: number) => ['chats', chatId, 'messages', page] as const,
  },
  
  // Requests
  requests: {
    all: (params?: any) => ['requests', params] as const,
    byId: (id: number) => ['requests', id] as const,
    offers: (requestId: number) => ['requests', requestId, 'offers'] as const,
    userRequests: (userId: number, page?: number) => ['requests', 'user', userId, page] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    settings: ['notifications', 'settings'] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },
  
  // Calls
  calls: {
    history: ['calls', 'history'] as const,
    active: ['calls', 'active'] as const,
    webrtcToken: ['calls', 'webrtcToken'] as const,
  },
  
  // Analytics
  analytics: {
    user: ['analytics', 'user'] as const,
    platform: ['analytics', 'platform'] as const,
    revenue: ['analytics', 'revenue'] as const,
    engagement: ['analytics', 'engagement'] as const,
  },
  
  // Gamification
  gamification: {
    userLevel: ['gamification', 'userLevel'] as const,
    achievements: ['gamification', 'achievements'] as const,
    leaderboard: ['gamification', 'leaderboard'] as const,
    rules: ['gamification', 'rules'] as const,
  },
  
  // Map
  map: {
    geoObjects: (params?: any) => ['map', 'geoObjects', params] as const,
    byId: (id: number) => ['map', 'geoObjects', id] as const,
    reviews: (geoObjectId: number) => ['map', 'geoObjects', geoObjectId, 'reviews'] as const,
    search: (query: string) => ['map', 'search', query] as const,
  },
  
  // Payments
  payments: {
    providers: ['payments', 'providers'] as const,
    transactions: (params?: any) => ['payments', 'transactions', params] as const,
  },
  
  // AR/3D
  ar: {
    models: (params?: any) => ['ar', 'models', params] as const,
    byId: (id: number) => ['ar', 'models', id] as const,
    versions: (modelId: number) => ['ar', 'models', modelId, 'versions'] as const,
    search: (query: string) => ['ar', 'models', 'search', query] as const,
  },
  
  // Stories
  stories: {
    all: (params?: any) => ['stories', params] as const,
    userStories: (userId: number, page?: number) => ['stories', 'user', userId, page] as const,
  },
  
  // Referrals
  referrals: {
    code: ['referrals', 'code'] as const,
    stats: ['referrals', 'stats'] as const,
  },
};

// React Query Provider Component
interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// Query invalidation helpers
export const invalidateQueries = {
  // Auth
  auth: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
  },
  
  // Videos
  videos: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
  },
  video: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.videos.byId(id) });
  },
  videoComments: (videoId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.videos.comments(videoId) });
  },
  
  // Users
  users: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  user: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.byId(id) });
  },
  
  // Chats
  chats: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
  },
  chat: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.chats.byId(id) });
  },
  chatMessages: (chatId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
  },
  
  // Requests
  requests: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.all() });
  },
  request: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(id) });
  },
  requestOffers: (requestId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.offers(requestId) });
  },
  
  // Notifications
  notifications: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
  notificationSettings: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings });
  },
  
  // Calls
  calls: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.calls.history });
  },
  
  // Analytics
  analytics: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.user });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.platform });
  },
  
  // Gamification
  gamification: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gamification.userLevel });
    queryClient.invalidateQueries({ queryKey: queryKeys.gamification.achievements });
    queryClient.invalidateQueries({ queryKey: queryKeys.gamification.leaderboard });
  },
  
  // Map
  map: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.map.geoObjects() });
  },
  geoObject: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.map.byId(id) });
  },
  
  // Payments
  payments: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.providers });
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.transactions() });
  },
  
  // AR/3D
  ar: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ar.models() });
  },
  model: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ar.byId(id) });
  },
  
  // Stories
  stories: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stories.all() });
  },
  
  // Referrals
  referrals: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.referrals.code });
    queryClient.invalidateQueries({ queryKey: queryKeys.referrals.stats });
  },
};

export default queryClient;
