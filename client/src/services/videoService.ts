import { apiService } from './api'
import { Video } from '../types'

export const videoService = {
  async getVideos(params?: {
    page?: number
    limit?: number
    category?: string
    masterId?: string
    search?: string
  }): Promise<{ videos: Video[]; total: number; page: number; limit: number }> {
    const response = await apiService.get('/videos/feed', params)
    return response.data || response
  },

  async getVideo(id: string): Promise<Video> {
    return apiService.get<Video>(`/videos/${id}`)
  },

  async likeVideo(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiService.post(`/videos/${id}/like`)
  },

  async unlikeVideo(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiService.delete(`/videos/${id}/like`)
  },

  async addComment(videoId: string, content: string, parentId?: string): Promise<{
    id: string
    content: string
    author: any
    createdAt: string
  }> {
    return apiService.post(`/videos/${videoId}/comment`, { content, parent_id: parentId })
  },

  async getComments(videoId: string, params?: {
    page?: number
    limit?: number
  }): Promise<{
    comments: any[]
    total: number
    page: number
    limit: number
  }> {
    const response = await apiService.get(`/videos/${videoId}/comments`, params)
    return response.data || response
  },

  async likeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiService.post(`/videos/comments/${commentId}/like`)
  },

  async unlikeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiService.delete(`/videos/comments/${commentId}/like`)
  },

  async uploadVideo(formData: FormData): Promise<Video> {
    return apiService.upload<Video>('/videos/upload', formData)
  },

  async updateVideo(id: string, data: Partial<Video>): Promise<Video> {
    return apiService.put<Video>(`/videos/${id}`, data)
  },

  async deleteVideo(id: string): Promise<void> {
    return apiService.delete<void>(`/videos/${id}`)
  },

  async recordView(id: string, data: { durationWatched: number; completionRate: number }): Promise<void> {
    return apiService.post(`/videos/${id}/view`, data)
  }
}
