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
      // ✅ Без всяких фильтров и рекомендаций - просто все видео как на вебе
      final Map<String, dynamic> params = {
        'page': page,
        'limit': limit,
      };
      
      final response = await _apiService.getVideoFeed(params);
      
      // ✅ Если успешно получили данные - возвращаем их
      if (response.success && response.data != null) {
        return response.data!.videos;
      }
      
      // Если не success, но есть data - возвращаем что есть (может быть пустой массив)
      if (response.data != null) {
        return response.data!.videos;
      }
      
      // Только если совсем нет данных - ошибка
      throw Exception(response.message ?? 'Failed to load videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      // ✅ Логируем ошибку для отладки, но не выбрасываем если данные пришли
      print('⚠️ VideoRepository: Error loading videos: $e');
      // Если это ошибка парсинга, но API вернул 200 - пробуем вернуть пустой массив
      rethrow;
    }
  }

  // ✅ Получить видео по author_id (для навигации из чата на конкретное видео автора)
  Future<List<VideoModel>> getVideosByAuthor(String authorId, {int page = 1, int limit = 50}) async {
    try {
      final Map<String, dynamic> params = {
        'page': page,
        'limit': limit,
        'author_id': authorId, // ✅ Параметр как на вебе
      };
      
      final response = await _apiService.getVideoFeed(params);
      
      if (response.success && response.data != null) {
        return response.data!.videos;
      }
      throw Exception(response.message ?? 'Failed to load author videos');
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

  // ✅ Toggle like возвращает данные (как на вебе)
  Future<LikeData> likeVideo(String videoId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final response = await _apiService.likeVideo(videoId);
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to like video');
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
  
  // ✅ Bookmark methods (как на вебе videoService.addBookmark/removeBookmark)
  Future<void> addBookmark(String videoId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.addBookmark(videoId);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  Future<void> removeBookmark(String videoId) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.removeBookmark(videoId);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<VideoModel>> getBookmarkedVideos() async {
    try {
      final response = await _apiService.getBookmarkedVideos();
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load bookmarked videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<VideoModel>> getLikedVideos() async {
    try {
      final response = await _apiService.getLikedVideos();
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load liked videos');
    } on DioException catch (e) {
      throw _handleDioError(e);
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

  Future<Map<String, dynamic>> searchVideos(String query) async {
    try {
      final response = await _apiService.searchVideos(query);
      
      if (response.success && response.data != null) {
        return response.data!; // ✅ Возвращаем {'videos': [], 'masters': []}
      }
      throw Exception(response.message ?? 'Failed to search');
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
      // Сначала проверяем, есть ли сохраненный пользователь локально
      final localUser = await _localStorage.getUser();
      final token = await _localStorage.getToken();
      
      // Если нет ни пользователя ни токена - возвращаем null
      if (localUser == null && token == null) {
        return null;
      }
      
      // Если есть локальный пользователь, но нет токена - возвращаем локального
      if (localUser != null && token == null) {
        return localUser;
      }
      
      // Если есть токен, пытаемся получить актуальные данные с сервера
      if (token != null) {
        try {
          final response = await _apiService.getCurrentUser();
          
          if (response.success && response.data != null) {
            await _localStorage.saveUser(response.data!);
            return response.data!;
          }
        } on DioException catch (e) {
          if (e.response?.statusCode == 401) {
            // Token expired, try to refresh
            final refreshedUser = await _refreshToken();
            if (refreshedUser != null) {
              return refreshedUser;
            }
          }
        } catch (e) {
          // Любая другая ошибка - игнорируем
        }
      }
      
      // Если сервер недоступен или ошибка сети, возвращаем локального пользователя
      if (localUser != null) {
        return localUser;
      }
      
      return null;
    } catch (e) {
      // В случае любой ошибки пробуем вернуть локального пользователя
      return await _localStorage.getUser();
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
      
      // ✅ ИСПРАВЛЕНО: Мастера видят ВСЕ заказы (всех статусов)
      final response = await _apiService.getOrderFeed({
        'page': page,
        'limit': limit,
        'status': '', // Пустая строка = все статусы
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
    String category = 'general', // ✅ Добавлено (как в вебе, по умолчанию 'general')
    String? location,
    String? region,
    double? budget,
    DateTime? deadline,
    List<String>? images,
  }) async {
    try {
      print('🔵 OrderRepository: Creating order...');
      print('   Title: $title');
      print('   Description length: ${description.length}');
      print('   Location: $location');
      print('   Region: $region');
      print('   Images: ${images?.length ?? 0}');
      
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final imageFiles = images?.map((path) => File(path)).toList();
      
      final response = await _apiService.createOrder(
        title,
        description,
        category, // ✅ Передаем category
        location,
        region,
        budget,
        deadline,
        imageFiles,
      );
      
      print('🟢 OrderRepository: Response success=${response.success}');
      
      if (response.success && response.data != null) {
        print('✅ OrderRepository: Order created with ID=${response.data!.id}');
        return response.data!;
      }
      
      final errorMsg = response.message ?? 'Failed to create order';
      print('🔴 OrderRepository: Failed - $errorMsg');
      throw Exception(errorMsg);
    } on DioException catch (e) {
      print('❌ OrderRepository: DioException - ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      print('❌ OrderRepository: Unknown error - $e');
      rethrow;
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
      // ✅ ИСПРАВЛЕНО: Запрашиваем ВСЕ статусы для клиента, не только pending
      final response = await _apiService.getOrderFeed({
        'page': 1,
        'limit': 100, // Загружаем больше заказов
        'status': '', // Пустая строка = все статусы (backend игнорирует пустой status)
      });
      
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
  
  // WebSocket methods
  Future<void> connectSocket() async {
    // Socket подключается через SocketService
  }
  
  void disconnectSocket() {
    // Socket отключается через SocketService
  }

  // ✅ Создать чат (как на вебе)
  Future<ChatModel> createChat({
    required List<String> participants,
    String type = 'private',
    String? name,
    String? orderId,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final response = await _apiService.createChat(
        participants: participants,
        type: type,
        name: name,
        orderId: orderId,
      );
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to create chat');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<List<ChatModel>> getChats() async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      final user = await _localStorage.getUser();
      // ✅ UUID уже строка, не нужно конвертировать
      final currentUserId = user?.id;
      
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
      
      // Пробуем загрузить сообщения, если 403 - ждем немного и повторяем (чат может только создаться)
      var response = await _apiService.getMessages(chatId);
      
      // Если 403, ждем 500мс и пробуем еще раз (чат может еще добавлять participants)
      if (!response.success && response.message?.contains('403') == true) {
        await Future.delayed(const Duration(milliseconds: 500));
        response = await _apiService.getMessages(chatId);
      }
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      return []; // Возвращаем пустой список вместо ошибки
    } on DioException catch (e) {
      // Если 403 - возвращаем пустой список (чат может быть еще не готов)
      if (e.response?.statusCode == 403) {
        return [];
      }
      return []; // В любом случае возвращаем пустой список
    }
  }

  Future<void> sendMessage(
    String chatId, 
    String content, {
    String? type,
    String? replyTo,
    Map<String, dynamic>? metadata,
    File? file,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      await _apiService.sendMessage(
        chatId, 
        SendMessageRequest(content: content),
        type: type,
        replyTo: replyTo,
        metadata: metadata,
        file: file,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  Future<void> sendFileMessage(
    String chatId,
    File file, {
    String? content,
  }) async {
    try {
      final token = await _localStorage.getToken();
      if (token == null) throw Exception('Not authenticated');
      
      // Определяем тип по расширению файла
      String? type;
      if (file.path.toLowerCase().endsWith('.jpg') || 
          file.path.toLowerCase().endsWith('.jpeg') || 
          file.path.toLowerCase().endsWith('.png') || 
          file.path.toLowerCase().endsWith('.gif')) {
        type = 'image';
      } else if (file.path.toLowerCase().endsWith('.mp4') || 
                 file.path.toLowerCase().endsWith('.mov') || 
                 file.path.toLowerCase().endsWith('.avi')) {
        type = 'video';
      } else {
        type = 'file';
      }
      
      await _apiService.sendMessage(
        chatId, 
        SendMessageRequest(content: content ?? ''),
        type: type,
        file: file,
      );
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

  Future<List<UserModel>> getSubscriptions(String userId) async {
    try {
      final response = await _apiService.getSubscriptions(userId);
      
      if (response.success && response.data != null) {
        return response.data!;
      }
      throw Exception(response.message ?? 'Failed to load subscriptions');
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
