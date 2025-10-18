/**
 * TypeScript types for MebelPlace API
 * Generated from OpenAPI specification
 */

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: number;
  username: string;
  avatar_url?: string;
  bio?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Video {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  path: string;
  thumbnail_path?: string;
  size_bytes: number;
  hashtags?: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  product_price?: number;
  product_description?: string;
  is_product: boolean;
  is_ad: boolean;
  created_at: string;
  author: PublicUser;
}

export interface Comment {
  id: number;
  user_id: number;
  video_id: number;
  text: string;
  parent_id?: number;
  likes_count: number;
  created_at: string;
  author: PublicUser;
  replies?: Comment[];
}

export interface Request {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  budget?: number;
  region?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  photos?: string[];
  created_at: string;
  updated_at: string;
  author: PublicUser;
  proposals_count: number;
}

export interface Proposal {
  id: number;
  request_id: number;
  user_id: number;
  message: string;
  price: number;
  photos?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  author: PublicUser;
}

export interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  text: string;
  type: 'text' | 'image' | 'video' | 'file';
  file_url?: string;
  created_at: string;
  author: PublicUser;
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string;
  subscribers_count: number;
  posts_count: number;
  is_subscribed: boolean;
  created_at: string;
}

export interface ChannelPost {
  id: number;
  channel_id: number;
  content: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  channel: Channel;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'like' | 'comment' | 'follow' | 'message' | 'call' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  like_notifications: boolean;
  comment_notifications: boolean;
  follow_notifications: boolean;
  message_notifications: boolean;
  call_notifications: boolean;
}

export interface Call {
  id: number;
  caller_id: number;
  receiver_id: number;
  type: 'audio' | 'video';
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'cancelled';
  duration?: number;
  started_at: string;
  ended_at?: string;
}

export interface UserAnalytics {
  period: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  profile_views: number;
  new_followers: number;
  videos_uploaded: number;
  requests_created: number;
}

export interface PlatformAnalytics {
  total_users: number;
  active_users: number;
  total_videos: number;
  total_requests: number;
  total_calls: number;
  platform_revenue: number;
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  commission_revenue: number;
  subscription_revenue: number;
  ad_revenue: number;
  growth_rate: number;
}

export interface EngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  retention_rate: number;
  engagement_rate: number;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  user: PublicUser;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  error: string;
  code: number;
  details?: any;
}

// Request/Response types
export interface LoginRequest {
  email_or_phone: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email_or_phone: string;
  password: string;
  username?: string;
}

export interface RegisterResponse {
  token?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token?: string;
  access_token: string;
  expires_in: number;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface CreateRequestRequest {
  title: string;
  description: string;
  category: string;
  budget?: number;
  region?: string;
  photos?: string[];
}

export interface CreateProposalRequest {
  message: string;
  price: number;
  photos?: string[];
}

export interface CreateChatRequest {
  user_id: number;
}

export interface SendMessageRequest {
  text: string;
  type?: 'text' | 'image' | 'video' | 'file';
  file_url?: string;
}

export interface CreateChannelPostRequest {
  content: string;
  media_urls?: string[];
}

export interface SearchRequest {
  q: string;
  type?: 'all' | 'users' | 'videos' | 'requests';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  users?: PublicUser[];
  videos?: Video[];
  requests?: Request[];
  pagination?: Pagination;
}

export interface NotificationSettingsRequest {
  push_enabled?: boolean;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  like_notifications?: boolean;
  comment_notifications?: boolean;
  follow_notifications?: boolean;
  message_notifications?: boolean;
  call_notifications?: boolean;
}

export interface PushTokenRequest {
  token: string;
  platform?: 'ios' | 'android' | 'web';
}

export interface InitiateCallRequest {
  user_id: number;
  type?: 'audio' | 'video';
}

export interface InitiateSecureCallRequest {
  user_id: number;
  type?: 'audio' | 'video';
  restrictions?: {
    max_duration?: number;
    require_verification?: boolean;
  };
}

export interface CallStatistics {
  total_calls: number;
  total_duration: number;
  successful_calls: number;
  failed_calls: number;
}

export interface WebRTCToken {
  token: string;
  ice_servers: Array<{
    urls: string[];
    username?: string;
    credential?: string;
  }>;
}
