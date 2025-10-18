/**
 * Centralized API types for MebelPlace
 * Provides type safety across the application
 */

// Base API response structure
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp?: string;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  total_pages?: number;
}

// Error response structure
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
  validation_errors?: Record<string, string[]>;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  region: string;
  role: 'client' | 'master' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  bio?: string;
  rating?: number;
  followers_count?: number;
  following_count?: number;
  videos_count?: number;
}

// Video types
export interface Video {
  id: number;
  title: string;
  description: string;
  path: string;
  thumbnail_path: string;
  user_id: number;
  author: User;
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
  duration?: number;
  category?: string;
  tags?: string[];
}

// Request types
export interface Request {
  id: number;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  category: string;
  region: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  client_id: number;
  client: User;
  created_at: string;
  updated_at: string;
  proposals_count?: number;
  accepted_proposal_id?: number;
}

// Proposal types
export interface Proposal {
  id: number;
  request_id: number;
  master_id: number;
  master: User;
  price: number;
  timeline: number; // days
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Chat types
export interface Chat {
  id: number;
  participants: User[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender: User;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  read_at?: string;
}

// Subscription types
export interface Subscription {
  id: number;
  subscriber_id: number;
  channel_id: number;
  channel: User;
  created_at: string;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// Search types
export interface SearchResult {
  id: string;
  type: 'video' | 'user' | 'request';
  title: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  views?: number;
  followers?: number;
  rating?: number;
  price?: number;
  location?: string;
  tags: string[];
}

// Analytics types
export interface AnalyticsEvent {
  event_type: string;
  user_id?: number;
  video_id?: number;
  request_id?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
}

// Upload types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  user_id?: number;
}

// Form types
export interface LoginForm {
  email_or_phone: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email_or_phone: string;
  password: string;
  confirm_password: string;
  region: string;
  role: 'client' | 'master';
  agree_to_terms: boolean;
}

export interface CreateRequestForm {
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  category: string;
  region: string;
}

export interface CreateProposalForm {
  request_id: number;
  price: number;
  timeline: number;
  message: string;
}

// Filter and sort types
export interface VideoFilters {
  category?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort_by?: 'newest' | 'oldest' | 'popular' | 'rating' | 'price';
}

export interface UserFilters {
  role?: 'client' | 'master';
  region?: string;
  min_rating?: number;
  is_verified?: boolean;
  sort_by?: 'newest' | 'oldest' | 'rating' | 'followers';
}

export interface RequestFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  category?: string;
  region?: string;
  min_budget?: number;
  max_budget?: number;
  sort_by?: 'newest' | 'oldest' | 'budget' | 'deadline';
}

// API hook return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  loading: boolean;
  error: ApiError | null;
  data: T | null;
}

// Environment types
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  appName: string;
  appVersion: string;
  environment: 'development' | 'production' | 'test';
  features: {
    streaming: boolean;
    analytics: boolean;
    pwa: boolean;
    darkMode: boolean;
  };
}
