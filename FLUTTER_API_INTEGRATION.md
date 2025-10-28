# 📱 Интеграция Flutter приложения с бэкендом MebelPlace

## 🎯 Базовая конфигурация

### 1. API Endpoint
```dart
// lib/config/api_config.dart

class ApiConfig {
  // Основной домен
  static const String baseUrl = 'https://mebelplace.com.kz';
  
  // API базовый путь
  static const String apiPath = '/api';
  
  // Полный URL API
  static String get apiUrl => '$baseUrl$apiPath';
  
  // Таймауты
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
```

---

## 🔧 Настройка HTTP клиента (Dio)

### 2. Создание API Service

```dart
// lib/services/api_service.dart

import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../utils/storage.dart';

class ApiService {
  late Dio _dio;
  
  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.apiUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Добавляем токен к каждому запросу
        final token = await Storage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        
        print('📤 REQUEST: ${options.method} ${options.path}');
        print('   Headers: ${options.headers}');
        if (options.data != null) {
          print('   Body: ${options.data}');
        }
        
        return handler.next(options);
      },
      
      onResponse: (response, handler) {
        print('📥 RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
        print('   Data: ${response.data}');
        return handler.next(response);
      },
      
      onError: (error, handler) async {
        print('❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.path}');
        print('   Error: ${error.response?.data}');
        
        // Обработка 401 - истек токен
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Повторяем запрос с новым токеном
            return handler.resolve(await _retry(error.requestOptions));
          } else {
            // Выходим из аккаунта
            await _logout();
          }
        }
        
        return handler.next(error);
      },
    ));
  }
  
  Future<Response> _retry(RequestOptions requestOptions) async {
    final token = await Storage.getToken();
    requestOptions.headers['Authorization'] = 'Bearer $token';
    
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
    );
    
    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }
  
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await Storage.getRefreshToken();
      if (refreshToken == null) return false;
      
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      
      if (response.data['success'] == true) {
        final data = response.data['data'];
        await Storage.saveToken(data['accessToken'] ?? data['access_token']);
        await Storage.saveRefreshToken(data['refreshToken'] ?? data['refresh_token']);
        return true;
      }
      
      return false;
    } catch (e) {
      print('Error refreshing token: $e');
      return false;
    }
  }
  
  Future<void> _logout() async {
    await Storage.clearAuth();
    // Навигация на экран входа
    // Get.offAllNamed('/login');
  }
  
  Dio get dio => _dio;
}
```

---

## 🔐 Авторизация

### 3. Auth Service

```dart
// lib/services/auth_service.dart

import 'api_service.dart';
import '../models/user.dart';
import '../utils/storage.dart';

class AuthService {
  final ApiService _api;
  
  AuthService(this._api);
  
  // Регистрация
  Future<User> register({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    required String role, // 'client' или 'master'
  }) async {
    final response = await _api.dio.post('/auth/register', data: {
      'phone': phone,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
    });
    
    if (response.data['success'] == true) {
      final data = response.data['data'];
      
      // Сохраняем токены
      await Storage.saveToken(data['accessToken'] ?? data['access_token']);
      await Storage.saveRefreshToken(data['refreshToken'] ?? data['refresh_token']);
      
      // Возвращаем пользователя
      return User.fromJson(data['user']);
    }
    
    throw Exception(response.data['message'] ?? 'Registration failed');
  }
  
  // Вход
  Future<User> login({
    required String phone,
    required String password,
  }) async {
    final response = await _api.dio.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });
    
    if (response.data['success'] == true) {
      final data = response.data['data'];
      
      // Сохраняем токены
      await Storage.saveToken(data['accessToken'] ?? data['access_token']);
      await Storage.saveRefreshToken(data['refreshToken'] ?? data['refresh_token']);
      
      // Возвращаем пользователя
      return User.fromJson(data['user']);
    }
    
    throw Exception(response.data['message'] ?? 'Login failed');
  }
  
  // Получение профиля
  Future<User> getProfile() async {
    final response = await _api.dio.get('/auth/profile');
    
    if (response.data['success'] == true) {
      return User.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to get profile');
  }
  
  // Обновление профиля
  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    String? phone,
    String? bio,
  }) async {
    final data = <String, dynamic>{};
    if (firstName != null) data['firstName'] = firstName;
    if (lastName != null) data['lastName'] = lastName;
    if (phone != null) data['phone'] = phone;
    if (bio != null) data['bio'] = bio;
    
    final response = await _api.dio.put('/auth/profile', data: data);
    
    if (response.data['success'] == true) {
      return User.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to update profile');
  }
  
  // Выход
  Future<void> logout() async {
    try {
      await _api.dio.post('/auth/logout');
    } catch (e) {
      print('Error during logout: $e');
    } finally {
      await Storage.clearAuth();
    }
  }
}
```

