/**
 * Video service using shared videoApi
 * SYNCHRONIZED WITH WEB VERSION - same API, same format
 * Updated with all backend endpoints
 */
import { apiClient } from './apiService'
import { videoApi } from '@shared/utils/api'

const baseVideoService = videoApi(apiClient)

// Export with same interface as web version
export const videoService = {
  // Feed methods
  getVideos: (params?: any) => baseVideoService.list(params),
  getVideo: (id: string) => baseVideoService.get(id),
  getTrending: () => baseVideoService.trending(),
  getMasterVideos: (masterId: string, params?: any) => 
    baseVideoService.getMasterVideos(masterId, params),
  getBookmarked: (params?: any) => baseVideoService.getBookmarked(params),
  
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
  
  // Bookmarks
  addBookmark: (videoId: string) => baseVideoService.addBookmark(videoId),
  removeBookmark: (videoId: string) => baseVideoService.removeBookmark(videoId),
  
  // Comments
  getComments: (videoId: string, params?: any) => 
    baseVideoService.getComments(videoId, params),
  addComment: (videoId: string, content: string, parentId?: string) => 
    baseVideoService.addComment(videoId, content, parentId),
  likeComment: (commentId: string) => baseVideoService.likeComment(commentId),
  unlikeComment: (commentId: string) => baseVideoService.unlikeComment(commentId),
}

// Export base service for direct use
export default baseVideoService

