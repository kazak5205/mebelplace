/**
 * Story types (Instagram-style 24h stories)
 */

export type MediaType = 'image' | 'video'

export interface Story {
  id: string
  author_id: string
  media_url: string
  thumbnail_url: string
  media_type: MediaType
  duration: number // seconds (for video), 5 for image
  width: number
  height: number
  size: number // bytes
  
  // Text overlay (optional)
  text?: string
  text_color?: string
  text_bg_color?: string
  
  // Link (swipe up)
  link_url?: string
  link_text?: string
  
  // Stats
  view_count: number
  
  // Highlight
  is_highlight: boolean // Permanent story
  highlight_name?: string
  
  // User interaction (for current user)
  is_viewed?: boolean
  
  // Author info (populated)
  author?: {
    id: string
    name: string
    username: string
    avatar_url: string
    is_verified: boolean
  }
  
  // Timestamps
  created_at: string
  expires_at: string // created_at + 24h (ignored for highlights)
}

export interface Channel {
  author_id: string
  total_stories: number
  unviewed_count: number
  latest_story_at: string
  has_unviewed: boolean
  
  // Author info (populated)
  author: {
    id: string
    name: string
    username: string
    avatar_url: string
    is_verified: boolean
  }
}

export interface CreateStoryRequest {
  text?: string
  text_color?: string
  text_bg_color?: string
  link_url?: string
  link_text?: string
}

export interface UploadStoryResponse {
  id: string
  upload_url: string // Presigned URL for S3 upload
  media_url: string
}

export interface MakeHighlightRequest {
  story_id: string
  name: string
}

