/**
 * Push Notification service using shared pushApi
 * Manages push notification subscriptions and sending
 */
import { apiClient } from './apiService'
import { pushApi } from '@shared/utils/api'

const basePushService = pushApi(apiClient)

// Export with same interface as web version
export const pushService = {
  // Get VAPID public key for web push
  getVapidKey: () => basePushService.getVapidKey(),
  
  // Subscribe/unsubscribe to push notifications
  subscribe: (subscription: any) => basePushService.subscribe(subscription),
  unsubscribe: (endpoint: string) => basePushService.unsubscribe(endpoint),
  
  // Test push notification
  testPush: (title: string, message: string, data?: any) => 
    basePushService.testPush(title, message, data),
  
  // Get subscription stats (admin only)
  getStats: () => basePushService.getStats(),
}

// Export base service for direct use
export default basePushService

