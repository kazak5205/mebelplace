// Общие типы для всего приложения MebelPlace

export interface User {
  id: number
  username: string
  display_name?: string
  email?: string
  phone?: string
  avatar?: string
  role: 'buyer' | 'master' | 'admin'
  region: string
  created_at: string
  updated_at: string
  is_verified?: boolean
}

export interface Video {
  id: number
  title: string
  description: string
  path: string
  thumbnail_path: string
  author: {
    id: number
    username: string
    display_name?: string
    avatar?: string
    region: string
  }
  likes_count: number
  comments_count: number
  views_count: number
  is_liked: boolean
  is_favorited: boolean
  price?: number
  hashtags: string[]
  is_ad: boolean
  created_at: string
  updated_at: string
  audio_info?: {
    title: string
    artist: string
    url: string
  }
}

export interface Comment {
  id: number
  content: string
  author: {
    id: number
    username: string
    display_name?: string
    avatar?: string
  }
  created_at: string
  updated_at: string
  likes_count: number
  is_liked: boolean
}

export interface Request {
  id: number
  title: string
  description: string
  category: string
  photo_url?: string
  budget?: number
  timeline?: string
  region: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  author: {
    id: number
    username: string
    display_name?: string
    avatar?: string
    region: string
  }
  responses_count: number
}

export interface Order {
  id: number
  title: string
  description: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  price: number
  timeline: string
  created_at: string
  updated_at: string
  buyer: User
  master: User
  video_id?: number
  request_id?: number
}

export interface Chat {
  id: number
  name?: string
  type: 'direct' | 'group' | 'channel'
  participants: User[]
  last_message?: {
    id: number
    content: string
    author: User
    created_at: string
  }
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  content: string
  type: 'text' | 'image' | 'video' | 'file' | 'system'
  author: User
  chat_id: number
  created_at: string
  updated_at: string
  attachments?: {
    type: string
    url: string
    name?: string
    size?: number
  }[]
}

export interface Channel {
  id: number
  name: string
  description?: string
  avatar?: string
  type: 'public' | 'private'
  subscribers_count: number
  is_subscribed: boolean
  owner: User
  created_at: string
  updated_at: string
}

// Gamification types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  is_unlocked: boolean
  unlocked_at?: string
}

export interface UserStats {
  level: number
  experience: number
  points: number
  achievements: Achievement[]
  position: number
  videos_count?: number
  followers_count?: number
  following_count?: number
  likes_count?: number
}

export interface LeaderboardEntry {
  user: User
  points: number
  level: number
  position: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface LoginFormData {
  identifier: string // email or username
  password: string
  remember?: boolean
}

export interface RegisterFormData {
  username: string
  display_name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  role: 'buyer' | 'master'
  region: string
  terms_accepted: boolean
}

export interface OrderFormData {
  name: string
  phone: string
  email: string
  address: string
  requirements: string
  additional_info?: string
  budget?: number
  timeline?: string
}

// Search types
export interface SearchResult {
  id: number
  type: 'video' | 'channel' | 'user'
  title: string
  description?: string
  thumbnail?: string
  author?: string
  views?: number
  followers?: number
  subscribers?: number
}

export interface SearchFilters {
  type: 'all' | 'videos' | 'channels' | 'users'
  region?: string
}

// Region type
export interface Region {
  code: string
  name: string
  type?: string
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'ru' | 'en' | 'kk'

// Error monitoring types
export interface ErrorInfo {
  error: Error
  errorInfo?: any
  userId?: string
  context?: string
  timestamp?: number
  userAgent?: string
  url?: string
}

export interface PerformanceInfo {
  metric: string
  value: number
  context?: string
  timestamp?: number
}

// Component props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Status types
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type UserRole = 'buyer' | 'master' | 'admin'
export type ChatType = 'direct' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'system'
export type ChannelType = 'public' | 'private'

