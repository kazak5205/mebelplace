/**
 * Admin service using shared adminApi
 */
import { apiClient } from './api'
import { adminApi } from '@shared/utils/api'

const baseAdminService = adminApi(apiClient)

// Export with backward-compatible interface plus additional admin methods
export const adminService = {
  // Base admin API
  users: baseAdminService.users,
  videos: baseAdminService.videos,
  orders: baseAdminService.orders,
  stats: baseAdminService.stats,
  auditLog: baseAdminService.auditLog,
  
  // Additional admin endpoints
  getAuditLog: (params?: any) => apiClient.get('/admin/audit-log', params),
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data: any) => apiClient.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/admin/categories/${id}`),
  getAnalytics: (type: string, params?: any) => apiClient.get(`/admin/analytics/${type}`, params),
  getDashboard: (period?: string) => apiClient.get(`/admin/dashboard${period ? `?period=${period}` : ''}`),
  updateUserStatus: (userId: string, status: string) => apiClient.put(`/admin/users/${userId}/status`, { status }),
  uploadVideo: (formData: FormData) => apiClient.upload('/admin/videos/upload', formData),
  updateVideoStatus: (videoId: string, status: string) => apiClient.put(`/admin/videos/${videoId}/status`, { status }),
  updateVideoPriority: (videoId: string, priority: number) => apiClient.put(`/admin/videos/${videoId}/priority`, { priority }),
  deleteVideo: (videoId: string) => apiClient.delete(`/admin/videos/${videoId}`),
}

// Export base service for direct use
export default baseAdminService

