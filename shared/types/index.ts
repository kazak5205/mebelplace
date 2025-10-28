// Общие типы для всех частей системы

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  // Поля для мебельных компаний (role='master')
  companyName?: string;
  companyAddress?: string;
  companyDescription?: string;
  avatar?: string;
  phone?: string;
  role: 'guest' | 'user' | 'master' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  authorId: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  parentId?: string;
  likes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  replies?: VideoComment[];
}

export interface Order {
  id: string;
  title: string;
  description: string;
  images: string[];
  clientId: string;
  masterId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price?: number;
  deadline?: string;
  location: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: User;
  master?: User;
  responses?: OrderResponse[];
  responseCount?: number;
}

export interface OrderResponse {
  id: string;
  orderId: string;
  masterId: string;
  message: string;
  price?: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  master?: User;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  orderId?: string;
  clientId: string;
  masterId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount?: number;
  userRole?: string;
  lastReadAt?: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastReadAt: string;
  user?: User;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'voice';
  replyTo?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface PaginationResponse<T = any> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
}

export interface VideoCall {
  id: string;
  roomId: string;
  chatId: string;
  initiatorId: string;
  status: 'initiated' | 'active' | 'ended' | 'cancelled';
  createdAt: string;
  endedAt?: string;
  participants?: VideoCallParticipant[];
}

export interface VideoCallParticipant {
  id: string;
  roomId: string;
  userId: string;
  status: 'joined' | 'left';
  joinedAt: string;
  leftAt?: string;
}

export interface OrderCategory {
  id: string;
  name: string;
  description: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: string;
  sender: User;
  timestamp: string;
  isOwn: boolean;
  replyTo?: Message;
  file?: {
    name: string;
    size: number;
    url: string;
  };
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: string;
}

export interface SwipeGesture {
  direction: 'up' | 'down' | 'left' | 'right';
  velocity: number;
  distance: number;
}

export interface NotificationSettings {
  push: boolean;
  sms: boolean;
  email: boolean;
  newMessages: boolean;
  newOrders: boolean;
  newVideos: boolean;
  newComments: boolean;
  newSubscribers: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'ru' | 'en' | 'kk';
  notifications: NotificationSettings;
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
}

export interface MasterProfile {
  id: string;
  userId: string;
  bio: string;
  location: string;
  website?: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  portfolio: string[];
  services: string[];
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  channelId: string;
  createdAt: string;
  subscriber?: User;
  channel?: User;
}

export interface TrendingVideo extends Video {
  trendingScore: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  authorId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface ChatFilters {
  type?: 'private' | 'group';
  orderId?: string;
  isActive?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: string;
  category?: string;
  clientId?: string;
  masterId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface VideoFilters {
  category?: string;
  authorId?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SocketConnection {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: string;
  lastDisconnected?: string;
}

