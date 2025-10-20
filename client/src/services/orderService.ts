/**
 * Order service using shared orderApi
 */
import { apiClient } from './api'
import { orderApi } from '@shared/utils/api'

const baseOrderService = orderApi(apiClient)

// Export with backward-compatible interface
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
  
  // Images and regions
  uploadOrderImages: (formData: FormData) => 
    baseOrderService.uploadImages(formData),
  getRegions: () => baseOrderService.getRegions(),
}

// Export base service for direct use
export default baseOrderService
