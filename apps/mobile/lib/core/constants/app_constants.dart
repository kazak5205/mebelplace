/// Application constants for MebelPlace Mobile App
class AppConstants {
  // Private constructor to prevent instantiation
  AppConstants._();

  // ========== STORAGE KEYS ==========
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String isFirstLaunchKey = 'is_first_launch';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language';
  static const String notificationsEnabledKey = 'notifications_enabled';
  static const String biometricEnabledKey = 'biometric_enabled';

  // ========== API CONSTANTS ==========
  static const String apiVersion = 'v2';
  static const int requestTimeout = 30; // seconds
  static const int maxRetries = 3;

  // ========== PAGINATION ==========
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // ========== FILE CONSTANTS ==========
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
  static const int maxVideoSize = 100 * 1024 * 1024; // 100MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
  static const List<String> allowedVideoTypes = ['mp4', 'mov', 'avi'];

  // ========== UI CONSTANTS ==========
  static const double borderRadius = 12.0;
  static const double cardElevation = 4.0;
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;

  // ========== ANIMATION CONSTANTS ==========
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // ========== VALIDATION CONSTANTS ==========
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 50;
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 30;

  // ========== NOTIFICATION CONSTANTS ==========
  static const String defaultNotificationChannelId = 'mebelplace_default';
  static const String defaultNotificationChannelName = 'MebelPlace Notifications';

  // ========== SHARING CONSTANTS ==========
  static const String appStoreUrl = 'https://apps.apple.com/app/mebelplace';
  static const String playStoreUrl = 'https://play.google.com/store/apps/details?id=com.mebelplace.app';
  static const String websiteUrl = 'https://mebelplace.com.kz';

  // ========== SUPPORT CONSTANTS ==========
  static const String supportEmail = 'support@mebelplace.com.kz';
  static const String supportPhone = '+7 777 777 77 77';

  // ========== FEATURE FLAGS ==========
  static const bool enableBiometricAuth = true;
  static const bool enableOfflineMode = true;
  static const bool enablePushNotifications = true;
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;

  // ========== GAMIFICATION CONSTANTS ==========
  static const int pointsForLike = 5;
  static const int pointsForComment = 10;
  static const int pointsForVideoWatch = 30;
  static const int pointsForVideoPost = 50;
  static const int pointsForRequestCreate = 20;

  // ========== WEBSOCKET CONSTANTS ==========
  static const String wsBaseUrl = 'wss://mebelplace.com.kz';

  // ========== API BASE URL ==========
  static const String apiBaseUrl = 'https://mebelplace.com.kz/api/v2';
  static const String healthUrl = 'https://mebelplace.com.kz/health';

  // ========== TIMEOUT CONSTANTS ==========
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // ========== CACHE BOX NAMES ==========
  static const String videoCacheBox = 'video_cache';
  static const String searchCacheBox = 'search_cache';
}