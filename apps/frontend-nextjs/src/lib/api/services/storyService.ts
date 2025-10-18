import { api } from '../client';
import { Story } from '@/lib/store/slices/storySlice';

export const storyService = {
  // Get stories
  getStories: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ stories: Story[]; pagination: any }> => {
    const response = await api.get('/stories', {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data;
  },

  // Create story
  createStory: async (storyData: {
    content: string;
    media: File;
    mediaType: 'image' | 'video';
  }): Promise<Story> => {
    const formData = new FormData();
    formData.append('content', storyData.content);
    formData.append('media', storyData.media);
    formData.append('media_type', storyData.mediaType);

    const response = await api.post('/stories/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // View story
  viewStory: async (storyId: number): Promise<void> => {
    await api.post(`/stories/${storyId}/view`);
  },

  // Like story
  likeStory: async (storyId: number): Promise<{ likes_count: number }> => {
    const response = await api.post(`/stories/${storyId}/like`);
    return response.data;
  },

  // Get user stories
  getUserStories: async (userId: number, page: number = 1, limit: number = 20): Promise<Story[]> => {
    const response = await api.get(`/stories/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};
