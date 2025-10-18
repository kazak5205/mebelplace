/**
 * Videos API Hooks
 * React Query hooks for video-related endpoints
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import api from '../api-wrapper';

export interface Video {
  id: number;
  title: string;
  description: string;
  path: string; // Backend returns 'path', not 'video_url'
  thumbnail_path: string; // Backend returns 'thumbnail_path', not 'thumbnail_url'
  user_id: number;
  author: {
    id: number;
    username: string;
    avatar: string | null; // Backend returns 'avatar', not 'avatar_url'
    region: string;
  };
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_liked: boolean;
  is_favorited?: boolean;
  price?: number;
  hashtags: string[];
  is_ad?: boolean;
  audio_info?: {
    title: string;
    artist: string;
    url: string;
  };
  created_at: string;
  updated_at: string;
}

export interface VideoFeedParams {
  limit?: number;
  offset?: number;
  type?: 'all' | 'following' | 'ai';
}

export interface VideoFeedResponse {
  data: Video[];
  total: number;
  has_more: boolean;
}

// Query Keys
export const videoKeys = {
  all: ['videos'] as const,
  feed: (params: VideoFeedParams) => ['videos', 'feed', params] as const,
  detail: (id: number) => ['videos', 'detail', id] as const,
  userVideos: (userId: number) => ['videos', 'user', userId] as const,
};

// Get video feed
export function useVideoFeed(
  params: VideoFeedParams = {},
  options?: Omit<UseQueryOptions<VideoFeedResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VideoFeedResponse, Error>({
    queryKey: videoKeys.feed(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());
      if (params.type && params.type !== 'all') {
        searchParams.set(params.type === 'following' ? 'subscriptions' : 'ai', 'true');
      }

      return api.get<VideoFeedResponse>(
        `/videos/feed?${searchParams.toString()}`
      );
    },
    ...options,
  });
}

// Get single video
export function useVideo(
  videoId: number,
  options?: Omit<UseQueryOptions<Video, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Video, Error>({
    queryKey: videoKeys.detail(videoId),
    queryFn: () => api.get<Video>(`/videos/${videoId}`),
    enabled: videoId > 0,
    ...options,
  });
}

// Like video mutation
export function useLikeVideo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.post<void>(`/videos/${videoId}/like`),
    onSuccess: (_, videoId) => {
      // Invalidate video queries to refetch with updated like count
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Unlike video mutation
export function useUnlikeVideo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.delete<void>(`/videos/${videoId}/like`),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Track video view
export function useTrackVideoView() {
  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.post<void>(`/videos/${videoId}/views`),
  });
}

// Upload video mutation
export interface UploadVideoData {
  title: string;
  description: string;
  video: File;
  thumbnail?: File;
  hashtags?: string[];
  price?: number;
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation<Video, Error, UploadVideoData>({
    mutationFn: async (data: UploadVideoData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('video', data.video);
      if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
      if (data.hashtags) formData.append('hashtags', JSON.stringify(data.hashtags));
      if (data.price) formData.append('price', data.price.toString());

      return api.post<Video>('/videos', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Favorite video mutation
export function useFavoriteVideo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.post<void>(`/videos/${videoId}/favorite`),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Unfavorite video mutation
export function useUnfavoriteVideo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.delete<void>(`/videos/${videoId}/favorite`),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Share video hook
export function useShareVideo() {
  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) => {
      // For now, just return success - actual API call can be added later
      return Promise.resolve();
    },
    onSuccess: () => {
      // Could invalidate analytics queries here
    },
  });
}

// Save video hook
export function useSaveVideo() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (videoId: number) =>
      api.post<void>(`/videos/${videoId}/save`),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

// Alias useVideos to useVideoFeed for backward compatibility
export const useVideos = useVideoFeed;

