/**
 * Order service using shared orderApi
 * SYNCHRONIZED WITH WEB VERSION - same API, same format
 * Updated with all backend endpoints
 */
import { apiClient } from './apiService'
import { orderApi } from '@shared/utils/api'

const baseOrderService = orderApi(apiClient)

// Export with same interface as web version
export const orderService = {
  // List and get
  getOrders: (params?: any) => baseOrderService.list(params),
  getOrder: (id: string) => baseOrderService.get(id),
  
  // Create and manage
  createOrder: (data: any) => baseOrderService.create(data),
  updateOrder: (id: string, data: any) => baseOrderService.update(id, data),
  deleteOrder: (id: string) => baseOrderService.delete(id),
  updateOrderStatus: (id: string, status: string) => 
    baseOrderService.updateStatus(id, status),
  
  // Responses
  createResponse: (orderId: string, data: any) => 
    baseOrderService.createResponse(orderId, data),
  respondToOrder: (orderId: string, data: any) => 
    baseOrderService.createResponse(orderId, data),
  getOrderResponses: (orderId: string) => 
    baseOrderService.getResponses(orderId),
  acceptResponse: (orderId: string, responseId: string) => 
    baseOrderService.acceptResponse(orderId, responseId),
  rejectResponse: (orderId: string, responseId: string) => 
    baseOrderService.rejectResponse(orderId, responseId),
  
  // Images, regions and categories
  uploadOrderImages: (formData: FormData) => 
    baseOrderService.uploadImages(formData),
  getRegions: () => baseOrderService.getRegions(),
  getCategories: () => baseOrderService.getCategories(),
}

// Export base service for direct use
export default baseOrderService

