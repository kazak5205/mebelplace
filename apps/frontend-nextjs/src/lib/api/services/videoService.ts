import { api } from '../client';
import { Video, VideoComment, VideoFeedParams, UploadVideoData } from '@/lib/store/slices/videoSlice';

export const videoService = {
  // Get video feed
  getFeed: async (params: VideoFeedParams = {}): Promise<{ videos: Video[]; pagination: any }> => {
    const response = await api.get('/videos/feed', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        user_id: params.user_id,
        hashtag: params.hashtag,
      },
    });
    return response.data;
  },

  // Get video by ID
  getById: async (videoId: number): Promise<Video> => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  // Upload video
  upload: async (uploadData: UploadVideoData, onProgress?: (progress: number) => void): Promise<Video> => {
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('hashtags', JSON.stringify(uploadData.hashtags));
    formData.append('video', uploadData.file);

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  // Like video
  like: async (videoId: number): Promise<{ likes_count: number }> => {
    const response = await api.post(`/videos/${videoId}/like`);
    return response.data;
  },

  // Unlike video
  unlike: async (videoId: number): Promise<{ likes_count: number }> => {
    const response = await api.post(`/videos/${videoId}/unlike`);
    return response.data;
  },

  // Get video comments
  getComments: async (videoId: number, page: number = 1, limit: number = 20): Promise<VideoComment[]> => {
    const response = await api.get(`/videos/${videoId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Add video comment
  addComment: async (videoId: number, content: string): Promise<VideoComment> => {
    const response = await api.post(`/videos/${videoId}/comments`, { content });
    return response.data;
  },

  // Like comment
  likeComment: async (commentId: number): Promise<{ likes_count: number }> => {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  },

  // Reply to comment
  replyToComment: async (commentId: number, content: string): Promise<VideoComment> => {
    const response = await api.post(`/comments/${commentId}/reply`, { content });
    return response.data;
  },

  // Get comment replies
  getCommentReplies: async (commentId: number, page: number = 1, limit: number = 20): Promise<VideoComment[]> => {
    const response = await api.get(`/comments/${commentId}/replies`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },

  // AI video analysis
  analyzeVideo: async (videoId: number): Promise<any> => {
    const response = await api.post(`/videos/${videoId}/analyze`);
    return response.data;
  },
};
