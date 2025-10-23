import { apiService } from './api'
import { Order } from '../types'

export const orderService = {
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    region?: string
  }): Promise<{
    orders: Order[]
    pagination: any
  }> {
    return apiService.get('/orders/feed', params)
  },

  async getOrder(id: string): Promise<Order> {
    return apiService.get<Order>(`/orders/${id}`)
  },

  async createOrder(formData: FormData): Promise<Order> {
    // Используем FormData для загрузки с изображениями
    return apiService.upload<Order>('/orders/create', formData)
  },

  async getCategories(): Promise<any[]> {
    return apiService.get('/orders/categories')
  },

  async getRegions(): Promise<any[]> {
    return apiService.get('/orders/regions')
  },

  async createResponse(orderId: string, responseData: {
    message: string
    price?: number
    deadline?: string
  }): Promise<any> {
    return apiService.post(`/orders/${orderId}/response`, responseData)
  },

  async getOrderResponses(orderId: string): Promise<any[]> {
    return apiService.get(`/orders/${orderId}/responses`)
  },

  async acceptResponse(orderId: string, responseId: string): Promise<{
    order: Order
    chat: any
  }> {
    return apiService.post(`/orders/${orderId}/accept`, { responseId })
  },

  async rejectResponse(orderId: string, responseId: string): Promise<void> {
    return apiService.post(`/orders/${orderId}/reject`, { responseId })
  },

  async updateOrderStatus(id: string, status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'): Promise<Order> {
    return apiService.put<Order>(`/orders/${id}/status`, { status })
  }
}
