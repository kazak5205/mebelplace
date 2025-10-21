/**
 * Video service using shared videoApi
 * SYNCHRONIZED WITH WEB VERSION - same API, same format
 */
import { apiClient } from './apiService'
import { videoApi } from '@shared/utils/api'

const baseVideoService = videoApi(apiClient)

// Export with same interface as web version
export const videoService = {
  // Feed methods
  getVideos: (params?: any) => baseVideoService.list(params),
  getVideo: (id: string) => baseVideoService.get(id),
  
  // Upload and manage
  uploadVideo: (formData: FormData, onProgress?: (p: number) => void) => 
    baseVideoService.upload(formData, onProgress),
  updateVideo: (id: string, data: any) => baseVideoService.update(id, data),
  deleteVideo: (id: string) => baseVideoService.delete(id),
  
  // Interactions
  likeVideo: (id: string) => baseVideoService.like(id),
  unlikeVideo: (id: string) => baseVideoService.unlike(id),
  recordView: (id: string, data: { durationWatched: number; completionRate: number }) => 
    baseVideoService.recordView(id, data),
  
  // Comments
  getComments: (videoId: string, params?: any) => 
    baseVideoService.getComments(videoId, params),
  addComment: (videoId: string, content: string, parentId?: string) => 
    baseVideoService.addComment(videoId, content, parentId),
  likeComment: (commentId: string) => baseVideoService.likeComment(commentId),
  unlikeComment: (commentId: string) => baseVideoService.unlikeComment(commentId),
  
  // Bookmarks
  addBookmark: async (videoId: string) => {
    try {
      await apiClient.post(`/videos/${videoId}/bookmark`)
      return { success: true }
    } catch (error) {
      console.error('Failed to add bookmark:', error)
      throw error
    }
  },
  removeBookmark: async (videoId: string) => {
    try {
      await apiClient.delete(`/videos/${videoId}/bookmark`)
      return { success: true }
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
      throw error
    }
  },
}

// Export base service for direct use
export default baseVideoService

