import { apiService } from './api'

export const userService = {
  // Подписки (используем реальные эндпоинты из /server/routes/users.js)
  async subscribe(userId: string) {
    return apiService.post(`/users/${userId}/subscribe`, {})
  },

  async unsubscribe(userId: string) {
    return apiService.delete(`/users/${userId}/unsubscribe`)
  },

  async getSubscriptions(userId: string) {
    return apiService.get(`/users/${userId}/subscriptions`)
  },

  async getSubscribers(userId: string) {
    return apiService.get(`/users/${userId}/subscribers`)
  },

  async getSubscriptionStatus(userId: string) {
    return apiService.get(`/users/${userId}/subscription-status`)
  },

  // Блокировка пользователей (используем реальные эндпоинты из /server/routes/users.js)
  async blockUser(userId: string, reason?: string) {
    return apiService.post(`/users/${userId}/block`, { reason })
  },

  async unblockUser(userId: string) {
    return apiService.delete(`/users/${userId}/unblock`)
  },

  async getBlockedUsers() {
    return apiService.get('/users/blocked')
  },

  // Избранные видео (используем реальные эндпоинты из /server/routes/videos.js)
  async getBookmarkedVideos() {
    return apiService.get('/videos/bookmarked')
  }
}
