import '../constants/app_constants.dart';

class ImageHelper {
  // Базовый URL без /api
  static const String baseImageUrl = 'https://mebelplace.com.kz';
  
  /// Построить полный URL для изображения
  static String getFullImageUrl(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return '';
    }
    
    // Если уже полный URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Если начинается с /
    if (imagePath.startsWith('/')) {
      return '$baseImageUrl$imagePath';
    }
    
    // Иначе добавляем / в начало
    return '$baseImageUrl/$imagePath';
  }
  
  /// Проверить, есть ли валидный путь к изображению
  static bool hasValidImagePath(String? imagePath) {
    if (imagePath == null || imagePath.isEmpty) {
      return false;
    }
    return true;
  }
  
  /// Получить placeholder для аватара
  static String getAvatarPlaceholder() {
    return 'https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff&size=200';
  }
  
  /// Получить placeholder для аватара пользователя по имени
  static String getAvatarPlaceholderForUser(String? name) {
    final userName = name?.replaceAll(' ', '+') ?? 'User';
    return 'https://ui-avatars.com/api/?name=$userName&background=FF6B35&color=fff&size=200';
  }
}

