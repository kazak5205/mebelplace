/**
 * Order Status service using shared orderStatusApi
 * Manages order status changes and history
 */
import { apiClient } from './apiService'
import { orderStatusApi } from '@shared/utils/api'

const baseOrderStatusService = orderStatusApi(apiClient)

// Export with same interface as web version
export const orderStatusService = {
  // Change order status
  changeStatus: (orderId: string, newStatus: string, reason?: string) => 
    baseOrderStatusService.changeStatus(orderId, newStatus, reason),
  
  // Get status history
  getHistory: (orderId: string) => 
    baseOrderStatusService.getHistory(orderId),
  
  // Get available actions for order
  getAvailableActions: (orderId: string) => 
    baseOrderStatusService.getAvailableActions(orderId),
}

// Export base service for direct use
export default baseOrderStatusService