---

## 📹 Видео

### 4. Video Service

```dart
// lib/services/video_service.dart

import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/video.dart';

class VideoService {
  final ApiService _api;
  
  VideoService(this._api);
  
  // Получение ленты видео
  Future<List<Video>> getFeed({
    int page = 1,
    int limit = 20,
    String? category,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (category != null) queryParams['category'] = category;
    
    final response = await _api.dio.get('/videos/feed', 
      queryParameters: queryParams,
    );
    
    if (response.data['success'] == true) {
      final videos = (response.data['data']['videos'] as List)
          .map((json) => Video.fromJson(json))
          .toList();
      return videos;
    }
    
    throw Exception('Failed to load feed');
  }
  
  // Получение конкретного видео
  Future<Video> getVideo(String id) async {
    final response = await _api.dio.get('/videos/$id');
    
    if (response.data['success'] == true) {
      return Video.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to load video');
  }
  
  // Регистрация просмотра
  Future<void> registerView(String videoId) async {
    await _api.dio.post('/videos/$videoId/view');
  }
  
  // Лайк/дизлайк
  Future<void> toggleLike(String videoId) async {
    await _api.dio.post('/videos/$videoId/like');
  }
  
  // Добавить комментарий
  Future<Comment> addComment(String videoId, String content) async {
    final response = await _api.dio.post('/videos/$videoId/comment', data: {
      'content': content,
    });
    
    if (response.data['success'] == true) {
      return Comment.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to add comment');
  }
  
  // Получить комментарии
  Future<List<Comment>> getComments(String videoId, {int page = 1}) async {
    final response = await _api.dio.get('/videos/$videoId/comments',
      queryParameters: {'page': page, 'limit': 20},
    );
    
    if (response.data['success'] == true) {
      return (response.data['data'] as List)
          .map((json) => Comment.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load comments');
  }
  
  // Закладки
  Future<void> toggleBookmark(String videoId) async {
    await _api.dio.post('/videos/$videoId/bookmark');
  }
  
  // Получить закладки
  Future<List<Video>> getBookmarked({int page = 1}) async {
    final response = await _api.dio.get('/videos/bookmarked',
      queryParameters: {'page': page, 'limit': 20},
    );
    
    if (response.data['success'] == true) {
      return (response.data['data']['videos'] as List)
          .map((json) => Video.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load bookmarks');
  }
  
  // Загрузка видео (для мастера)
  Future<Video> uploadVideo({
    required String filePath,
    required String title,
    required String description,
    required String category,
    List<String>? tags,
    int? furniturePrice,
    Function(int, int)? onProgress,
  }) async {
    final formData = FormData.fromMap({
      'video': await MultipartFile.fromFile(filePath),
      'title': title,
      'description': description,
      'category': category,
      if (tags != null) 'tags': tags.join(','),
      if (furniturePrice != null) 'furniturePrice': furniturePrice,
    });
    
    final response = await _api.dio.post('/videos/upload',
      data: formData,
      onSendProgress: (sent, total) {
        if (onProgress != null) {
          onProgress(sent, total);
        }
      },
    );
    
    if (response.data['success'] == true) {
      return Video.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to upload video');
  }
  
  // Канал мастера
  Future<Map<String, dynamic>> getMasterChannel(String masterId, {int page = 1}) async {
    final response = await _api.dio.get('/videos/master/$masterId',
      queryParameters: {'page': page, 'limit': 20},
    );
    
    if (response.data['success'] == true) {
      return {
        'master': Master.fromJson(response.data['data']['master']),
        'videos': (response.data['data']['videos'] as List)
            .map((json) => Video.fromJson(json))
            .toList(),
      };
    }
    
    throw Exception('Failed to load master channel');
  }
}
```

---

## 🔍 Поиск

### 5. Search Service

```dart
// lib/services/search_service.dart

import 'api_service.dart';
import '../models/video.dart';

class SearchService {
  final ApiService _api;
  
  SearchService(this._api);
  
  Future<List<Video>> search({
    required String query,
    String type = 'video', // 'video' или 'channel'
    String? category,
    int page = 1,
  }) async {
    final response = await _api.dio.get('/search', queryParameters: {
      'q': query,
      'type': type,
      if (category != null) 'category': category,
      'page': page,
      'limit': 20,
    });
    
    if (response.data['success'] == true) {
      return (response.data['data']['videos'] as List)
          .map((json) => Video.fromJson(json))
          .toList();
    }
    
    throw Exception('Search failed');
  }
}
```

