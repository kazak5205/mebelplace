/**
 * Video API endpoints
 */

import type { 
  Video, 
  FeedResponse, 
  Comment,
  CreateCommentRequest,
  UploadVideoRequest,
  UploadVideoResponse 
} from '../types/video'

import { apiClient } from '@/lib/api/client'

/**
 * Get personalized video feed
 * TikTok-style infinite scroll with cursor-based pagination
 */
export async function getVideoFeed(cursor?: string, limit = 10): Promise<FeedResponse> {
  const response = await apiClient.getVideoFeed({ page: 1, limit })
  return response.data as FeedResponse
}

/**
 * Get video by ID
 */
export async function getVideoById(id: string): Promise<Video> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data as Video
}

/**
 * Like video
 */
export async function likeVideo(videoId: string): Promise<void> {
  await apiClient.likeVideo(videoId)
}

/**
 * Unlike video
 */
export async function unlikeVideo(videoId: string): Promise<void> {
  await apiClient.unlikeVideo(videoId)
}

/**
 * Save video
 */
export async function saveVideo(videoId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${videoId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Unsave video
 */
export async function unsaveVideo(videoId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${videoId}/save`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Get video comments
 */
export async function getVideoComments(videoId: string, offset = 0, limit = 20): Promise<Comment[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${videoId}/comments?offset=${offset}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

/**
 * Create comment
 * CRITICAL: Backend will validate Master can ONLY comment on their own videos!
 */
export async function createComment(data: CreateCommentRequest): Promise<Comment> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  return result.data
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Upload video
 */
export async function uploadVideo(data: UploadVideoRequest, file: File): Promise<UploadVideoResponse> {
  // Step 1: Get presigned URL
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  const { upload_url, id, video_url } = result.data
  
  // Step 2: Upload to S3
  await fetch(upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })
  
  return { id, upload_url, video_url }
}

/**
 * Share video
 */
export async function shareVideo(videoId: string, platform: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${videoId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform }),
  })
}

/**
 * Track video view
 */
export async function trackVideoView(videoId: string, watchTime: number, completed: boolean): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/videos/${videoId}/view`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ watch_time: watchTime, completed }),
  })
}

