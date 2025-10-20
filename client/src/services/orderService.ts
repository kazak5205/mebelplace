import { apiService } from './api'
import { Order, OrderResponse } from '../types'

export const orderService = {
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    city?: string
    region?: string
  }): Promise<{
    orders: Order[]
    total: number
    page: number
    limit: number
  }> {
    return apiService.get('/orders/feed', params)
  },

  async getOrder(id: string): Promise<Order> {
    return apiService.get<Order>(`/orders/${id}`)
  },

  async createOrder(orderData: {
    title: string
    description: string
    category: string
    location: {
      city: string
      region: string
      address: string
      coordinates?: {
        lat: number
        lng: number
      }
    }
    images: string[]
  }): Promise<Order> {
    return apiService.post<Order>('/orders/create', orderData)
  },

  async getRegions(): Promise<string[]> {
    return apiService.get<string[]>('/orders/regions')
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    return apiService.put<Order>(`/orders/${id}`, orderData)
  },

  async deleteOrder(id: string): Promise<void> {
    return apiService.delete<void>(`/orders/${id}`)
  },

  async respondToOrder(orderId: string, responseData: {
    message: string
    proposedPrice: number
    estimatedTime: string
  }): Promise<OrderResponse> {
    return apiService.post<OrderResponse>(`/orders/${orderId}/responses`, responseData)
  },

  async getOrderResponses(orderId: string): Promise<OrderResponse[]> {
    return apiService.get<OrderResponse[]>(`/orders/${orderId}/responses`)
  },

  async acceptResponse(orderId: string, responseId: string): Promise<Order> {
    return apiService.put<Order>(`/orders/${orderId}/responses/${responseId}/accept`)
  },

  async rejectResponse(orderId: string, responseId: string): Promise<void> {
    return apiService.put<void>(`/orders/${orderId}/responses/${responseId}/reject`)
  },

  async updateOrderStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<Order> {
    return apiService.put<Order>(`/orders/${id}/status`, { status })
  },

  async uploadOrderImages(formData: FormData): Promise<string[]> {
    return apiService.upload<string[]>('/orders/upload-images', formData)
  },

  async getOrderResponses(orderId: string): Promise<{
    responses: any[]
    total: number
  }> {
    return apiService.get(`/orders/${orderId}/responses`)
  },

  async acceptResponse(orderId: string, responseId: string): Promise<{
    order: Order
    chat: any
  }> {
    return apiService.post(`/orders/${orderId}/accept`, { responseId })
  },

  async createResponse(orderId: string, responseData: {
    message: string
    price?: number
    deadline?: string
  }): Promise<any> {
    return apiService.post(`/orders/${orderId}/responses`, responseData)
  }
}
