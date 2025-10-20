/**
 * Mobile API service using shared API utilities
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
      // Навигируем на экран логина
      navigateToLogin();
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  },
});

// Create API service instances
const video = videoApi(apiClient);
const order = orderApi(apiClient);
const chat = chatApi(apiClient);
const user = userApi(apiClient);
const auth = authApi(apiClient);
const notification = notificationApi(apiClient);

// Legacy-compatible API service class
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
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
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

  // Video endpoints
  async getVideos(page: number = 1, limit: number = 10) {
    const result = await video.list({ page, limit });
    return { success: true, data: result, message: 'Videos fetched', timestamp: new Date().toISOString() };
  }

  async getVideoById(id: string) {
    const result = await video.get(id);
    return { success: true, data: result, message: 'Video fetched', timestamp: new Date().toISOString() };
  }

  async likeVideo(id: string) {
    const result = await video.like(id);
    return { success: true, data: result, message: 'Video liked', timestamp: new Date().toISOString() };
  }

  async unlikeVideo(id: string) {
    const result = await video.unlike(id);
    return { success: true, data: result, message: 'Video unliked', timestamp: new Date().toISOString() };
  }

  async addComment(videoId: string, text: string) {
    const result = await video.addComment(videoId, text);
    return { success: true, data: result, message: 'Comment added', timestamp: new Date().toISOString() };
  }

  async getComments(videoId: string, page: number = 1, limit: number = 20) {
    const result = await video.getComments(videoId, { page, limit });
    return { success: true, data: result, message: 'Comments fetched', timestamp: new Date().toISOString() };
  }

  // Upload endpoints
  async uploadVideo(videoData: FormData) {
    const result = await video.upload(videoData);
    return { success: true, data: result, message: 'Video uploaded', timestamp: new Date().toISOString() };
  }

  async uploadImage(imageData: FormData) {
    // Generic upload - would need specific endpoint
    const result = await apiClient.upload('/upload/image', imageData);
    return { success: true, data: result, message: 'Image uploaded', timestamp: new Date().toISOString() };
  }

  // Orders endpoints
  async getOrders(page: number = 1, limit: number = 10) {
    const result = await order.list({ page, limit });
    return { success: true, data: result, message: 'Orders fetched', timestamp: new Date().toISOString() };
  }

  async getOrderById(id: string) {
    const result = await order.get(id);
    return { success: true, data: result, message: 'Order fetched', timestamp: new Date().toISOString() };
  }

  async createOrder(orderData: any) {
    const result = await order.create(orderData);
    return { success: true, data: result, message: 'Order created', timestamp: new Date().toISOString() };
  }

  async respondToOrder(orderId: string, responseData: any) {
    const result = await order.createResponse(orderId, responseData);
    return { success: true, data: result, message: 'Response created', timestamp: new Date().toISOString() };
  }

  async acceptOrderResponse(orderId: string, responseId: string) {
    const result = await order.acceptResponse(orderId, responseId);
    return { success: true, data: result, message: 'Response accepted', timestamp: new Date().toISOString() };
  }

  // Messages endpoints
  async getMessages(chatId: string, page: number = 1, limit: number = 50) {
    const result = await chat.getMessages(chatId, { page, limit });
    return { success: true, data: result, message: 'Messages fetched', timestamp: new Date().toISOString() };
  }

  async sendMessage(chatId: string, messageData: any) {
    const result = await chat.sendMessage(
      chatId,
      messageData.content || messageData.text,
      messageData.type || 'text',
      messageData.metadata
    );
    return { success: true, data: result, message: 'Message sent', timestamp: new Date().toISOString() };
  }

  // Chats endpoints
  async getChats() {
    const result = await chat.list();
    return { success: true, data: result, message: 'Chats fetched', timestamp: new Date().toISOString() };
  }

  async getChatById(id: string) {
    const result = await chat.get(id);
    return { success: true, data: result, message: 'Chat fetched', timestamp: new Date().toISOString() };
  }

  async createChat(participantId: string) {
    const result = await chat.create(participantId);
    return { success: true, data: result, message: 'Chat created', timestamp: new Date().toISOString() };
  }
}

export const apiService = new ApiService();

// Export individual service APIs for direct use
export const api = {
  video,
  order,
  chat,
  user,
  auth,
  notification,
};
