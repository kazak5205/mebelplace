/**
 * Live Stream API endpoints
 */

import type { 
  Stream, 
  StreamMessage,
  CreateStreamRequest,
  StartStreamRequest,
  EndStreamRequest,
  SendMessageRequest
} from '../types/stream'

import { apiClient } from '@/lib/api/client'

/**
 * Get live streams
 */
export async function getLiveStreams(limit = 20, offset = 0): Promise<Stream[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/live?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

/**
 * Get stream by ID
 */
export async function getStreamById(id: string): Promise<Stream> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

/**
 * Create stream
 */
export async function createStream(data: CreateStreamRequest): Promise<Stream> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams`, {
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
 * Start stream (go live)
 * CRITICAL: Sends push notification to subscribers (<5 sec!)
 */
export async function startStream(data: StartStreamRequest): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${data.stream_id}/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * End stream
 */
export async function endStream(data: EndStreamRequest): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${data.stream_id}/end`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Like stream
 */
export async function likeStream(streamId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${streamId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Get stream messages (chat)
 */
export async function getStreamMessages(streamId: string, limit = 50): Promise<StreamMessage[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${streamId}/messages?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data.data
}

/**
 * Send message to stream chat
 */
export async function sendStreamMessage(data: SendMessageRequest): Promise<StreamMessage> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${data.stream_id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: data.message,
      type: data.type
    }),
  })
  const result = await response.json()
  return result.data
}

/**
 * Join stream as viewer
 */
export async function joinStream(streamId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${streamId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Leave stream
 */
export async function leaveStream(streamId: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/streams/${streamId}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  })
}
