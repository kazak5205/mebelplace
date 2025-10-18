import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Router from 'next/router'
import { handleApiError, handleNetworkError } from '@/utils/errorHandler'
import { logger } from '@/lib/logger'
import { apiErrorHandler } from '@/lib/api-error-handler'

// Типы для API ответов
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
}

interface AnalyticsEvent {
  event_type: string
  user_id?: number
  video_id?: number
  metadata?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Конфигурация API - ОБНОВЛЕНО НА V2
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v2'

class ApiService {
  private api: AxiosInstance
  private token: string | null = null

  constructor() {
    // Создаём axios instance
    try {
      this.api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
    } catch (error) {
      // Fallback для test environment
      this.api = axios.create() as AxiosInstance
    }

    // Interceptor для добавления токена
    if (this.api?.interceptors) {
      this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
      })

      // Interceptor для обработки ошибок
      this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle different types of errors
        if (error.response?.status === 401) {
          // Не редиректим автоматически, позволяем компонентам обработать ошибку
          console.warn('Authentication failed:', error.response?.data)
          this.clearToken()
          // Убираем автоматический редирект
          // if (typeof window !== 'undefined') {
          //   Router.push('/auth/login')
          // }
          handleApiError(error, 'Authentication failed')
        } else if (error.response?.status === 403) {
          handleApiError(error, 'Access forbidden')
        } else if (error.response?.status === 404) {
          handleApiError(error, 'Resource not found')
        } else if (error.response?.status >= 500) {
          handleApiError(error, 'Server error')
        } else if (!error.response) {
          handleNetworkError(error, 'Network unavailable')
        } else {
          handleApiError(error, 'API request failed')
        }
        
