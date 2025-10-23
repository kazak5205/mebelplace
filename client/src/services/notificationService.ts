import { apiService } from './api'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
}

export const notificationService = {
  async getNotifications(params?: {
    page?: number
    limit?: number
  }): Promise<{
    notifications: Notification[]
    unreadCount: number
    pagination: any
  }> {
    return apiService.get('/notifications', params)
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return apiService.get('/notifications/unread-count')
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return apiService.put(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<{ count: number }> {
    return apiService.put('/notifications/read-all')
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return apiService.delete(`/notifications/${notificationId}`)
  },

  // Только для админов
  async testSMS(phone: string, message: string): Promise<any> {
    return apiService.post('/notifications/test-sms', { phone, message })
  },

  async getSMSBalance(): Promise<any> {
    return apiService.get('/notifications/sms-balance')
  }
}

