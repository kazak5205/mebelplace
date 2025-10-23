/**
 * Mobile API service using shared API utilities
 * 
 * This service is synchronized with the web version and uses shared API client
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient, videoApi, orderApi, chatApi, userApi, authApi, notificationApi } from '@shared/utils/api';
import { API_CONFIG } from '../config/environment';
import { navigateToLogin } from '../utils/navigationRef';

// Create API client with AsyncStorage token management
export const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch {
      return null;
    }
  },
  onUnauthorized: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      // Навигируем на экран логина
      navigateToLogin();
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  },
});

// Create API service instances (for direct use)
import { subscriptionApi, pushApi } from '@shared/utils/api';

const video = videoApi(apiClient);
const order = orderApi(apiClient);
const chat = chatApi(apiClient);
const user = userApi(apiClient);
const auth = authApi(apiClient);
const notification = notificationApi(apiClient);
const subscription = subscriptionApi(apiClient);
const push = pushApi(apiClient);

// Export individual service APIs for direct use
export const api = {
  video,
  order,
  chat,
  user,
  auth,
  notification,
  subscription,
  push,
};

// Legacy-compatible API service class
// Delegates to new services but maintains old interface
class ApiService {
  // Token management
  async setAuthToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async clearAuthToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }
  
  // Direct HTTP methods for backward compatibility
  async get(url: string, params?: any) {
    const result = await apiClient.get(url, params);
    return { success: true, data: result, message: 'Success', timestamp: new Date().toISOString() };
  }
  
  async post(url: string, data?: any) {
    const result = await apiClient.post(url, data);
    return { success: true, data: result, message: 'Success', timestamp: new Date().toISOString() };
  }
  
  async put(url: string, data?: any) {
    const result = await apiClient.put(url, data);
    return { success: true, data: result, message: 'Success', timestamp: new Date().toISOString() };
  }
  
  async delete(url: string) {
    const result = await apiClient.delete(url);
    return { success: true, data: result, message: 'Success', timestamp: new Date().toISOString() };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const result = await auth.login(email, password);
    if (result.token) {
      await this.setAuthToken(result.token);
    }
    return { success: true, data: result, message: 'Login successful', timestamp: new Date().toISOString() };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role: 'client' | 'master';
  }) {
    const result = await auth.register({
      email: userData.email,
      password: userData.password,
      name: userData.username,
      role: userData.role,
    });
    if (result.token) {
      await this.setAuthToken(result.token);
    }
    return { success: true, data: result, message: 'Registration successful', timestamp: new Date().toISOString() };
  }

  async updateProfile(userData: any) {
    const currentUser = await auth.getMe();
    const result = await user.update(currentUser.id, userData);
    return { success: true, data: result, message: 'Profile updated', timestamp: new Date().toISOString() };
  }

  // Notifications endpoints
  async getNotifications(page: number = 1, limit: number = 20) {
    const result = await notification.list();
    return { success: true, data: result, message: 'Notifications fetched', timestamp: new Date().toISOString() };
  }

  async markNotificationAsRead(notificationId: string) {
    const result = await notification.markRead(notificationId);
    return { success: true, data: result, message: 'Notification marked as read', timestamp: new Date().toISOString() };
  }

  async markAllNotificationsAsRead() {
    const result = await notification.markAllRead();
    return { success: true, data: result, message: 'All notifications marked as read', timestamp: new Date().toISOString() };
  }

  async getUnreadCount() {
    // This would need a specific endpoint on backend
    const notifications = await notification.list();
    const unreadCount = Array.isArray(notifications) 
      ? notifications.filter((n: any) => !n.read).length 
      : 0;
    return { success: true, data: { count: unreadCount }, message: 'Unread count fetched', timestamp: new Date().toISOString() };
  }

  // Video endpoints - delegate to videoService
  async getVideos(page: number = 1, limit: number = 10) {
    // Import dynamically to avoid circular dependency
    const { videoService } = await import('./videoService');
    return videoService.getVideos({ page, limit });
  }

  async getVideoById(id: string) {
    const { videoService } = await import('./videoService');
    return videoService.getVideo(id);
  }

  async likeVideo(id: string) {
    const { videoService } = await import('./videoService');
    return videoService.likeVideo(id);
  }

  async unlikeVideo(id: string) {
    const { videoService } = await import('./videoService');
    return videoService.unlikeVideo(id);
  }

  async addComment(videoId: string, text: string) {
    const { videoService } = await import('./videoService');
    return videoService.addComment(videoId, text);
  }

  async getComments(videoId: string, page: number = 1, limit: number = 20) {
    const { videoService } = await import('./videoService');
    return videoService.getComments(videoId, { page, limit });
  }

  // Upload endpoints
  async uploadVideo(videoData: FormData) {
    const { videoService } = await import('./videoService');
    return videoService.uploadVideo(videoData);
  }

  async uploadImage(imageData: FormData) {
    const result = await apiClient.upload('/upload/image', imageData);
    return { success: true, data: result, message: 'Image uploaded', timestamp: new Date().toISOString() };
  }

  // Orders endpoints - delegate to orderService
  async getOrders(page: number = 1, limit: number = 10) {
    const { orderService } = await import('./orderService');
    return orderService.getOrders({ page, limit });
  }

  async getOrderById(id: string) {
    const { orderService } = await import('./orderService');
    return orderService.getOrder(id);
  }

  async createOrder(orderData: any) {
    const { orderService } = await import('./orderService');
    return orderService.createOrder(orderData);
  }

  async respondToOrder(orderId: string, responseData: any) {
    const { orderService } = await import('./orderService');
    return orderService.createResponse(orderId, responseData);
  }

  async acceptOrderResponse(orderId: string, responseId: string) {
    const { orderService } = await import('./orderService');
    return orderService.acceptResponse(orderId, responseId);
  }

  // Messages endpoints - delegate to chatService
  async getMessages(chatId: string, page: number = 1, limit: number = 50) {
    const { chatService } = await import('./chatService');
    return chatService.getMessages(chatId, { page, limit });
  }

  async sendMessage(chatId: string, messageData: any) {
    const { chatService } = await import('./chatService');
    return chatService.sendMessage(
      chatId,
      messageData.content || messageData.text,
      messageData.type || 'text',
      messageData.metadata
    );
  }

  // Chats endpoints - delegate to chatService
  async getChats() {
    const { chatService } = await import('./chatService');
    return chatService.getChats();
  }

  async getChatById(id: string) {
    const { chatService } = await import('./chatService');
    return chatService.getChat(id);
  }

  async createChat(participantId: string) {
    const { chatService } = await import('./chatService');
    return chatService.createChat(participantId);
  }
}

export const apiService = new ApiService();

// Re-export services for backward compatibility
export { videoService } from './videoService';
export { orderService } from './orderService';
export { chatService } from './chatService';
export { authService } from './authService';
export { userService } from './userService';
