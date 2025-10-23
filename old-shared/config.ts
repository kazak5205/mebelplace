// Единая конфигурация для всех частей системы MebelPlace

export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test'
} as const;

export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];

// Определяем текущее окружение
export const getCurrentEnvironment = (): Environment => {
  // В браузере нет process, используем window или production по умолчанию
  if (typeof window !== 'undefined') {
    return ENVIRONMENTS.PRODUCTION;
  }
  // В Node.js окружении
  return ENVIRONMENTS.PRODUCTION;
};

// ============================================
// API Configuration
// ============================================
export const API_CONFIG = {
  PRODUCTION: {
    BASE_URL: 'https://mebelplace.com.kz',
    API_URL: 'https://mebelplace.com.kz/api',
    SOCKET_URL: 'https://mebelplace.com.kz',
    TIMEOUT: 10000,
  },
  DEVELOPMENT: {
    BASE_URL: 'http://localhost',
    API_URL: 'http://localhost/api',
    SOCKET_URL: 'http://localhost',
    TIMEOUT: 10000,
  },
  TEST: {
    BASE_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3001/api',
    SOCKET_URL: 'http://localhost:3001',
    TIMEOUT: 5000,
  }
};

// Получить конфигурацию API для текущего окружения
export const getApiConfig = (env?: Environment) => {
  const currentEnv = env || getCurrentEnvironment();
  return API_CONFIG[currentEnv.toUpperCase() as keyof typeof API_CONFIG] || API_CONFIG.PRODUCTION;
};

// ============================================
// Upload Configuration
// ============================================
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  PATHS: {
    VIDEOS: '/uploads/videos',
    THUMBNAILS: '/uploads/thumbnails',
    AVATARS: '/uploads/avatars',
    ORDER_PHOTOS: '/uploads/order-photos',
    CHAT_FILES: '/uploads/chat-files',
  }
};

// ============================================
// WebSocket Configuration
// ============================================
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
  PING_INTERVAL: 25000,
  PONG_TIMEOUT: 5000,
};

// ============================================
// Pagination Configuration
// ============================================
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// ============================================
// JWT Configuration
// ============================================
export const JWT_CONFIG = {
  EXPIRE_TIME: '24h',
  REFRESH_EXPIRE_TIME: '7d',
  ALGORITHM: 'HS256' as const,
};

// ============================================
// Regions & Cities (Kazakhstan)
// ============================================
export const REGIONS = {
  ALMATY: 'Алматы',
  ASTANA: 'Астана',
  SHYMKENT: 'Шымкент',
  ALMATY_REGION: 'Алматинская область',
  AKMOLA: 'Акмолинская область',
  AKTOBE: 'Актюбинская область',
  ATYRAU: 'Атырауская область',
  EAST_KAZAKHSTAN: 'Восточно-Казахстанская область',
  ZHAMBYL: 'Жамбылская область',
  WEST_KAZAKHSTAN: 'Западно-Казахстанская область',
  KARAGANDA: 'Карагандинская область',
  KOSTANAY: 'Костанайская область',
  KYZYLORDA: 'Кызылординская область',
  MANGYSTAU: 'Мангистауская область',
  PAVLODAR: 'Павлодарская область',
  NORTH_KAZAKHSTAN: 'Северо-Казахстанская область',
  TURKESTAN: 'Туркестанская область',
  ULYTAU: 'Улытауская область',
  ABAI: 'Абайская область',
  ZHETYSU: 'Жетісуская область',
} as const;

export const REGION_LIST = Object.entries(REGIONS).map(([key, value]) => ({
  id: key,
  name: value,
}));

// ============================================
// Specialties (Master Specializations)
// ============================================
export const SPECIALTIES = [
  'Изготовление мебели',
  'Ремонт мебели',
  'Перетяжка мебели',
  'Сборка мебели',
  'Реставрация мебели',
  'Изготовление кухонь',
  'Изготовление шкафов-купе',
  'Столярные работы',
  'Декоративная отделка',
  'Изготовление мягкой мебели',
  'Изготовление корпусной мебели',
] as const;

// ============================================
// Video Configuration
// ============================================
export const VIDEO_CONFIG = {
  MAX_DURATION: 180, // 3 minutes in seconds
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  THUMBNAIL_WIDTH: 320,
  THUMBNAIL_HEIGHT: 180,
  QUALITY: {
    LOW: '360p',
    MEDIUM: '480p',
    HIGH: '720p',
    FULL_HD: '1080p',
  },
};

// ============================================
// Chat Configuration
// ============================================
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  TYPING_TIMEOUT: 3000, // 3 seconds
  MESSAGE_BATCH_SIZE: 50,
};

// ============================================
// Order Configuration  
// ============================================
export const ORDER_CONFIG = {
  STATUSES: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
};

// ============================================
// App Information
// ============================================
export const APP_INFO = {
  NAME: 'MebelPlace',
  VERSION: '1.0.0',
  DESCRIPTION: 'Платформа для заказа и продажи мебели в Казахстане',
  BUNDLE_ID: 'com.mebelplace.mobile',
  WEBSITE: 'https://mebelplace.com.kz',
  SUPPORT_EMAIL: 'support@mebelplace.com.kz',
  SUPPORT_PHONE: '+7 (700) 123-45-67',
};

// ============================================
// Error Messages
// ============================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  AUTH_ERROR: 'Ошибка аутентификации. Пожалуйста, войдите снова.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  NOT_FOUND: 'Ресурс не найден.',
  PERMISSION_DENIED: 'Доступ запрещен.',
  FILE_TOO_LARGE: 'Файл слишком большой.',
  INVALID_FILE_TYPE: 'Неверный тип файла.',
};

// ============================================
// Success Messages
// ============================================
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Заказ успешно создан!',
  ORDER_UPDATED: 'Заказ успешно обновлен!',
  MESSAGE_SENT: 'Сообщение отправлено!',
  VIDEO_UPLOADED: 'Видео успешно загружено!',
  PROFILE_UPDATED: 'Профиль обновлен!',
};

// ============================================
// Export helpers
// ============================================
export const getApiUrl = (env?: Environment) => getApiConfig(env).API_URL;
export const getSocketUrl = (env?: Environment) => getApiConfig(env).SOCKET_URL;
export const getBaseUrl = (env?: Environment) => getApiConfig(env).BASE_URL;

