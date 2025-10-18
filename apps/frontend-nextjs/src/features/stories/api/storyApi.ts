/**
 * Story API functions
 */

import { apiClient } from '@/lib/api/client'
import type { Channel, Story, CreateStoryRequest, UploadStoryResponse, MakeHighlightRequest } from '../types/story'

export async function getStoryChannels(): Promise<Channel[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/channels`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

export async function getChannelStories(authorId: string): Promise<Story[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/channels/${authorId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

export async function viewStory(storyId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/${storyId}/view`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function uploadStory(data: CreateStoryRequest, file: File): Promise<Story> {
  // Step 1: Get presigned URL
  const formData = new FormData()
  formData.append('media_type', file.type.startsWith('image') ? 'image' : 'video')
  if (data.text) formData.append('text', data.text)
  if (data.text_color) formData.append('text_color', data.text_color)
  if (data.text_bg_color) formData.append('text_bg_color', data.text_bg_color)
  if (data.link_url) formData.append('link_url', data.link_url)
  if (data.link_text) formData.append('link_text', data.link_text)

  const initResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/upload/init`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: formData,
  })
  const initData = await initResponse.json()

  // Step 2: Upload to S3
  await fetch(initData.data.upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  // Step 3: Complete upload
  const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/upload/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      story_id: initData.data.id,
    }),
  })
  const completeData = await completeResponse.json()

  return completeData.data
}

export async function makeHighlight(data: MakeHighlightRequest): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/highlights`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteStory(storyId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/stories/${storyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}