---

## 🔔 Подписки

### 6. Subscription Service

```dart
// lib/services/subscription_service.dart

import 'api_service.dart';

class SubscriptionService {
  final ApiService _api;
  
  SubscriptionService(this._api);
  
  // Подписаться на мастера
  Future<void> subscribe(String masterId) async {
    await _api.dio.post('/users/$masterId/subscribe');
  }
  
  // Отписаться
  Future<void> unsubscribe(String masterId) async {
    await _api.dio.delete('/users/$masterId/unsubscribe');
  }
  
  // Проверить статус подписки
  Future<bool> isSubscribed(String masterId) async {
    final response = await _api.dio.get('/subscriptions/$masterId');
    return response.data['data']['isSubscribed'] ?? false;
  }
}
```

---

## 📦 Заказы

### 7. Order Service

```dart
// lib/services/order_service.dart

import 'api_service.dart';
import '../models/order.dart';

class OrderService {
  final ApiService _api;
  
  OrderService(this._api);
  
  // Создать заказ
  Future<Order> createOrder({
    required String title,
    required String description,
    required String category,
    required int budget,
    String? deadline,
    String? city,
    String? address,
  }) async {
    final response = await _api.dio.post('/orders/create', data: {
      'title': title,
      'description': description,
      'category': category,
      'budget': budget,
      if (deadline != null) 'deadline': deadline,
      if (city != null) 'city': city,
      if (address != null) 'address': address,
    });
    
    if (response.data['success'] == true) {
      return Order.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to create order');
  }
  
  // Получить список заказов
  Future<List<Order>> getOrders({
    int page = 1,
    String? category,
    String? status,
  }) async {
    final response = await _api.dio.get('/orders/feed', queryParameters: {
      'page': page,
      'limit': 20,
      if (category != null) 'category': category,
      if (status != null) 'status': status,
    });
    
    if (response.data['success'] == true) {
      return (response.data['data']['orders'] as List)
          .map((json) => Order.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load orders');
  }
  
  // Откликнуться на заказ (мастер)
  Future<void> respondToOrder({
    required String orderId,
    required String message,
    required int proposedPrice,
    required int estimatedDays,
  }) async {
    await _api.dio.post('/orders/$orderId/response', data: {
      'message': message,
      'proposedPrice': proposedPrice,
      'estimatedDays': estimatedDays,
    });
  }
  
  // Принять отклик (клиент)
  Future<void> acceptResponse({
    required String orderId,
    required String responseId,
  }) async {
    await _api.dio.post('/orders/$orderId/accept', data: {
      'responseId': responseId,
    });
  }
}
```

---

## 💬 Чаты

### 8. Chat Service

```dart
// lib/services/chat_service.dart

import 'api_service.dart';
import '../models/chat.dart';
import '../models/message.dart';

class ChatService {
  final ApiService _api;
  
  ChatService(this._api);
  
  // Список чатов
  Future<List<Chat>> getChats({int page = 1}) async {
    final response = await _api.dio.get('/chat/list', queryParameters: {
      'page': page,
      'limit': 50,
    });
    
    if (response.data['success'] == true) {
      return (response.data['data'] as List)
          .map((json) => Chat.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load chats');
  }
  
  // Создать чат с пользователем
  Future<Chat> createChatWithUser(String userId) async {
    final response = await _api.dio.post('/chat/create-with-user', data: {
      'participantId': userId,
    });
    
    if (response.data['success'] == true) {
      return Chat.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to create chat');
  }
  
  // Получить сообщения чата
  Future<List<Message>> getMessages(String chatId, {int page = 1}) async {
    final response = await _api.dio.get('/chat/$chatId/messages', queryParameters: {
      'page': page,
      'limit': 50,
    });
    
    if (response.data['success'] == true) {
      return (response.data['data']['messages'] as List)
          .map((json) => Message.fromJson(json))
          .toList();
    }
    
    throw Exception('Failed to load messages');
  }
  
  // Отправить сообщение
  Future<Message> sendMessage({
    required String chatId,
    required String content,
  }) async {
    final response = await _api.dio.post('/chat/$chatId/message', data: {
      'content': content,
    });
    
    if (response.data['success'] == true) {
      return Message.fromJson(response.data['data']);
    }
    
    throw Exception('Failed to send message');
  }
  
  // Пометить сообщения как прочитанные
  Future<void> markAsRead(String chatId) async {
    await _api.dio.post('/chat/$chatId/read');
  }
}
```

