// Единый API service для client и mobile
// Используется с axios

import { getApiConfig, getCurrentEnvironment } from '../config';
import type { ApiResponse, PaginationResponse } from '../types';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private getToken?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config?: ApiClientConfig) {
    const apiConfig = getApiConfig(getCurrentEnvironment());
    
    this.baseURL = config?.baseURL || apiConfig.API_URL;
    this.timeout = config?.timeout || apiConfig.TIMEOUT;
    this.headers = config?.headers || {
      'Content-Type': 'application/json',
    };
    this.getToken = config?.getToken;
    this.onUnauthorized = config?.onUnauthorized;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers = { ...this.headers };
    
    if (this.getToken) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      
      const error = await response.json().catch(() => ({
        success: false,
        message: response.statusText,
      }));
      
      throw new Error(error.message || 'Request failed');
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const headers = this.getAuthHeaders();
    // Remove Content-Type for FormData (browser will set it automatically with boundary)
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VERIFY: '/auth/verify',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
  },
  
  // Videos
  VIDEOS: {
    LIST: '/videos',
    GET: (id: string) => `/videos/${id}`,
    CREATE: '/videos',
    UPDATE: (id: string) => `/videos/${id}`,
    DELETE: (id: string) => `/videos/${id}`,
    LIKE: (id: string) => `/videos/${id}/like`,
    COMMENT: (id: string) => `/videos/${id}/comments`,
    TRENDING: '/videos/trending',
    MASTER: (masterId: string) => `/videos/master/${masterId}`,
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    GET: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
    RESPOND: (id: string) => `/orders/${id}/responses`,
    RESPONSES: (id: string) => `/orders/${id}/responses`,
    ACCEPT: (id: string, responseId: string) => `/orders/${id}/responses/${responseId}/accept`,
  },
  
  // Chats
  CHATS: {
    LIST: '/chats',
    GET: (id: string) => `/chats/${id}`,
    CREATE: '/chats',
    MESSAGES: (id: string) => `/chats/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/chats/${id}/messages`,
    MARK_READ: (id: string) => `/chats/${id}/read`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    VIDEOS: '/admin/videos',
    ORDERS: '/admin/orders',
    STATS: '/admin/stats',
    AUDIT: '/admin/audit-log',
  },
} as const;

// Helper functions for common API operations
// ============================================================================
// API SERVICE FACTORIES
// ============================================================================

/**
 * Video API methods
 */
export const videoApi = (client: ApiClient) => ({
  // Feed and list
  list: (params?: any) => client.get('/videos/feed', params),
  get: (id: string) => client.get(`/videos/${id}`),
  trending: () => client.get('/videos/trending'),
  
  // Upload and manage
  upload: (data: FormData, onProgress?: (p: number) => void) => 
    client.upload('/videos/upload', data, onProgress),
  update: (id: string, data: any) => client.put(`/videos/${id}`, data),
  delete: (id: string) => client.delete(`/videos/${id}`),
  
  // Interactions
  like: (id: string) => client.post(`/videos/${id}/like`),
  unlike: (id: string) => client.delete(`/videos/${id}/like`),
  recordView: (id: string, data: { durationWatched: number; completionRate: number }) => 
    client.post(`/videos/${id}/view`, data),
  
  // Comments
  getComments: (id: string, params?: any) => 
    client.get(`/videos/${id}/comments`, params),
  addComment: (videoId: string, content: string, parentId?: string) =>
    client.post(`/videos/${videoId}/comment`, { content, parent_id: parentId }),
  likeComment: (commentId: string) => 
    client.post(`/videos/comments/${commentId}/like`),
  unlikeComment: (commentId: string) => 
    client.delete(`/videos/comments/${commentId}/like`),
});

/**
 * Order API methods
 */
export const orderApi = (client: ApiClient) => ({
  // List and get
  list: (params?: any) => client.get('/orders/feed', params),
  get: (id: string) => client.get(`/orders/${id}`),
  
  // Create and manage
  create: (data: any) => client.post('/orders/create', data),
  update: (id: string, data: any) => client.put(`/orders/${id}`, data),
  delete: (id: string) => client.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) => 
    client.put(`/orders/${id}/status`, { status }),
  
  // Responses
  createResponse: (orderId: string, data: any) => 
    client.post(`/orders/${orderId}/responses`, data),
  getResponses: (orderId: string) => 
    client.get(`/orders/${orderId}/responses`),
  acceptResponse: (orderId: string, responseId: string) => 
    client.post(`/orders/${orderId}/accept`, { responseId }),
  rejectResponse: (orderId: string, responseId: string) => 
    client.put(`/orders/${orderId}/responses/${responseId}/reject`),
  
  // Images
  uploadImages: (data: FormData) => 
    client.upload('/orders/upload-images', data),
  
  // Regions
  getRegions: () => client.get('/orders/regions'),
});

