// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://mebelplace.com.kz/api/v1',
  SOCKET_URL: 'https://mebelplace.com.kz',
  TIMEOUT: 10000,
};

// WebSocket Events
export const SOCKET_EVENTS = {
  VIDEO_LIKED: 'video_liked',
  NEW_COMMENT: 'new_comment',
  NEW_MESSAGE: 'new_message',
  NEW_ORDER_RESPONSE: 'new_order_response',
  ORDER_ACCEPTED: 'order_accepted',
  USER_ONLINE: 'user_online',
} as const;

// Video Gestures
export const GESTURE_THRESHOLD = 50;

// Video Categories
export const VIDEO_CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'furniture', label: 'Мебель' },
  { key: 'decor', label: 'Декор' },
  { key: 'kitchen', label: 'Кухня' },
  { key: 'bedroom', label: 'Спальня' },
  { key: 'living', label: 'Гостиная' },
] as const;

// Order Categories
export const ORDER_CATEGORIES = [
  { key: 'furniture', label: 'Мебель' },
  { key: 'decor', label: 'Декор' },
  { key: 'kitchen', label: 'Кухня' },
  { key: 'bedroom', label: 'Спальня' },
  { key: 'living', label: 'Гостиная' },
  { key: 'office', label: 'Офис' },
  { key: 'garden', label: 'Сад' },
  { key: 'other', label: 'Другое' },
] as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  VOICE: 'voice',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

// File Upload
export const UPLOAD_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_VIDEO_DURATION: 60, // 60 seconds
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_ORDER_TITLE_LENGTH: 5,
  MIN_ORDER_DESCRIPTION_LENGTH: 20,
  MAX_MESSAGE_LENGTH: 1000,
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#FF9800',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  LIGHT: '#F5F5F5',
  DARK: '#212121',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#9E9E9E',
  LIGHT_GRAY: '#E0E0E0',
  DARK_GRAY: '#616161',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;
