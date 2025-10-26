class AppConstants {
  // API Configuration
  static const String baseUrl = 'https://mebelplace.com.kz/api';
  static const String socketUrl = 'https://mebelplace.com.kz';
  
  // App Configuration
  static const String appName = 'MebelPlace';
  static const String appVersion = '1.0.0';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  
  // Video Configuration
  static const int maxVideoDuration = 300; // 5 minutes
  static const int maxVideoSize = 200 * 1024 * 1024; // 200MB
  static const List<String> allowedVideoFormats = ['mp4', 'mov', 'avi', 'mkv'];
  
  // Image Configuration
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 50;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // TikTok-style Configuration
  static const double videoAspectRatio = 9 / 16;
  static const double actionButtonSize = 48.0;
  static const double avatarSize = 48.0;
  
  // Order Categories
  static const List<String> orderCategories = [
    'furniture',
    'carpentry',
    'upholstery',
    'restoration',
    'custom',
    'repair',
    'other',
  ];
  
  // Regions of Kazakhstan
  static const List<String> kzRegions = [
    'Алматы',
    'Астана',
    'Шымкент',
    'Алматинская область',
    'Акмолинская область',
    'Актюбинская область',
    'Атырауская область',
    'Восточно-Казахстанская область',
    'Жамбылская область',
    'Западно-Казахстанская область',
    'Карагандинская область',
    'Костанайская область',
    'Кызылординская область',
    'Мангистауская область',
    'Павлодарская область',
    'Северо-Казахстанская область',
    'Туркестанская область',
  ];
}
