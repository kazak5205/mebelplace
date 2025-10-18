/**
 * Video types for TikTok-style feed
 */

export type VideoStatus = 
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'moderating'
  | 'rejected'

export interface Location {
  lat: number
  lng: number
  address: string
  city: string
  country: string
}

export interface Video {
  id: string
  author_id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number // seconds
  width: number
  height: number
  size: number // bytes
  
  // Metadata
  category: string
  tags: string[]
  location?: Location
  
  // 3D Model (for furniture AR)
  model_url?: string
  has_ar: boolean
  
  // Stats
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  save_count: number
  
  // Status
  status: VideoStatus
  is_public: boolean
  allow_comments: boolean
  allow_download: boolean
  
  // User interaction (for current user)
  is_liked?: boolean
  is_saved?: boolean
  
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
  updated_at: string
  published_at?: string
}

export interface Comment {
  id: string
  video_id: string
  user_id: string
  parent_id?: string
  text: string
  like_count: number
  
  // User info (populated)
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
    role: 'buyer' | 'master' | 'admin'
  }
  
  // Replies
  replies?: Comment[]
  reply_count?: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface FeedResponse {
  videos: Video[]
  next_cursor?: string
  has_more: boolean
}

// API request types
export interface CreateCommentRequest {
  video_id: string
  text: string
  parent_id?: string
}

export interface UploadVideoRequest {
  title: string
  description: string
  category: string
  tags: string[]
  location?: Location
  is_public: boolean
  allow_comments: boolean
  allow_download: boolean
  model_url?: string // For AR
}

export interface UploadVideoResponse {
  id: string
  upload_url: string // Presigned URL for S3 upload
  video_url: string
}

