// API Configuration (синхронизировано с shared/config.ts)
export const API_CONFIG = {
  BASE_URL: 'https://mebelplace.com.kz/api',
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

// User Roles (синхронизировано с shared/types.ts)
export const USER_ROLES = {
  CLIENT: 'client',      // было CUSTOMER
  MASTER: 'master',      // было SUPPLIER
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

// Colors (синхронизировано с shared/design-system/tokens.ts)
export const COLORS = {
  PRIMARY: '#f97316',    // Orange (было #2196F3 синий)
  SECONDARY: '#ea580c',  // Orange dark
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  LIGHT: '#f8fafc',
  DARK: '#0f0f0f',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#6b7280',
  LIGHT_GRAY: '#e5e7eb',
  DARK_GRAY: '#374151',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;
