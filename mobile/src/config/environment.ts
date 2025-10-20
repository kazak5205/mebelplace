// Environment configuration
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'https://mebelplace.com.kz',
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID || 'mebelplace-mobile-app',
  IS_DEV: __DEV__,
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_URL,
  SOCKET_URL: ENV.SOCKET_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'MebelPlace',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.mebelplace.mobile',
  PROJECT_ID: ENV.PROJECT_ID,
};
