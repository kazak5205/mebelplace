/**
 * Live Stream types
 */

export type StreamStatus = 'created' | 'live' | 'ended' | 'archived'
export type MessageType = 'chat' | 'gift' | 'join' | 'leave' | 'system'

export interface Stream {
  id: string
  author_id: string
  title: string
  description: string
  thumbnail_url: string
  
  // Streaming URLs
  stream_key: string // Secret key for RTMP push (only for author!)
  rtmp_url: string   // For streaming (only for author!)
  hls_url: string    // For watching
  
  // Status
  status: StreamStatus
  
  // Stats
  viewer_count: number // Current viewers
  peak_viewers: number // Max concurrent viewers
  total_views: number  // Total unique viewers
  like_count: number
  
  // Settings
  category: string
  tags: string[]
  is_public: boolean
  allow_chat: boolean
  
  // User interaction (for current user)
  is_liked?: boolean
  
  // Author info (populated)
  author?: {
    id: string
    name: string
    username: string
    avatar_url: string
    role: 'buyer' | 'master' | 'admin'
    is_verified: boolean
  }
  
  // Timestamps
  created_at: string
  started_at?: string
  ended_at?: string
}

export interface StreamMessage {
  id: string
  stream_id: string
  user_id: string
  message: string
  type: MessageType
  
  // User info (populated)
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
  
  created_at: string
}

export interface StreamViewer {
  id: string
  stream_id: string
  user_id?: string
  joined_at: string
  left_at?: string
  watch_time: number // seconds
  
  // User info (populated)
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
}

// API request types
export interface CreateStreamRequest {
  title: string
  description: string
  category: string
  tags: string[]
  is_public: boolean
  allow_chat: boolean
}

export interface StartStreamRequest {
  stream_id: string
}

export interface EndStreamRequest {
  stream_id: string
}

export interface SendMessageRequest {
  stream_id: string
  message: string
  type?: MessageType
}

