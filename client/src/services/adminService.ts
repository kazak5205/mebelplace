import { apiService } from './api'

export const adminService = {
  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboard(period: '1d' | '7d' | '30d' | '90d' = '7d'): Promise<any> {
    return apiService.get('/admin/dashboard', { period })
  },

  async getVideoAnalytics(params?: {
    videoId?: string
    period?: '1d' | '7d' | '30d'
    groupBy?: 'hour' | 'day' | 'week'
  }): Promise<any> {
    return apiService.get('/admin/analytics/videos', params)
  },

  // ==================== VIDEO MANAGEMENT ====================
  
  async getVideos(params?: {
    page?: number
    limit?: number
    status?: 'active' | 'inactive' | 'featured'
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<{
    videos: any[]
    pagination: any
  }> {
    return apiService.get('/admin/videos', params)
  },

  async uploadVideo(formData: FormData): Promise<any> {
    return apiService.upload('/admin/videos/upload', formData)
  },

  async updateVideoPriority(videoId: string, priorityOrder: number, isFeatured: boolean): Promise<void> {
    return apiService.put(`/admin/videos/${videoId}/priority`, {
      priorityOrder,
      isFeatured
    })
  },

  async updateVideoStatus(videoId: string, isActive?: boolean, isPublic?: boolean): Promise<void> {
    return apiService.put(`/admin/videos/${videoId}/status`, {
      isActive,
      isPublic
    })
  },

  async deleteVideo(videoId: string): Promise<void> {
    return apiService.delete(`/admin/videos/${videoId}`)
  },

  // ==================== USER MANAGEMENT ====================
  
  async getUsers(params?: {
    page?: number
    limit?: number
    role?: 'user' | 'master' | 'admin'
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<{
    users: any[]
    pagination: any
  }> {
    return apiService.get('/admin/users', params)
  },

  async updateUserStatus(userId: string, isActive?: boolean, role?: 'user' | 'master' | 'admin'): Promise<void> {
    return apiService.put(`/admin/users/${userId}/status`, {
      isActive,
      role
    })
  },

  // ==================== CONTENT CATEGORIES ====================
  
  async getCategories(): Promise<any[]> {
    return apiService.get('/admin/categories')
  },

  async createCategory(data: {
    name: string
    slug: string
    description?: string
    color?: string
    sortOrder?: number
  }): Promise<any> {
    return apiService.post('/admin/categories', data)
  },

  async updateCategory(categoryId: string, data: {
    name?: string
    slug?: string
    description?: string
    color?: string
    sortOrder?: number
    isActive?: boolean
  }): Promise<void> {
    return apiService.put(`/admin/categories/${categoryId}`, data)
  },

  async deleteCategory(categoryId: string): Promise<void> {
    return apiService.delete(`/admin/categories/${categoryId}`)
  },

  // ==================== AUDIT LOG ====================
  
  async getAuditLog(params?: {
    page?: number
    limit?: number
    action?: string
    resourceType?: string
    adminId?: string
  }): Promise<{
    logs: any[]
    pagination: any
  }> {
    return apiService.get('/admin/audit-log', params)
  }
}