---

## 📱 Модели данных

### 9. User Model

```dart
// lib/models/user.dart

class User {
  final String id;
  final String username;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String phone;
  final String? avatar;
  final String role; // 'user', 'master', 'admin'
  final String? bio;
  final DateTime createdAt;
  
  User({
    required this.id,
    required this.username,
    this.email,
    this.firstName,
    this.lastName,
    required this.phone,
    this.avatar,
    required this.role,
    this.bio,
    required this.createdAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String?,
      firstName: json['firstName'] ?? json['first_name'],
      lastName: json['lastName'] ?? json['last_name'],
      phone: json['phone'] as String,
      avatar: json['avatar'] as String?,
      role: json['role'] as String,
      bio: json['bio'] as String?,
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
    );
  }
  
  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  String get displayName => fullName.isEmpty ? username : fullName;
  
  String get avatarUrl {
    if (avatar == null) return '';
    if (avatar!.startsWith('http')) return avatar!;
    return 'https://mebelplace.com.kz$avatar';
  }
}
```

### 10. Video Model

```dart
// lib/models/video.dart

class Video {
  final String id;
  final String title;
  final String description;
  final String videoUrl;
  final String? thumbnailUrl;
  final int? duration;
  final String authorId;
  final String category;
  final List<String> tags;
  final int views;
  final int likes;
  final int comments;
  final bool isLiked;
  final DateTime createdAt;
  final User? author;
  
  Video({
    required this.id,
    required this.title,
    required this.description,
    required this.videoUrl,
    this.thumbnailUrl,
    this.duration,
    required this.authorId,
    required this.category,
    this.tags = const [],
    this.views = 0,
    this.likes = 0,
    this.comments = 0,
    this.isLiked = false,
    required this.createdAt,
    this.author,
  });
  
  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      videoUrl: json['videoUrl'] ?? json['video_url'] ?? '',
      thumbnailUrl: json['thumbnailUrl'] ?? json['thumbnail_url'],
      duration: json['duration'] as int?,
      authorId: json['authorId'] ?? json['author_id'] ?? '',
      category: json['category'] as String? ?? '',
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList() ?? [],
      views: json['views'] ?? json['viewsCount'] ?? json['views_count'] ?? 0,
      likes: json['likes'] ?? json['likesCount'] ?? json['likes_count'] ?? 0,
      comments: json['comments'] ?? json['commentsCount'] ?? json['comments_count'] ?? 0,
      isLiked: json['isLiked'] ?? json['is_liked'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
      author: json['author'] != null ? User.fromJson(json['author']) : null,
    );
  }
  
  String get fullVideoUrl {
    if (videoUrl.startsWith('http')) return videoUrl;
    return 'https://mebelplace.com.kz$videoUrl';
  }
  
  String get fullThumbnailUrl {
    if (thumbnailUrl == null) return '';
    if (thumbnailUrl!.startsWith('http')) return thumbnailUrl!;
    return 'https://mebelplace.com.kz$thumbnailUrl';
  }
}
```

---

## 💾 Хранилище токенов

### 11. Storage Utility

```dart
// lib/utils/storage.dart

import 'package:shared_preferences/shared_preferences.dart';

class Storage {
  static const String _tokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }
  
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }
  
  static Future<void> saveRefreshToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_refreshTokenKey, token);
  }
  
  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }
  
  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshTokenKey);
  }
}
```

---

## 🚀 Инициализация

### 12. Dependency Injection

```dart
// lib/main.dart

import 'package:get_it/get_it.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/video_service.dart';
// ... остальные импорты

final getIt = GetIt.instance;

void setupServices() {
  // API Service
  getIt.registerLazySingleton<ApiService>(() => ApiService());
  
  // Auth Service
  getIt.registerLazySingleton<AuthService>(
    () => AuthService(getIt<ApiService>())
  );
  
  // Video Service
  getIt.registerLazySingleton<VideoService>(
    () => VideoService(getIt<ApiService>())
  );
  
  // Search Service
  getIt.registerLazySingleton<SearchService>(
    () => SearchService(getIt<ApiService>())
  );
  
  // Order Service
  getIt.registerLazySingleton<OrderService>(
    () => OrderService(getIt<ApiService>())
  );
  
  // Chat Service
  getIt.registerLazySingleton<ChatService>(
    () => ChatService(getIt<ApiService>())
  );
  
  // Subscription Service
  getIt.registerLazySingleton<SubscriptionService>(
    () => SubscriptionService(getIt<ApiService>())
  );
}

void main() {
  setupServices();
  runApp(MyApp());
}
```

