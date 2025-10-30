import { apiService } from './api'
import { Video } from '../types'

export const videoService = {
  async getVideos(params?: {
    page?: number
    limit?: number
    category?: string
    author_id?: string
  }): Promise<{ videos: Video[]; pagination: any }> {
    return apiService.get('/videos/feed', params)
  },

  async getVideo(id: string): Promise<Video> {
    return apiService.get<Video>(`/videos/${id}`)
  },

  // Toggle like (одна кнопка для лайка/анлайка)
  async toggleLike(id: string): Promise<{ video_id: string; likes: number; is_liked: boolean }> {
    return apiService.post(`/videos/${id}/like`)
  },

  async addComment(videoId: string, content: string, parentId?: string): Promise<any> {
    return apiService.post(`/videos/${videoId}/comment`, { content, parent_id: parentId })
  },

  async getComments(videoId: string, params?: {
    page?: number
    limit?: number
  }): Promise<{ comments: any[]; pagination: any; totals?: { topLevel: number; all: number } }> {
    return apiService.get(`/videos/${videoId}/comments`, params)
  },

  // Toggle like на комментарий
  async toggleCommentLike(commentId: string): Promise<{ comment_id: string; likes: number; is_liked: boolean }> {
    return apiService.post(`/videos/comments/${commentId}/like`)
  },

  async uploadVideo(formData: FormData): Promise<Video> {
    return apiService.upload<Video>('/videos/upload', formData)
  },

  async recordView(id: string, data: { durationWatched: number; completionRate: number }): Promise<void> {
    return apiService.post(`/videos/${id}/view`, data)
  },

  // Bookmark methods
  async addBookmark(videoId: string): Promise<void> {
    return apiService.post(`/videos/${videoId}/bookmark`)
  },

  async removeBookmark(videoId: string): Promise<void> {
    return apiService.delete(`/videos/${videoId}/bookmark`)
  },

  async searchVideos(params: {
    q: string
    type?: 'all' | 'video' | 'channel'
    page?: number
    limit?: number
    category?: string
  }): Promise<{ videos: any[]; masters: any[]; pagination: any; search: any }> {
    const response = await apiService.get('/search', params) as any
    return {
      videos: response.videos || [],
      masters: response.masters || [],
      pagination: response.pagination || {},
      search: response.search || {}
    }
  }
}
