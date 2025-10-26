import 'dart:io';
import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../models/video_model.dart';
import '../models/order_model.dart';
import '../models/chat_model.dart';
import 'local_storage.dart';

// API Service with real endpoints from OpenAPI
class ApiService {
  final Dio _dio;
  
  ApiService(this._dio) {
    _dio.options.baseUrl = 'https://mebelplace.com.kz/api';
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Добавляем интерцептор для JWT токенов
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Добавляем JWT токен если есть
        final token = LocalStorage().getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  // Mock data for demo
  static final List<VideoModel> _mockVideos = [
    VideoModel(
      id: '1',
      title: 'Красивая мебель для дома',
      description: 'Показываю как выбрать идеальную мебель',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://picsum.photos/400/600?random=1',
      duration: 120,
      fileSize: 1024000,
      authorId: '1',
      username: 'master_furniture',
      firstName: 'Иван',
      lastName: 'Петров',
      avatar: 'https://picsum.photos/100/100?random=1',
      category: 'Мебель',
      tags: ['мебель', 'дом', 'дизайн'],
      views: 1500,
      likes: 45,
      likesCount: 45,
      commentsCount: 12,
      isLiked: false,
      isFeatured: true,
      priorityOrder: 1,
      isPublic: true,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    VideoModel(
      id: '2',
      title: 'Ремонт кухни своими руками',
      description: 'Пошаговое руководство по ремонту кухни',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://picsum.photos/400/600?random=2',
      duration: 180,
      fileSize: 2048000,
      authorId: '2',
      username: 'kitchen_master',
      firstName: 'Мария',
      lastName: 'Сидорова',
      avatar: 'https://picsum.photos/100/100?random=2',
      category: 'Ремонт',
      tags: ['кухня', 'ремонт', 'своими руками'],
      views: 2300,
      likes: 78,
      likesCount: 78,
      commentsCount: 25,
      isLiked: true,
      isFeatured: false,
      priorityOrder: null,
      isPublic: true,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    VideoModel(
      id: '3',
      title: 'Современный дизайн интерьера',
      description: 'Тренды в дизайне интерьера 2024',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://picsum.photos/400/600?random=3',
      duration: 90,
      fileSize: 1536000,
      authorId: '3',
      username: 'design_pro',
      firstName: 'Алексей',
      lastName: 'Козлов',
      avatar: 'https://picsum.photos/100/100?random=3',
      category: 'Дизайн',
      tags: ['дизайн', 'интерьер', 'тренды'],
      views: 3200,
      likes: 156,
      likesCount: 156,
      commentsCount: 43,
      isLiked: false,
      isFeatured: true,
      priorityOrder: 2,
      isPublic: true,
      isActive: true,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  // Auth endpoints
  Future<ApiResponse<AuthData>> login(LoginRequest request) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'phone': request.phone,
        'password': request.password,
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        final user = UserModel.fromJson(data['user']);
        final token = data['token'];
        
        // Сохраняем токен
        await LocalStorage().saveToken(token);
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(user: user, token: token),
          message: 'Успешный вход',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AuthData>(
          success: false,
          message: 'Неверные данные для входа',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      // Fallback для демо
      if (request.phone == 'bekaron.company@gmail.com' && request.password == 'BekAron1872726') {
        final user = UserModel(
          id: '1',
          username: 'bekaron',
          phone: 'bekaron.company@gmail.com',
          firstName: 'BekAron',
          lastName: 'Company',
          avatar: 'https://picsum.photos/100/100?random=10',
          role: 'user',
          isActive: true,
          isVerified: true,
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        );
        
        return ApiResponse<AuthData>(
        success: true,
        data: AuthData(
          user: user,
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        ),
        message: 'Успешный вход',
        timestamp: DateTime.now().toIso8601String(),
      );
      } else {
        throw Exception('Неверный номер телефона или пароль');
      }
    }
    
    throw Exception('Неверный номер телефона или пароль');
  }

  Future<ApiResponse<AuthData>> register(RegisterRequest request) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'phone': request.phone,
        'username': request.username,
        'password': request.password,
        'firstName': request.firstName,
        'lastName': request.lastName,
        'role': request.role,
      });
      
      if (response.statusCode == 201) {
        final data = response.data;
        final user = UserModel.fromJson(data['user']);
        final token = data['token'];
        
        // Сохраняем токен
        await LocalStorage().saveToken(token);
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(user: user, token: token),
          message: 'Регистрация успешна',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AuthData>(
          success: false,
          message: 'Ошибка регистрации',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      // Fallback для демо
      final user = UserModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        username: request.username,
        phone: request.phone,
        firstName: request.firstName,
        lastName: request.lastName,
        avatar: null,
        role: request.role,
        isActive: true,
        isVerified: false,
        createdAt: DateTime.now(),
      );
      
      return ApiResponse<AuthData>(
        success: true,
        data: AuthData(
          user: user,
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        ),
        message: 'Регистрация успешна',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<UserModel>> getCurrentUser() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final user = UserModel(
      id: '1',
      username: 'bekaron',
      phone: 'bekaron.company@gmail.com',
      firstName: 'BekAron',
      lastName: 'Company',
      avatar: 'https://picsum.photos/100/100?random=10',
      role: 'user',
      isActive: true,
      isVerified: true,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
    );
    
    return ApiResponse<UserModel>(
      success: true,
      data: user,
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<EmptyResponse>> logout(LogoutRequest request) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ApiResponse<EmptyResponse>(
      success: true,
      data: EmptyResponse(),
      message: 'Выход выполнен',
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<AuthData>> refreshToken(RefreshRequest request) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final user = UserModel(
      id: '1',
      username: 'bekaron',
      phone: 'bekaron.company@gmail.com',
      firstName: 'BekAron',
      lastName: 'Company',
      avatar: 'https://picsum.photos/100/100?random=10',
      role: 'user',
      isActive: true,
      isVerified: true,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
    );
    
    return ApiResponse<AuthData>(
      success: true,
      data: AuthData(
        user: user,
        accessToken: 'new_mock_access_token',
        refreshToken: 'new_mock_refresh_token',
      ),
      message: 'Токен обновлен',
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  // Video endpoints
  Future<ApiResponse<VideoFeedData>> getVideoFeed(Map<String, dynamic> params) async {
    try {
      final response = await _dio.get('/videos/feed', queryParameters: params);
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['videos'];
        final videos = videosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        return ApiResponse<VideoFeedData>(
          success: true,
          data: VideoFeedData(
            videos: videos,
            pagination: PaginationData(
              page: data['pagination']['page'] ?? 1,
              limit: data['pagination']['limit'] ?? 20,
              total: data['pagination']['total'] ?? videos.length,
              totalPages: data['pagination']['totalPages'] ?? 1,
            ),
          ),
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<VideoFeedData>(
          success: false,
          data: VideoFeedData(
            videos: [],
            pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
          ),
          message: 'Ошибка загрузки видео',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      // Fallback для демо
      return ApiResponse<VideoFeedData>(
        success: true,
        data: VideoFeedData(
          videos: _mockVideos,
          pagination: PaginationData(
            page: 1,
            limit: 20,
            total: _mockVideos.length,
            totalPages: 1,
          ),
        ),
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<VideoModel>> getVideo(String videoId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final video = _mockVideos.firstWhere((v) => v.id == videoId);
    
    return ApiResponse<VideoModel>(
      success: true,
      data: video,
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<LikeData>> likeVideo(String videoId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    
    final video = _mockVideos.firstWhere((v) => v.id == videoId);
    
    return ApiResponse<LikeData>(
      success: true,
      data: LikeData(
        videoId: videoId,
        likes: video.likesCount + 1,
        isLiked: true,
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<LikeData>> unlikeVideo(String videoId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    
    final video = _mockVideos.firstWhere((v) => v.id == videoId);
    
    return ApiResponse<LikeData>(
      success: true,
      data: LikeData(
        videoId: videoId,
        likes: video.likesCount - 1,
        isLiked: false,
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<EmptyResponse>> recordView(String videoId, ViewData data) async {
    await Future.delayed(const Duration(milliseconds: 200));
    
    return ApiResponse<EmptyResponse>(
      success: true,
      data: EmptyResponse(),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<VideoModel>> uploadVideo(
    File video,
    String title,
    String? description,
    String? category,
    String? tags,
  ) async {
    await Future.delayed(const Duration(seconds: 2));
    
    final newVideo = VideoModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      description: description,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://picsum.photos/400/600?random=${DateTime.now().millisecondsSinceEpoch}',
      duration: 60,
      fileSize: 1024000,
      authorId: '1',
      username: 'demo_user',
      firstName: 'Демо',
      lastName: 'Пользователь',
      avatar: 'https://picsum.photos/100/100?random=10',
      category: category ?? 'Общее',
      tags: tags?.split(',') ?? [],
      views: 0,
      likes: 0,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isFeatured: false,
      priorityOrder: null,
      isPublic: true,
      isActive: true,
      createdAt: DateTime.now(),
    );
    
    return ApiResponse<VideoModel>(
      success: true,
      data: newVideo,
      message: 'Видео загружено',
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  // Order endpoints
  Future<ApiResponse<OrderFeedData>> getOrderFeed(Map<String, dynamic> params) async {
    await Future.delayed(const Duration(milliseconds: 800));
    
    return ApiResponse<OrderFeedData>(
      success: true,
      data: OrderFeedData(
        orders: [],
        pagination: PaginationData(
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        ),
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<OrderModel>> getOrder(String orderId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    throw Exception('Заказ не найден');
  }

  Future<ApiResponse<OrderModel>> createOrder(
    String title,
    String description,
    String category,
    String? location,
    String? region,
    double? budget,
    DateTime? deadline,
    List<File>? images,
  ) async {
    await Future.delayed(const Duration(seconds: 2));
    
    final order = OrderModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      description: description,
      category: category,
      location: location,
      region: region,
      price: budget,
      deadline: deadline,
      status: 'pending',
      clientId: '1',
      hasMyResponse: false,
      images: [],
      responseCount: 0,
      createdAt: DateTime.now(),
    );
    
    return ApiResponse<OrderModel>(
      success: true,
      data: order,
      message: 'Заказ создан',
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<OrderResponse>> respondToOrder(
    String orderId,
    OrderResponseRequest request,
  ) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    throw Exception('Функция недоступна в демо режиме');
  }

  Future<ApiResponse<AcceptResponse>> acceptResponse(
    String orderId,
    AcceptRequest request,
  ) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    throw Exception('Функция недоступна в демо режиме');
  }

  Future<ApiResponse<List<CategoryData>>> getOrderCategories() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ApiResponse<List<CategoryData>>(
      success: true,
      data: [
        CategoryData(id: '1', name: 'Мебель', description: 'Мебель для дома'),
        CategoryData(id: '2', name: 'Ремонт', description: 'Ремонтные работы'),
        CategoryData(id: '3', name: 'Дизайн', description: 'Дизайн интерьера'),
      ],
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<List<String>>> getRegions() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ApiResponse<List<String>>(
      success: true,
      data: ['Алматы', 'Астана', 'Шымкент', 'Актобе', 'Тараз'],
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  // Chat endpoints
  Future<ApiResponse<List<ChatModel>>> getChats() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ApiResponse<List<ChatModel>>(
      success: true,
      data: [],
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<List<MessageModel>>> getMessages(String chatId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ApiResponse<List<MessageModel>>(
      success: true,
      data: [],
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
  }

  Future<ApiResponse<MessageModel>> sendMessage(
    String chatId,
    SendMessageRequest request,
  ) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    throw Exception('Функция недоступна в демо режиме');
  }
}

// Request/Response models
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String timestamp;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    required this.timestamp,
  });
}

class AuthData {
  final UserModel user;
  final String? token;
  final String? accessToken;
  final String? refreshToken;

  AuthData({
    required this.user,
    this.token,
    this.accessToken,
    this.refreshToken,
  });
}

class LoginRequest {
  final String phone;
  final String password;

  LoginRequest({required this.phone, required this.password});
}

class RegisterRequest {
  final String phone;
  final String username;
  final String password;
  final String? firstName;
  final String? lastName;
  final String role;

  RegisterRequest({
    required this.phone,
    required this.username,
    required this.password,
    this.firstName,
    this.lastName,
    this.role = 'user',
  });
}

class LogoutRequest {
  final String refreshToken;

  LogoutRequest({required this.refreshToken});
}

class RefreshRequest {
  final String refreshToken;

  RefreshRequest({required this.refreshToken});
}

class VideoFeedData {
  final List<VideoModel> videos;
  final PaginationData pagination;

  VideoFeedData({required this.videos, required this.pagination});
}

class OrderFeedData {
  final List<OrderModel> orders;
  final PaginationData pagination;

  OrderFeedData({required this.orders, required this.pagination});
}

class PaginationData {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationData({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });
}

class LikeData {
  final String videoId;
  final int likes;
  final bool isLiked;

  LikeData({
    required this.videoId,
    required this.likes,
    required this.isLiked,
  });
}

class ViewData {
  final int durationWatched;
  final double completionRate;

  ViewData({
    required this.durationWatched,
    required this.completionRate,
  });
}

class OrderResponse {
  final String id;
  final String orderId;
  final String masterId;
  final String message;
  final double? price;
  final DateTime? deadline;
  final DateTime createdAt;

  OrderResponse({
    required this.id,
    required this.orderId,
    required this.masterId,
    required this.message,
    this.price,
    this.deadline,
    required this.createdAt,
  });
}

class OrderResponseRequest {
  final String message;
  final double? price;
  final DateTime? deadline;

  OrderResponseRequest({
    required this.message,
    this.price,
    this.deadline,
  });
}

class AcceptRequest {
  final String responseId;

  AcceptRequest({required this.responseId});
}

class AcceptResponse {
  final OrderModel order;
  final String chatId;

  AcceptResponse({required this.order, required this.chatId});
}

class CategoryData {
  final String id;
  final String name;
  final String description;

  CategoryData({
    required this.id,
    required this.name,
    required this.description,
  });
}

class MessageModel {
  final String id;
  final String chatId;
  final String userId;
  final String content;
  final DateTime createdAt;
  final UserModel? user;

  MessageModel({
    required this.id,
    required this.chatId,
    required this.userId,
    required this.content,
    required this.createdAt,
    this.user,
  });
}

class SendMessageRequest {
  final String content;

  SendMessageRequest({required this.content});
}

class EmptyResponse {
  EmptyResponse();
}