---

## 📝 Использование в UI

### 13. Пример: Лента видео

```dart
// lib/screens/home_screen.dart

import 'package:flutter/material.dart';
import '../main.dart';
import '../services/video_service.dart';
import '../models/video.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final VideoService _videoService = getIt<VideoService>();
  
  List<Video> _videos = [];
  bool _loading = true;
  int _page = 1;
  
  @override
  void initState() {
    super.initState();
    _loadVideos();
  }
  
  Future<void> _loadVideos() async {
    try {
      setState(() => _loading = true);
      
      final videos = await _videoService.getFeed(page: _page);
      
      setState(() {
        _videos.addAll(videos);
        _loading = false;
      });
    } catch (e) {
      print('Error loading videos: $e');
      setState(() => _loading = false);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ошибка загрузки видео')),
      );
    }
  }
  
  Future<void> _toggleLike(Video video) async {
    try {
      await _videoService.toggleLike(video.id);
      
      // Обновляем локально
      setState(() {
        final index = _videos.indexWhere((v) => v.id == video.id);
        if (index != -1) {
          _videos[index] = Video(
            ...video,
            isLiked: !video.isLiked,
            likes: video.isLiked ? video.likes - 1 : video.likes + 1,
          );
        }
      });
    } catch (e) {
      print('Error toggling like: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_loading && _videos.isEmpty) {
      return Center(child: CircularProgressIndicator());
    }
    
    return ListView.builder(
      itemCount: _videos.length,
      itemBuilder: (context, index) {
        final video = _videos[index];
        
        return VideoCard(
          video: video,
          onLike: () => _toggleLike(video),
          onTap: () {
            // Навигация на страницу видео
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => VideoPlayerScreen(video: video),
              ),
            );
          },
        );
      },
    );
  }
}
```

---

## ⚠️ Важные замечания

### 14. Обработка форматов данных

**Бэкенд возвращает данные в `snake_case`, но Flutter обычно использует `camelCase`.**

В моделях нужно проверять **оба варианта**:

```dart
// ✅ ПРАВИЛЬНО - проверяем оба варианта
firstName: json['firstName'] ?? json['first_name']

// ❌ НЕПРАВИЛЬНО - только один вариант
firstName: json['firstName']
```

### 15. URL изображений и видео

Бэкенд возвращает **относительные пути** (`/uploads/...`), нужно добавлять домен:

```dart
String get fullUrl {
  if (url.startsWith('http')) return url;
  return 'https://mebelplace.com.kz$url';
}
```

### 16. Обработка ошибок

Всегда оборачивайте API вызовы в `try-catch`:

```dart
try {
  final result = await apiService.someMethod();
  // Успех
} catch (e) {
  if (e is DioError) {
    print('HTTP Error: ${e.response?.statusCode}');
    print('Message: ${e.response?.data}');
  }
  // Показать пользователю
}
```

---

## 📚 Зависимости

### 17. pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP клиент
  dio: ^5.3.3
  
  # Хранилище
  shared_preferences: ^2.2.2
  
  # Dependency Injection
  get_it: ^7.6.4
  
  # State Management (на выбор)
  provider: ^6.1.1
  # или
  bloc: ^8.1.2
  flutter_bloc: ^8.1.3
  
  # Видео плеер
  video_player: ^2.8.1
  # или
  chewie: ^1.7.1
  
  # Работа с изображениями
  cached_network_image: ^3.3.0
  image_picker: ^1.0.4
```

---

## ✅ Чеклист интеграции

- [ ] Настроен `ApiConfig` с правильным доменом
- [ ] Создан `ApiService` с interceptors
- [ ] Реализованы все необходимые сервисы (Auth, Video, Order, Chat)
- [ ] Созданы модели данных с поддержкой обоих форматов (snake_case/camelCase)
- [ ] Реализовано хранилище токенов (SharedPreferences)
- [ ] Настроен автоматический refresh токенов
- [ ] Добавлена обработка ошибок во всех API вызовах
- [ ] Реализовано логирование запросов/ответов
- [ ] URL изображений и видео обрабатываются правильно (добавляется домен)
- [ ] Протестированы все основные сценарии (вход, регистрация, просмотр видео, создание заказа)

---

## 🎯 Готово к использованию!

Теперь Flutter приложение правильно подключается к бэкенду на `https://mebelplace.com.kz` и корректно обрабатывает все данные! 🚀