        return Promise.reject(error)
      }
    )
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  // Аутентификация
  async login(email_or_phone: string, password: string) {
    const response = await this.api.post('/auth/login', {
      email_or_phone,
      password,
    })
    return response.data
  }

  async register(data: {
    name: string
    email_or_phone: string
    password: string
    confirm_password?: string
    role?: string
    region?: string
    agree_to_terms?: boolean
  }) {
    const response = await this.api.post('/auth/register', data)
    return response.data
  }

  async logout() {
    const response = await this.api.post('/auth/logout')
    this.clearToken()
    return response.data
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh')
    return response.data
  }

  // Профиль пользователя
  async getProfile() {
    const response = await this.api.get('/me')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/me', data)
    return response.data
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await this.api.post('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Видео
  async getVideos(params?: {
    page?: number
    limit?: number
    search?: string
    channel_id?: number
  }) {
    const response = await this.api.get('/videos/feed', { params })
    return response.data
  }

  async getVideo(id: number) {
    const response = await this.api.get(`/videos/${id}`)
    return response.data
  }

  async likeVideo(id: number) {
    const response = await this.api.post(`/videos/${id}/like`)
    return response.data
  }

  async unlikeVideo(id: number) {
    const response = await this.api.delete(`/videos/${id}/like`)
    return response.data
  }

  async favoriteVideo(id: number) {
    const response = await this.api.post(`/videos/${id}/favorite`)
    return response.data
  }

  async unfavoriteVideo(id: number) {
    const response = await this.api.delete(`/videos/${id}/favorite`)
    return response.data
  }

  async incrementViews(id: number) {
    const response = await this.api.post(`/videos/${id}/views`)
    return response.data
  }

  async getFavorites() {
    const response = await this.api.get('/favorites')
    return response.data
  }

  async getMyVideos() {
    const response = await this.api.get('/videos/my')
    return response.data
  }

  // Комментарии
  async getComments(videoId: number) {
    const response = await this.api.get(`/videos/${videoId}/comments`)
    return response.data
  }

  async addComment(videoId: number, content: string) {
    const response = await this.api.post(`/videos/${videoId}/comments`, { content })
    return response.data
  }

  async likeComment(commentId: number) {
    const response = await this.api.post(`/comments/${commentId}/like`)
    return response.data
  }

  // Заявки
  async getRequests() {
    const response = await this.api.get('/requests')
    return response.data
  }

  async createRequest(data: {
    title: string
    description: string
    category: string
    budget?: number
    timeline?: string
    location?: string
  }) {
    const response = await this.api.post('/requests', data)
    return response.data
  }

  async getAllRequests() {
    const response = await this.api.get('/requests/all')
    return response.data
  }

  async respondToRequest(id: number, data: { message: string; price?: number }) {
    const response = await this.api.post(`/requests/${id}/respond`, data)
    return response.data
  }

  async acceptRequest(id: number) {
    const response = await this.api.post(`/requests/${id}/accept`)
    return response.data
  }

  async updateRequest(id: number, data: {
    title?: string
    description?: string
    status?: string
    budget?: number
    timeline?: string
    location?: string
  }) {
    const response = await this.api.put(`/requests/${id}`, data)
    return response.data
  }

  async deleteRequest(id: number) {
    const response = await this.api.delete(`/requests/${id}`)
    return response.data
  }

  async completeRequest(id: number) {
    const response = await this.api.post(`/requests/${id}/complete`)
    return response.data
  }

  async cancelRequest(id: number) {
    const response = await this.api.post(`/requests/${id}/cancel`)
    return response.data
  }

  // Заказы
  async getOrders() {
    const response = await this.api.get('/orders')
    return response.data
  }

  async createOrder(data: any) {
    const response = await this.api.post('/orders', data)
    return response.data
  }

  async updateOrderStatus(id: number, status: string) {
    const response = await this.api.put(`/orders/${id}/status`, { status })
    return response.data
  }

  // Подписки
  async getSubscriptions() {
    const response = await this.api.get('/subscriptions')
    return response.data
  }

  async subscribe(masterId: number) {
    const response = await this.api.post('/subscriptions/subscribe', { master_id: masterId })
    return response.data
  }

  async unsubscribe(masterId: number) {
    const response = await this.api.post('/subscriptions/unsubscribe', { master_id: masterId })
    return response.data
  }

  async checkSubscription(masterId: number) {
    const response = await this.api.get('/subscriptions/check', { params: { master_id: masterId } })
    return response.data
  }

  // Поиск
  async search(query: string, params?: { 
    page?: number
    limit?: number
    filter?: 'all' | 'videos' | 'channels'
  }) {
    const response = await this.api.get('/search', { 
      params: { q: query, ...params } 
    })
    return response.data
  }

  async getSearchSuggestions(query: string) {
    const response = await this.api.get('/search/suggestions', { 
      params: { q: query } 
    })
    return response.data
  }

  // Групповые чаты
  async getGroupChats() {
    const response = await this.api.get('/group-chats')
    return response.data
  }

  async createGroupChat(data: { name: string; description?: string }) {
    const response = await this.api.post('/group-chats', data)
    return response.data
  }

  async getGroupChat(id: number) {
    const response = await this.api.get(`/group-chats/${id}`)
    return response.data
  }

  async joinGroupChat(id: number) {
    const response = await this.api.post('/group-chats/join', { chat_id: id })
    return response.data
  }

  async getGroupChatMessages(id: number) {
    const response = await this.api.get(`/group-chats/${id}/messages`)
    return response.data
  }

  async sendGroupChatMessage(id: number, message: string) {
    const response = await this.api.post(`/group-chats/${id}/messages`, { content: message })
    return response.data
  }

  // Письменные каналы
  async getWrittenChannels() {
    const response = await this.api.get('/written-channels')
    return response.data
  }

  async createWrittenChannel(data: { name: string; description: string }) {
    const response = await this.api.post('/written-channels', data)
    return response.data
  }

  async subscribeToWrittenChannel(id: number) {
    const response = await this.api.post(`/written-channels/${id}/subscribe`)
    return response.data
  }

  async getWrittenChannelPosts(id: number) {
    const response = await this.api.get(`/written-channels/${id}/posts`)
    return response.data
  }

  async createWrittenChannelPost(id: number, data: { content: string; attachments?: { url: string; type: string }[] }) {
    const response = await this.api.post(`/written-channels/${id}/posts`, data)
    return response.data
  }

  // Голосовые сообщения
  async sendVoiceMessage(data: { audio_data: string; duration: number; recipient_id: number }) {
    const response = await this.api.post('/voice-messages', data)
    return response.data
  }

  // Камера и медиа
  async uploadCameraMedia(file: File) {
    const formData = new FormData()
    formData.append('media', file)
    
    const response = await this.api.post('/camera/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getCameraMedia() {
    const response = await this.api.get('/camera/media')
    return response.data
  }

  async startLiveStream() {
    const response = await this.api.post('/camera/live-stream')
    return response.data
  }

  async endLiveStream(id: number) {
    const response = await this.api.post(`/camera/live-stream/${id}/end`)
    return response.data
  }

  // AI функции
  async autoCorrectText(text: string) {
    const response = await this.api.post('/ai/auto-correct', { text })
    return response.data
  }

  async getRecommendations() {
    const response = await this.api.post('/ai/recommendations')
    return response.data
  }

  async getTrendingRecommendations() {
    const response = await this.api.get('/ai/recommendations/trending')
    return response.data
  }

  async voiceToText(audioData: string) {
    const response = await this.api.post('/ai/voice-to-text', { audio_data: audioData })
    return response.data
  }

  // Геймификация
  async getUserStats() {
    const response = await this.api.get('/gamification/stats')
    return response.data
  }

  async getAchievements() {
    const response = await this.api.get('/gamification/achievements')
    return response.data
  }

  async getLeaderboard() {
    const response = await this.api.get('/gamification/leaderboard')
    return response.data
  }

  // Поддержка
  async getSupportTickets() {
    const response = await this.api.get('/support/tickets')
    return response.data
  }

  async createSupportTicket(data: { subject: string; message: string; priority?: string }) {
    const response = await this.api.post('/support/tickets', data)
    return response.data
  }

  async getSupportTicketMessages(id: number) {
    const response = await this.api.get(`/support/tickets/${id}/messages`)
    return response.data
  }

  async replyToSupportTicket(id: number, message: string) {
    const response = await this.api.post(`/support/tickets/${id}/reply`, { message })
    return response.data
  }

  // Пользователи
  async updateUser(id: number, data: any) {
    const response = await this.api.put(`/users/${id}`, data)
    return response.data
  }

  async blockUser(id: number) {
    const response = await this.api.post(`/users/${id}/block`)
    return response.data
  }

  async unblockUser(id: number) {
    const response = await this.api.delete(`/users/${id}/block`)
    return response.data
  }

  async reportUser(id: number, reason: string) {
    const response = await this.api.post(`/users/${id}/report`, { reason })
    return response.data
  }

  // Стриминг
  async startStream() {
    const response = await this.api.post('/streams/start')
    return response.data
  }

  // История
  async clearHistory() {
    const response = await this.api.delete('/user/history')
    return response.data
  }

  // Мессенджер
  async getChats() {
    const response = await this.api.get('/chats')
    return response.data
  }

  async getChatMessages(id: number) {
    const response = await this.api.get(`/chats/${id}/messages`)
    return response.data
  }

  async sendMessage(id: number, content: string) {
    const response = await this.api.post(`/chats/${id}/messages`, { content })
    return response.data
  }

  // Реклама
  async createAd(data: any) {
    const response = await this.api.post('/ads', data)
    return response.data
  }

  async getUserAds() {
    const response = await this.api.get('/ads')
    return response.data
  }

  async activateAd(id: number) {
    const response = await this.api.post(`/ads/${id}/activate`)
    return response.data
  }

  // Поддержка расширенная
  async addSupportMessage(data: any) {
    const response = await this.api.post('/support/messages', data)
    return response.data
  }

  async getSupportMessages() {
    const response = await this.api.get('/support/messages')
    return response.data
  }

  // Аналитика
  async getAnalyticsFunnel() {
    const response = await this.api.get('/analytics/funnel')
    return response.data
  }

  async getAnalyticsRetention() {
    const response = await this.api.get('/analytics/retention')
    return response.data
  }

  async getAnalyticsEvents() {
    const response = await this.api.get('/analytics/events')
    return response.data
  }

  // Уведомления
  async getNotifications() {
    const response = await this.api.get('/notifications')
    return response.data
  }

  async markNotificationRead(id: number) {
    const response = await this.api.post(`/notifications/${id}/read`)
    return response.data
  }

  async markAllNotificationsRead() {
    const response = await this.api.post('/notifications/read-all')
    return response.data
  }

  // Публичные endpoints
  async getPublicAds() {
    const response = await this.api.get('/ads/public')
    return response.data
  }

  async getRegions() {
    const response = await this.api.get('/regions')
    return response.data
  }

  async getTerms() {
    const response = await this.api.get('/legal/terms')
    return response.data
  }

  // Аналитические события (публичные)
  async sendAnalyticsEvent(event: {
    event: string
    properties?: Record<string, any>
    user_id?: string
    session_id: string
    timestamp: number
  }) {
    const response = await this.api.post('/analytics/events', event)
    return response.data
  }

  async sendBatchAnalyticsEvents(events: AnalyticsEvent[]) {
    const response = await this.api.post('/analytics/events/batch', { events })
    return response.data
  }

  // ИСПРАВЛЕНО: Добавлены недостающие методы поиска
  // Backend endpoint: /api/v2/search?q={query}&type={type}
  async searchVideos(query: string) {
    const response = await this.api.get('/search', {
      params: { q: query, type: 'videos' }
    })
    return response.data
  }

  async searchUsers(query: string) {
    const response = await this.api.get('/search', {
      params: { q: query, type: 'users' }
    })
    return response.data
  }

  async searchChannels(query: string) {
    const response = await this.api.get('/search', {
      params: { q: query, type: 'channels' }
    })
    return response.data
  }
}

// Создаем единственный экземпляр API сервиса
export const apiService = new ApiService()

// Экспортируем типы
export default apiService

