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
  getMasterVideos: (masterId: string, params?: any) => 
    client.get(`/videos/master/${masterId}`, params),
  getBookmarked: (params?: any) => client.get('/videos/bookmarked', params),
  
  // Upload and manage
  upload: (data: FormData, onProgress?: (p: number) => void) => 
    client.upload('/videos/upload', data, onProgress),
  update: (id: string, data: any) => client.put(`/videos/${id}`, data),
  delete: (id: string) => client.delete(`/videos/remove/${id}`),
  
  // Interactions
  like: (id: string) => client.post(`/videos/${id}/like`),
  unlike: (id: string) => client.delete(`/videos/${id}/like`),
  recordView: (id: string, data: { durationWatched: number; completionRate: number }) => 
    client.post(`/videos/${id}/view`, data),
  
  // Bookmarks
  addBookmark: (id: string) => client.post(`/videos/${id}/bookmark`),
  removeBookmark: (id: string) => client.delete(`/videos/${id}/bookmark`),
  
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
    client.post(`/orders/${orderId}/response`, data),
  getResponses: (orderId: string) => 
    client.get(`/orders/${orderId}/responses`),
  acceptResponse: (orderId: string, responseId: string) => 
    client.post(`/orders/${orderId}/accept`, { responseId }),
  rejectResponse: (orderId: string, responseId: string) => 
    client.post(`/orders/${orderId}/reject`, { responseId }),
  
  // Images
  uploadImages: (data: FormData) => 
    client.upload('/orders/upload-images', data),
  
  // Regions and categories
  getRegions: () => client.get('/orders/regions'),
  getCategories: () => client.get('/orders/categories'),
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
  
  // Chat management
  leaveChat: (id: string) => 
    client.post(`/chats/${id}/leave`),
  addParticipant: (chatId: string, participantId: string) => 
    client.post(`/chats/${chatId}/add-participant`, { participantId }),
  
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
  
  // Admin
  getAdminSupportChats: (params?: any) => 
    client.get('/chats/admin/support-chats', params),
});

/**
 * Subscription API methods
 */
export const subscriptionApi = (client: ApiClient) => ({
  list: (): Promise<any> => client.get('/subscriptions'),
  subscribe: (masterId: string): Promise<any> => client.post(`/subscriptions/${masterId}`),
  unsubscribe: (masterId: string): Promise<any> => client.delete(`/subscriptions/${masterId}`),
  checkStatus: (masterId: string): Promise<any> => client.get(`/subscriptions/${masterId}`),
  getCount: (masterId: string): Promise<any> => client.get(`/subscriptions/count/${masterId}`),
});

/**
 * Push Notification API methods
 */
export const pushApi = (client: ApiClient) => ({
  getVapidKey: (): Promise<any> => client.get('/push/vapid-key'),
  subscribe: (subscription: any): Promise<any> => client.post('/push/subscribe', { subscription }),
  unsubscribe: (endpoint: string): Promise<any> => client.delete('/push/unsubscribe', endpoint),
  testPush: (title: string, message: string, data?: any): Promise<any> => 
    client.post('/push/test', { title, message, data }),
  getStats: (): Promise<any> => client.get('/push/stats'),
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
  // Login methods
  login: async (phone: string, password: string, smsCode?: string): Promise<{ token: string; user: any; refreshToken?: string }> => {
    const response: any = await client.post('/auth/login', { phone, password, smsCode });
    return { 
      token: response.accessToken || response.token, 
      refreshToken: response.refreshToken,
      user: response.user 
    };
  },
  simpleLogin: async (phone: string, password: string): Promise<{ token: string; user: any; refreshToken?: string }> => {
    const response: any = await client.post('/auth/simple-login', { phone, password });
    return { 
      token: response.accessToken || response.token,
      refreshToken: response.refreshToken,
      user: response.user 
    };
  },
  
  // Registration
  register: async (data: { 
    phone: string; 
    username: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
    role?: string 
  }): Promise<{ user: any }> => {
    const response: any = await client.post('/auth/register', data);
    return { user: response.user };
  },
  
  // SMS verification
  sendSms: (phone: string, password?: string): Promise<any> => 
    client.post('/auth/send-sms', { phone, password }),
  verifySms: (phone: string, code: string): Promise<any> => 
    client.post('/auth/verify-sms', { phone, code }),
  
  // Password reset
  forgotPassword: (phone: string): Promise<any> => 
    client.post('/auth/forgot-password', { phone }),
  resetPassword: (phone: string, smsCode: string, newPassword: string): Promise<any> => 
    client.post('/auth/reset-password', { phone, smsCode, newPassword }),
  
  // User profile
  logout: (refreshToken?: string): Promise<void> => 
    client.post('/auth/logout', { refreshToken }),
  getMe: (): Promise<any> => 
    client.get('/auth/me'),
  updateMe: (data: any): Promise<any> => 
    client.patch('/auth/me', data),
  
  // Avatar
  uploadAvatar: (file: FormData): Promise<any> => 
    client.upload('/auth/avatar', file),
  
  // Token refresh
  refresh: (refreshToken: string): Promise<{ token: string; user: any }> => 
    client.post('/auth/refresh', { refreshToken }),
});

