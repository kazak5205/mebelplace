export interface Notification {
  id: number
  type: 'like' | 'comment' | 'follow' | 'order' | 'request' | 'system'
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  action_text?: string
}

export interface Comment {
  id: number
  content: string
  author: {
    id: number
    username: string
    avatar?: string
  }
  created_at: string
  likes_count: number
  is_liked: boolean
}

export interface Follower {
  id: number
  username: string
  avatar?: string
  region: string
  followers_count: number
  is_following: boolean
}
