import axios, { AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/environment';

const BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

class ApiService {
  private api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role: 'customer' | 'supplier';
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async updateProfile(userData: any): Promise<ApiResponse<any>> {
    const response = await this.api.put('/auth/profile', userData);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  // Video endpoints
  async getVideos(page: number = 1, limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/videos?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getVideoById(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/videos/${id}`);
    return response.data;
  }

  async likeVideo(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/videos/${id}/like`);
    return response.data;
  }

  async unlikeVideo(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.delete(`/videos/${id}/like`);
    return response.data;
  }

  async addComment(videoId: string, text: string): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/videos/${id}/comments`, { text });
    return response.data;
  }

  async getComments(videoId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/videos/${videoId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Upload endpoints
  async uploadVideo(videoData: FormData): Promise<ApiResponse<any>> {
    const response = await this.api.post('/videos/upload', videoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadImage(imageData: FormData): Promise<ApiResponse<any>> {
    const response = await this.api.post('/upload/image', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Orders endpoints
  async getOrders(page: number = 1, limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async respondToOrder(orderId: string, responseData: any): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/orders/${orderId}/respond`, responseData);
    return response.data;
  }

  async acceptOrderResponse(orderId: string, responseId: string): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/orders/${orderId}/accept/${responseId}`);
    return response.data;
  }

  // Messages endpoints
  async getMessages(chatId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async sendMessage(chatId: string, messageData: any): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/messages/${chatId}`, messageData);
    return response.data;
  }

  // Chats endpoints
  async getChats(): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/chats');
    return response.data;
  }

  async getChatById(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/chats/${id}`);
    return response.data;
  }

  async createChat(participantId: string): Promise<ApiResponse<any>> {
    const response = await this.api.post('/chats', { participantId });
    return response.data;
  }
}

export const apiService = new ApiService();
