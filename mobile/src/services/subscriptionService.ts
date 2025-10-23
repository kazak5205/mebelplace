/**
 * Subscription service using shared subscriptionApi
 * Manages subscriptions to master channels
 */
import { apiClient } from './apiService'
import { subscriptionApi } from '@shared/utils/api'

const baseSubscriptionService = subscriptionApi(apiClient)

// Export with same interface as web version
export const subscriptionService = {
  // Get user's subscriptions
  getSubscriptions: () => baseSubscriptionService.list(),
  
  // Subscribe/unsubscribe to master
  subscribe: (masterId: string) => baseSubscriptionService.subscribe(masterId),
  unsubscribe: (masterId: string) => baseSubscriptionService.unsubscribe(masterId),
  
  // Check subscription status
  checkStatus: (masterId: string) => baseSubscriptionService.checkStatus(masterId),
  
  // Get subscriber count for master
  getCount: (masterId: string) => baseSubscriptionService.getCount(masterId),
}

// Export base service for direct use
export default baseSubscriptionService

