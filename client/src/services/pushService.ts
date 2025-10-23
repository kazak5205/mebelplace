import { apiService } from './api'

export const pushService = {
  async getVapidKey(): Promise<{ publicKey: string }> {
    return apiService.get('/push/vapid-key')
  },

  async subscribe(subscription: PushSubscription): Promise<any> {
    return apiService.post('/push/subscribe', {
      subscription: subscription.toJSON()
    })
  },

  async unsubscribe(endpoint: string): Promise<void> {
    return apiService.delete('/push/unsubscribe', { endpoint })
  },

  async sendTestNotification(title: string, message: string, data?: any): Promise<any> {
    return apiService.post('/push/test', { title, message, data })
  },

  // Только для админов
  async getStats(): Promise<any> {
    return apiService.get('/push/stats')
  },

  async cleanupInactive(): Promise<any> {
    return apiService.post('/push/cleanup')
  },

  async sendToAll(title: string, message: string, data?: any): Promise<any> {
    return apiService.post('/push/send-to-all', { title, message, data })
  }
}

