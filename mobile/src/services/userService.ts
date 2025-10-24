/**
 * User service using shared userApi
 * SYNCHRONIZED WITH WEB VERSION - same API, same format
 */
import { apiClient } from './apiService'
import { userApi } from '@shared/utils/api'

const baseUserService = userApi(apiClient)

// Export with same interface as web version
export const userService = {
  getUser: (id: string) => baseUserService.get(id),
  updateUser: (id: string, data: any) => baseUserService.update(id, data),
  deleteUser: (id: string) => baseUserService.delete(id),
  uploadAvatar: (id: string, fileUri: string) => {
    const formData = new FormData()
    formData.append('avatar', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any)
    return baseUserService.uploadAvatar(id, formData)
  },
  
  // Подписки (используем реальные эндпоинты из backend)
  subscribe: async (userId: string) => {
    return await apiClient.post(`/users/${userId}/subscribe`, {})
  },

  unsubscribe: async (userId: string) => {
    return await apiClient.delete(`/users/${userId}/unsubscribe`)
  },

  getSubscriptions: async (userId: string) => {
    return await apiClient.get(`/users/${userId}/subscriptions`)
  },

  getSubscribers: async (userId: string) => {
    return await apiClient.get(`/users/${userId}/subscribers`)
  },

  getSubscriptionStatus: async (userId: string) => {
    return await apiClient.get(`/users/${userId}/subscription-status`)
  },

  // Избранные видео
  getBookmarkedVideos: async () => {
    return await apiClient.get('/videos/bookmarked')
  }
}

// Export base service for direct use
export default baseUserService

