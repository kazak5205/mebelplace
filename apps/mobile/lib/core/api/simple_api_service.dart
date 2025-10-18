import 'package:dio/dio.dart';
import 'simple_auth_service.dart';

/// Простой API сервис для всех эндпоинтов
class SimpleApiService {
  static final SimpleApiService _instance = SimpleApiService._internal();
  factory SimpleApiService() => _instance;
  SimpleApiService._internal();

  final Dio _dio = Dio();
  final _authService = SimpleAuthService();
  
  static const String _baseUrl = 'https://mebelplace.com.kz/api/v2';

  void init() {
    _dio.options.baseUrl = _baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Добавляем интерсептор для автоматического добавления токена
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _authService.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  // ========== ВИДЕО ==========
  
  /// Получить ленту видео
  Future<Map<String, dynamic>?> getVideoFeed({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/videos/feed', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Get video feed error: $e');
      return null;
    }
  }

  /// Загрузить видео
  Future<Map<String, dynamic>?> uploadVideo({
    required String filePath,
    required String title,
    String? description,
    String? category,
  }) async {
    try {
      final formData = FormData.fromMap({
        'video': await MultipartFile.fromFile(filePath),
        'title': title,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
      });
      
      final response = await _dio.post('/videos/upload', data: formData);
      return response.data;
    } catch (e) {
      print('Upload video error: $e');
      return null;
    }
  }

  /// Лайкнуть видео
  Future<bool> likeVideo(String videoId) async {
    try {
      final response = await _dio.post('/videos/$videoId/like');
      return response.statusCode == 200;
    } catch (e) {
      print('Like video error: $e');
      return false;
    }
  }

  /// Убрать лайк с видео
  Future<bool> unlikeVideo(String videoId) async {
    try {
      final response = await _dio.post('/videos/$videoId/unlike');
      return response.statusCode == 200;
    } catch (e) {
      print('Unlike video error: $e');
      return false;
    }
  }

  // ========== СТОРИСЫ ==========
  
  /// Получить сторисы
  Future<List<dynamic>?> getStories() async {
    try {
      final response = await _dio.get('/stories');
      return response.data;
    } catch (e) {
      print('Get stories error: $e');
      return null;
    }
  }

  /// Создать сторис
  Future<Map<String, dynamic>?> createStory({
    required String filePath,
    String? text,
  }) async {
    try {
      final formData = FormData.fromMap({
        'media': await MultipartFile.fromFile(filePath),
        if (text != null) 'text': text,
      });
      
      final response = await _dio.post('/stories', data: formData);
      return response.data;
    } catch (e) {
      print('Create story error: $e');
      return null;
    }
  }

  // ========== ЗАЯВКИ ==========
  
  /// Получить заявки
  Future<List<dynamic>?> getRequests({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/requests', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Get requests error: $e');
      return null;
    }
  }

  /// Создать заявку
  Future<Map<String, dynamic>?> createRequest({
    required String title,
    required String description,
    required double budget,
    required String category,
    String? location,
  }) async {
    try {
      final response = await _dio.post('/requests', data: {
        'title': title,
        'description': description,
        'budget': budget,
        'category': category,
        if (location != null) 'location': location,
      });
      return response.data;
    } catch (e) {
      print('Create request error: $e');
      return null;
    }
  }

  // ========== ЧАТЫ ==========
  
  /// Получить чаты
  Future<List<dynamic>?> getChats() async {
    try {
      final response = await _dio.get('/chats');
      return response.data;
    } catch (e) {
      print('Get chats error: $e');
      return null;
    }
  }

  /// Создать чат
  Future<Map<String, dynamic>?> createChat(String userId) async {
    try {
      final response = await _dio.post('/chats', data: {
        'user_id': userId,
      });
      return response.data;
    } catch (e) {
      print('Create chat error: $e');
      return null;
    }
  }

  /// Получить сообщения чата
  Future<List<dynamic>?> getChatMessages(String chatId, {int page = 1, int limit = 50}) async {
    try {
      final response = await _dio.get('/chats/$chatId/messages', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Get chat messages error: $e');
      return null;
    }
  }

  /// Отправить сообщение
  Future<Map<String, dynamic>?> sendMessage(String chatId, String text) async {
    try {
      final response = await _dio.post('/chats/$chatId/messages', data: {
        'text': text,
      });
      return response.data;
    } catch (e) {
      print('Send message error: $e');
      return null;
    }
  }

  // ========== ПОИСК ==========
  
  /// Универсальный поиск
  Future<Map<String, dynamic>?> search(String query, {int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/search', queryParameters: {
        'q': query,
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Search error: $e');
      return null;
    }
  }

  /// Поиск пользователей
  Future<List<dynamic>?> searchUsers(String query, {int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/search/users', queryParameters: {
        'q': query,
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Search users error: $e');
      return null;
    }
  }

  // ========== ГОЛОСОВЫЕ КОМНАТЫ ==========
  
  /// Получить голосовые комнаты
  Future<List<dynamic>?> getVoiceRooms() async {
    try {
      final response = await _dio.get('/voice-rooms');
      return response.data;
    } catch (e) {
      print('Get voice rooms error: $e');
      return null;
    }
  }

  /// Создать голосовую комнату
  Future<Map<String, dynamic>?> createVoiceRoom({
    required String name,
    String? description,
    int maxParticipants = 10,
  }) async {
    try {
      final response = await _dio.post('/voice-rooms', data: {
        'name': name,
        if (description != null) 'description': description,
        'max_participants': maxParticipants,
      });
      return response.data;
    } catch (e) {
      print('Create voice room error: $e');
      return null;
    }
  }

  // ========== ГЕЙМИФИКАЦИЯ ==========
  
  /// Получить уровень пользователя
  Future<Map<String, dynamic>?> getUserLevel() async {
    try {
      final response = await _dio.get('/gamification/level');
      return response.data;
    } catch (e) {
      print('Get user level error: $e');
      return null;
    }
  }

  /// Получить достижения
  Future<List<dynamic>?> getUserAchievements() async {
    try {
      final response = await _dio.get('/gamification/achievements');
      return response.data;
    } catch (e) {
      print('Get achievements error: $e');
      return null;
    }
  }

  /// Получить таблицу лидеров
  Future<List<dynamic>?> getLeaderboard({int limit = 50}) async {
    try {
      final response = await _dio.get('/gamification/leaderboard', queryParameters: {
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Get leaderboard error: $e');
      return null;
    }
  }

  // ========== УВЕДОМЛЕНИЯ ==========
  
  /// Получить уведомления
  Future<List<dynamic>?> getNotifications({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/notifications', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return response.data;
    } catch (e) {
      print('Get notifications error: $e');
      return null;
    }
  }

  /// Отметить уведомление прочитанным
  Future<bool> markNotificationRead(String notificationId) async {
    try {
      final response = await _dio.post('/notifications/$notificationId/read');
      return response.statusCode == 200;
    } catch (e) {
      print('Mark notification read error: $e');
      return false;
    }
  }
}