/**
 * Chat API methods
 */
export const chatApi = (client: ApiClient) => ({
  // List and get
  list: () => client.get('/chats/list'),
  get: (id: string) => client.get(`/chats/${id}`),
  
  // Create
  create: (participantId: string) => 
    client.post('/chats/create', { participants: [participantId] }),
  createWithUser: (userId: string) => 
    client.post('/chats/create-with-user', { participantId: userId }),
  
  // Messages
  getMessages: (id: string, params?: any) => 
    client.get(`/chats/${id}/messages`, params),
  sendMessage: (id: string, content: string, type: string = 'text', metadata?: any) => 
    client.post(`/chats/${id}/messages`, { content, type, metadata }),
  
  // Read status
  markAsRead: (chatId: string, messageId: string) => 
    client.put(`/chats/${chatId}/messages/${messageId}/read`),
  markChatAsRead: (id: string) => 
    client.put(`/chats/${id}/read`),
  
  // File upload
  uploadFile: (chatId: string, file: FormData) => 
    client.upload(`/chats/${chatId}/upload`, file),
  
  // Delete and block
  deleteChat: (id: string) => 
    client.delete(`/chats/${id}`),
  blockUser: (chatId: string, reason?: string) => 
    client.post(`/chats/${chatId}/block`, { reason }),
  
  // Support
  getSupportChat: () => 
    client.get('/chats/support'),
  sendSupportMessage: (content: string, type: string = 'text') => 
    client.post('/chats/support/messages', { content, type }),
});

/**
 * Subscription API methods
 */
export const subscriptionApi = (client: ApiClient) => ({
  get: (): Promise<any> => client.get('/subscriptions'),
  subscribe: (channelId: string): Promise<any> => client.post('/subscriptions', { channelId }),
  unsubscribe: (channelId: string): Promise<any> => client.delete(`/subscriptions/${channelId}`),
  getCount: (masterId: string): Promise<any> => client.get(`/subscriptions/count/${masterId}`),
});

/**
 * User API methods
 */
export const userApi = (client: ApiClient) => ({
  get: (id: string): Promise<any> => client.get(`/users/${id}`),
  update: (id: string, data: any): Promise<any> => client.put(`/users/${id}`, data),
  delete: (id: string): Promise<void> => client.delete(`/users/${id}`),
  uploadAvatar: (id: string, file: FormData): Promise<any> => 
    client.upload(`/users/${id}/avatar`, file),
});

/**
 * Auth API methods
 */
export const authApi = (client: ApiClient) => ({
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response: any = await client.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return { token: response.accessToken || response.token, user: response.user };
  },
  register: async (data: { email: string; password: string; name: string; role: string }): Promise<{ token: string; user: any }> => {
    const response: any = await client.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return { token: response.accessToken || response.token, user: response.user };
  },
  logout: (): Promise<void> => client.post(API_ENDPOINTS.AUTH.LOGOUT),
  getMe: (): Promise<any> => client.get(API_ENDPOINTS.AUTH.ME),
  verify: (token: string): Promise<any> => client.post(API_ENDPOINTS.AUTH.VERIFY, { token }),
  refresh: (): Promise<{ token: string }> => client.post(API_ENDPOINTS.AUTH.REFRESH),
});

/**
 * Notification API methods
 */
export const notificationApi = (client: ApiClient) => ({
  list: () => client.get(API_ENDPOINTS.NOTIFICATIONS.LIST),
  get: (id: string) => client.get(API_ENDPOINTS.NOTIFICATIONS.GET(id)),
  markRead: (id: string) => client.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  markAllRead: () => client.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  delete: (id: string) => client.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),
});

/**
 * Admin API methods
 */
export const adminApi = (client: ApiClient) => ({
  users: {
    list: (params?: any) => client.get(API_ENDPOINTS.ADMIN.USERS, params),
  },
  videos: {
    list: (params?: any) => client.get(API_ENDPOINTS.ADMIN.VIDEOS, params),
  },
  orders: {
    list: (params?: any) => client.get(API_ENDPOINTS.ADMIN.ORDERS, params),
  },
  stats: () => client.get(API_ENDPOINTS.ADMIN.STATS),
  auditLog: (params?: any) => client.get(API_ENDPOINTS.ADMIN.AUDIT, params),
});

// ============================================================================
// LEGACY HELPERS (для обратной совместимости)
// ============================================================================

export const createApiHelpers = (apiClient: ApiClient) => ({
  auth: authApi(apiClient),
  videos: videoApi(apiClient),
  orders: orderApi(apiClient),
  chats: chatApi(apiClient),
  users: userApi(apiClient),
  subscriptions: subscriptionApi(apiClient),
  notifications: notificationApi(apiClient),
  admin: adminApi(apiClient),
});

export default ApiClient;