/**
 * Notification API methods
 */
export const notificationApi = (client: ApiClient) => ({
  list: (params?: any) => client.get('/notifications', params),
  get: (id: string) => client.get(`/notifications/${id}`),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markRead: (id: string) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
  delete: (id: string) => client.delete(`/notifications/${id}`),
  testSms: (phone: string, message: string) => 
    client.post('/notifications/test-sms', { phone, message }),
  getSmsBalance: () => client.get('/notifications/sms-balance'),
});

/**
 * Order Status API methods
 */
export const orderStatusApi = (client: ApiClient) => ({
  changeStatus: (orderId: string, newStatus: string, reason?: string) => 
    client.post(`/order-status/${orderId}/change`, { newStatus, reason }),
  getHistory: (orderId: string) => 
    client.get(`/order-status/${orderId}/history`),
  getAvailableActions: (orderId: string) => 
    client.get(`/order-status/${orderId}/actions`),
});

/**
 * Admin API methods
 */
export const adminApi = (client: ApiClient) => ({
  // Dashboard and Analytics
  getDashboard: (params?: any) => client.get('/admin/dashboard', params),
  getVideoAnalytics: (params?: any) => client.get('/admin/analytics/videos', params),
  
  // Video Management
  videos: {
    list: (params?: any) => client.get('/admin/videos', params),
    upload: (data: FormData) => client.upload('/admin/videos/upload', data),
    updatePriority: (id: string, priorityOrder: number, isFeatured: boolean) => 
      client.put(`/admin/videos/${id}/priority`, { priorityOrder, isFeatured }),
    updateStatus: (id: string, isActive?: boolean, isPublic?: boolean) => 
      client.put(`/admin/videos/${id}/status`, { isActive, isPublic }),
    delete: (id: string) => client.delete(`/admin/videos/${id}`),
  },
  
  // User Management
  users: {
    list: (params?: any) => client.get('/admin/users', params),
    updateStatus: (id: string, isActive?: boolean, role?: string) => 
      client.put(`/admin/users/${id}/status`, { isActive, role }),
  },
  
  // Category Management
  categories: {
    list: () => client.get('/admin/categories'),
    create: (data: any) => client.post('/admin/categories', data),
    update: (id: string, data: any) => client.put(`/admin/categories/${id}`, data),
    delete: (id: string) => client.delete(`/admin/categories/${id}`),
  },
  
  // Audit Log
  auditLog: (params?: any) => client.get('/admin/audit-log', params),
});

// ============================================================================
// LEGACY HELPERS (для обратной совместимости)
// ============================================================================

export const createApiHelpers = (apiClient: ApiClient) => ({
  auth: authApi(apiClient),
  videos: videoApi(apiClient),
  orders: orderApi(apiClient),
  orderStatus: orderStatusApi(apiClient),
  chats: chatApi(apiClient),
  users: userApi(apiClient),
  subscriptions: subscriptionApi(apiClient),
  push: pushApi(apiClient),
  notifications: notificationApi(apiClient),
  admin: adminApi(apiClient),
});

export default ApiClient;
