import 'dart:io';
import 'package:dio/dio.dart';
import '../models/video_model.dart';
import '../models/user_model.dart';
import '../models/order_model.dart';
import '../models/chat_model.dart';
import '../models/message_model.dart';
import '../models/order_response_model.dart';
import '../datasources/api_service.dart';
import '../datasources/local_storage.dart';

// Video Repository
class VideoRepository {
  final ApiService _apiService;
  final LocalStorage _localStorage;

  VideoRepository(this._apiService, this._localStorage);

  Future<List<VideoModel>> getVideos() async {
    return await getVideoFeed();
  }

  Future<List<VideoModel>> getVideoFeed({int page = 1, int limit = 50}) async {
    try {
      // Получаем текущего пользователя для определения параметров
      final user = await _localStorage.getUser();
      
      final Map<String, dynamic> params = {
        'page': page,
        'limit': limit,
      };
      
      // Если мастер - исключаем его видео, если клиент - включаем рекомендации
      if (user != null) {
        if (user.role == 'master') {
          params['exclude_author'] = user.id;
        } else {
          params['recommendations'] = true;
        }
      } else {
        // Если не авторизован - показываем рекомендации
        params['recommendations'] = true;
      }
      
      print('🎬 VideoRepository: Loading feed with params: $params');
      
      final response = await _apiService.getVideoFeed(params);
      
      if (response.success && response.data != null) {
        return response.data!.videos;
      }
      throw Exception(response.message ?? 'Failed to load videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<VideoModel> getVideo(String videoId) async {
    try {
      final response = await _apiService.getVideo(videoId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load video');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> likeVideo(String videoId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.likeVideo(videoId);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> unlikeVideo(String videoId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.unlikeVideo(videoId);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> recordView(String videoId) async {
    try {
      await _apiService.recordView(videoId, ViewData(
        durationWatched: 0,
        completionRate: 0,
      ));
    } on DioException {
      // Silent fail for view recording
    }
  }

  Future<VideoModel> uploadVideo({
    required String videoPath,
    required String title,
    String? description,
    String? category,
    List<String>? tags,
    double? furniturePrice,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final file = File(videoPath);
      final response = await _apiService.uploadVideo(
        file,
        title,
        description,
        category,
        tags?.join(','),
        furniturePrice,
      );
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to upload video');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Проблемы с подключением к интернету');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Необходима авторизация');
        } else if (statusCode == 403) {
          return Exception('Доступ запрещен');
        } else if (statusCode == 404) {
          return Exception('Ресурс не найден');
        } else if (statusCode == 500) {
          return Exception('Ошибка сервера');
        }
        return Exception('Ошибка сервера: $statusCode');
      default:
        return Exception('Неизвестная ошибка');
    }
  }

  Future<List<VideoModel>> searchVideos(String query) async {
    try {
      final response = await _apiService.searchVideos(query);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to search videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<VideoModel>> getMasterVideos(String masterId) async {
    try {
      final response = await _apiService.getMasterVideos(masterId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load master videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
}

// Auth Repository
class AuthRepository {
  final ApiService _apiService;
  final LocalStorage _localStorage;

  AuthRepository(this._apiService, this._localStorage);

  Future<AuthData> login(String phone, String password) async {
    try {
      final response = await _apiService.login(LoginRequest(
        phone: phone,
        password: password,
      ));
      
      if (response.success && response.data != null) {
        final authData = response.data!;
        await _localStorage.saveToken(authData.token ?? authData.accessToken ?? '');
        await _localStorage.saveRefreshToken(authData.refreshToken ?? '');
        await _localStorage.saveUser(authData.user);
        return authData;
      }
      throw Exception(response.message ?? 'Login failed');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<AuthData> register({
    required String phone,
    required String username,
    required String password,
    String? firstName,
    String? lastName,
    String role = 'user',
    String? companyName,
  }) async {
    try {
      final response = await _apiService.register(RegisterRequest(
        phone: phone,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: role,
        companyName: companyName,
      ));
      
      if (response.success && response.data != null) {
        final authData = response.data!;
        await _localStorage.saveToken(authData.token ?? authData.accessToken ?? '');
        await _localStorage.saveRefreshToken(authData.refreshToken ?? '');
        await _localStorage.saveUser(authData.user);
        return authData;
      }
      throw Exception(response.message ?? 'Registration failed');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) return null;
      
      final response = await _apiService.getCurrentUser();
      
      if (response.success && response.data != null) {
        await _localStorage.saveUser(response.data!);
        return response.data!;
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Token expired, try to refresh
        return await _refreshToken();
      }
      return null;
    }
  }

  Future<UserModel?> _refreshToken() async {
    try {
      final refreshToken = await _localStorage.getRefreshToken();
      if (refreshToken == null) return null;
      
      final response = await _apiService.refreshToken(RefreshRequest(
        refreshToken: refreshToken,
      ));
      
      if (response.success && response.data != null) {
        final authData = response.data!;
        await _localStorage.saveToken(authData.token ?? authData.accessToken ?? '');
        await _localStorage.saveRefreshToken(authData.refreshToken ?? '');
        await _localStorage.saveUser(authData.user);
        return authData.user;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> saveAuthData(UserModel user, String token) async {
    // Токен уже сохранен в api_service.dart при регистрации/логине
    // Здесь только сохраняем пользователя
    await _localStorage.saveUser(user);
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _localStorage.getRefreshToken();
      if (refreshToken != null) {
        await _apiService.logout(LogoutRequest(refreshToken: refreshToken));
      }
    } catch (e) {
      // Silent fail
    } finally {
      await _localStorage.clear();
    }
  }

  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Проблемы с подключением к интернету');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Неверные учетные данные');
        } else if (statusCode == 409) {
          return Exception('Пользователь уже существует');
        }
        return Exception('Ошибка сервера: $statusCode');
      default:
        return Exception('Неизвестная ошибка');
    }
  }
}

// Order Repository
class OrderRepository {
  final ApiService _apiService;
  final LocalStorage _localStorage;

  OrderRepository(this._apiService, this._localStorage);

  Future<List<OrderModel>> getOrders() async {
    return await getOrderFeed();
  }

  Future<List<OrderModel>> getOrderFeed({int page = 1, int limit = 20}) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final response = await _apiService.getOrderFeed({
        'page': page,
        'limit': limit,
      });
      
      if (response.success && response.data != null) {
        return response.data!.orders;
      }
      throw Exception(response.message ?? 'Failed to load orders');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<OrderModel> getOrder(String orderId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final response = await _apiService.getOrder(orderId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load order');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<OrderModel> createOrder({
    required String title,
    required String description,
    required String category,
    String? location,
    String? region,
    double? budget,
    DateTime? deadline,
    List<String>? images,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final imageFiles = images?.map((path) => File(path)).toList();
      
      final response = await _apiService.createOrder(
        title,
        description,
        category,
        location,
        region,
        budget,
        deadline,
        imageFiles,
      );
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to create order');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> respondToOrder(String orderId, {
    required String message,
    double? price,
    DateTime? deadline,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.respondToOrder(orderId, OrderResponseRequest(
        message: message,
        price: price,
        deadline: deadline,
      ));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> acceptResponse(String orderId, String responseId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.acceptResponse(orderId, AcceptRequest(responseId: responseId));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Проблемы с подключением к интернету');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Необходима авторизация');
        } else if (statusCode == 403) {
          return Exception('Доступ запрещен');
        } else if (statusCode == 404) {
          return Exception('Заявка не найдена');
        }
        return Exception('Ошибка сервера: $statusCode');
      default:
        return Exception('Неизвестная ошибка');
    }
  }

  Future<List<OrderModel>> getUserOrders() async {
    try {
      final response = await _apiService.getUserOrders();
      
      if (response.success && response.data != null) {
        return response.data!.orders;
      }
      throw Exception(response.message ?? 'Failed to load user orders');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<OrderModel>> searchOrders(String query) async {
    try {
      final response = await _apiService.searchOrders(query);
      
      if (response.success && response.data != null) {
        return response.data!.orders;
      }
      throw Exception(response.message ?? 'Failed to search orders');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<OrderResponse>> getOrderResponses(String orderId) async {
    try {
      final response = await _apiService.getOrderResponses(orderId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load order responses');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
}

// Chat Repository
class ChatRepository {
  final ApiService _apiService;
  final LocalStorage _localStorage;

  ChatRepository(this._apiService, this._localStorage);

  Future<List<ChatModel>> getChats() async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final user = await _localStorage.getUser();
      final currentUserId = user?.id != null ? int.tryParse(user!.id) : null;
      
      final response = await _apiService.getChats(currentUserId: currentUserId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load chats');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<MessageModel>> getMessages(String chatId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final response = await _apiService.getMessages(chatId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load messages');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<void> sendMessage(String chatId, String content) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.sendMessage(chatId, SendMessageRequest(content: content));
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Проблемы с подключением к интернету');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Необходима авторизация');
        }
        return Exception('Ошибка сервера: $statusCode');
      default:
        return Exception('Неизвестная ошибка');
    }
  }
}

// User Repository (for masters)
class UserRepository {
  final ApiService _apiService;
  final LocalStorage _localStorage;

  UserRepository(this._apiService, this._localStorage);

  Future<List<UserModel>> searchMasters(String query) async {
    try {
      final response = await _apiService.searchMasters(query);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to search masters');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<UserModel> getUser(String userId) async {
    try {
      final response = await _apiService.getUser(userId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load user');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Проблемы с подключением к интернету');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          return Exception('Необходима авторизация');
        } else if (statusCode == 404) {
          return Exception('Пользователь не найден');
        }
        return Exception('Ошибка сервера: $statusCode');
      default:
        return Exception('Неизвестная ошибка');
    }
  }
}
