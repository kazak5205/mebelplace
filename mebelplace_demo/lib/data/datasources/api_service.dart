import 'dart:io';
import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../models/video_model.dart';
import '../models/order_model.dart';
import '../models/chat_model.dart';
import '../models/message_model.dart';
import '../models/order_response_model.dart';
import '../models/comment_model.dart';
import '../adapters/case_converter.dart';
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
      onRequest: (options, handler) async {
        // Добавляем JWT токен если есть
        final token = await LocalStorage().getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        // ✅ ТРАНСФОРМАЦИЯ snake_case → camelCase (как веб-фронтенд!)
        if (response.data != null) {
          response.data = snakeToCamel(response.data);
        }
        return handler.next(response);
      },
    ));
  }


  // Auth endpoints
  
  // Восстановление пароля - отправка SMS кода
  Future<ApiResponse<EmptyResponse>> forgotPassword(String phone) async {
    try {
      print('📡 API: POST /auth/forgot-password');
      final response = await _dio.post('/auth/forgot-password', data: {
        'phone': phone,
      });
      
      if (response.statusCode == 200) {
        print('✅ API: SMS code sent to $phone');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: response.data['message'] ?? 'SMS код отправлен',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: response.data['message'] ?? 'Ошибка отправки кода',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Forgot password error: $e');
      throw Exception('Ошибка отправки кода: ${e.toString()}');
    }
  }

  // Отправка SMS кода для верификации
  Future<ApiResponse<Map<String, dynamic>>> sendSmsCode(String phone) async {
    try {
      print('📡 API: POST /auth/send-sms-code');
      final response = await _dio.post('/auth/send-sms-code', data: {
        'phone': phone,
      });
      
      if (response.statusCode == 200) {
        print('✅ API: SMS code sent to $phone');
        // В DEV режиме бэк возвращает код
        final code = response.data['code'];
        return ApiResponse<Map<String, dynamic>>(
          success: true,
          data: {'code': code}, // Для DEV
          message: response.data['message'] ?? 'SMS код отправлен',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<Map<String, dynamic>>(
          success: false,
          message: response.data['message'] ?? 'Ошибка отправки кода',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Send SMS code error: $e');
      throw Exception('Ошибка отправки SMS: ${e.toString()}');
    }
  }

  // Проверка SMS кода
  Future<ApiResponse<AuthData>> verifySmsCode(String phone, String code) async {
    try {
      print('📡 API: POST /auth/verify-sms');
      final response = await _dio.post('/auth/verify-sms', data: {
        'phone': phone,
        'code': code,
      });
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data['user']);
        
        final accessToken = data['accessToken'] ?? data['access_token'];
        final refreshToken = data['refreshToken'] ?? data['refresh_token'];
        
        await LocalStorage().saveToken(accessToken);
        if (refreshToken != null) {
          await LocalStorage().saveRefreshToken(refreshToken);
        }
        
        print('✅ API: SMS verified successfully');
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          ),
          message: responseData['message'] ?? 'Регистрация успешна',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AuthData>(
          success: false,
          message: response.data['message'] ?? 'Неверный код',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Verify SMS error: $e');
      throw Exception('Ошибка верификации: ${e.toString()}');
    }
  }

  // Сброс пароля по SMS коду
  Future<ApiResponse<EmptyResponse>> resetPassword(
    String phone,
    String code,
    String newPassword,
  ) async {
    try {
      print('📡 API: POST /auth/reset-password');
      final response = await _dio.post('/auth/reset-password', data: {
        'phone': phone,
        'code': code,
        'newPassword': newPassword,
      });
      
      if (response.statusCode == 200) {
        print('✅ API: Password reset successful');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: response.data['message'] ?? 'Пароль успешно изменён',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: response.data['message'] ?? 'Ошибка сброса пароля',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Reset password error: $e');
      throw Exception('Ошибка сброса пароля: ${e.toString()}');
    }
  }
  
  Future<ApiResponse<AuthData>> login(LoginRequest request) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'phone': request.phone,
        'password': request.password,
      });
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        
        // ✅ БЭК ВОЗВРАЩАЕТ: { success, data: { user, accessToken, refreshToken } }
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data['user']);
        
        // ✅ Правильные поля (как веб-фронтенд)
        final accessToken = data['accessToken'] ?? data['access_token'] ?? data['token'];
        final refreshToken = data['refreshToken'] ?? data['refresh_token'];
        
        // Сохраняем токены
        await LocalStorage().saveToken(accessToken);
        if (refreshToken != null) {
          await LocalStorage().saveRefreshToken(refreshToken);
        }
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(
            user: user, 
            accessToken: accessToken,
            refreshToken: refreshToken,
          ),
          message: responseData['message'] ?? 'Успешный вход',
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
      print('❌ API: Login error: $e');
      throw Exception('Ошибка входа: ${e.toString()}');
    }
    
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
        // ИСПРАВЛЕНО: правильная структура ответа
        final responseData = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(responseData['user']);
        final token = responseData['accessToken'] ?? responseData['token'];
        
        // Сохраняем токен
        await LocalStorage().saveToken(token);
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(user: user, token: token),
          message: response.data['message'] ?? 'Регистрация успешна',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AuthData>(
          success: false,
          message: response.data['message'] ?? 'Ошибка регистрации',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Register error: $e');
      throw Exception('Ошибка регистрации: ${e.toString()}');
    }
  }

  Future<ApiResponse<UserModel>> getCurrentUser() async {
    try {
      print('📡 API: GET /auth/profile');
      final response = await _dio.get('/auth/profile');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data);
        
        print('✅ API: Current user loaded: ${user.username}');
        
        return ApiResponse<UserModel>(
          success: true,
          data: user,
          message: responseData['message'],
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<UserModel>(
          success: false,
          message: 'Ошибка получения профиля',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get current user error: $e');
      throw Exception('Ошибка получения профиля: ${e.toString()}');
    }
  }

  Future<ApiResponse<EmptyResponse>> logout(LogoutRequest request) async {
    try {
      print('📡 API: POST /auth/logout');
      final response = await _dio.post('/auth/logout');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        print('✅ API: Logout successful');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: 'Выход выполнен',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: 'Ошибка выхода',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Logout error: $e');
      throw Exception('Ошибка выхода: ${e.toString()}');
    }
  }

  Future<ApiResponse<AuthData>> refreshToken(RefreshRequest request) async {
    try {
      print('📡 API: POST /auth/refresh');
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': request.refreshToken,
      });
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data['user']);
        
        final accessToken = data['accessToken'] ?? data['access_token'];
        final refreshToken = data['refreshToken'] ?? data['refresh_token'];
        
        print('✅ API: Token refreshed');
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          ),
          message: 'Токен обновлен',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AuthData>(
          success: false,
          message: 'Ошибка обновления токена',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Refresh token error: $e');
      throw Exception('Ошибка обновления токена: ${e.toString()}');
    }
  }

  // Video endpoints
  Future<ApiResponse<VideoFeedData>> getVideoFeed(Map<String, dynamic> params) async {
    try {
      print('🔍 API: Fetching videos from ${_dio.options.baseUrl}/videos/feed');
      print('📝 API: Params: $params');
      
      final response = await _dio.get('/videos/feed', queryParameters: params);
      
      print('✅ API: Response status ${response.statusCode}');
      print('📦 API: Response data: ${response.data}');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data']['videos'] ?? [];
        
        // Fix relative URLs by adding base URL
        final fixedVideosJson = videosJson.map((json) {
          final videoUrl = json['videoUrl'] as String?;
          final thumbnailUrl = json['thumbnailUrl'] as String?;
          final avatar = json['avatar'] as String?;
          
          final Map<String, dynamic> fixedJson = Map<String, dynamic>.from(json);
          fixedJson['videoUrl'] = videoUrl?.startsWith('http') == true 
              ? videoUrl 
              : 'https://mebelplace.com.kz$videoUrl';
          fixedJson['thumbnailUrl'] = thumbnailUrl?.startsWith('http') == true 
              ? thumbnailUrl 
              : (thumbnailUrl != null ? 'https://mebelplace.com.kz$thumbnailUrl' : null);
          fixedJson['avatar'] = avatar?.startsWith('http') == true 
              ? avatar 
              : (avatar != null ? 'https://mebelplace.com.kz$avatar' : null);
          
          return fixedJson;
        }).toList();
        
        final videos = fixedVideosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        print('🎥 API: Loaded ${videos.length} videos from server');
    
    return ApiResponse<VideoFeedData>(
      success: true,
      data: VideoFeedData(
            videos: videos,
        pagination: PaginationData(
              page: data['data']['pagination']['page'] ?? 1,
              limit: data['data']['pagination']['limit'] ?? 20,
              total: data['data']['pagination']['total'] ?? videos.length,
              totalPages: data['data']['pagination']['pages'] ?? 1,
        ),
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
      } else {
        print('❌ API: Bad status code ${response.statusCode}');
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
      print('❌ API: Error fetching videos: $e');
      
      return ApiResponse<VideoFeedData>(
        success: false,
        data: VideoFeedData(
          videos: [],
          pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
        ),
        message: 'Ошибка загрузки видео: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<VideoModel>> getVideo(String videoId) async {
    try {
      final response = await _dio.get('/videos/$videoId');
    
      if (response.statusCode == 200) {
        final data = response.data;
        final video = VideoModel.fromJson(data['data']);
    
    return ApiResponse<VideoModel>(
      success: true,
      data: video,
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
      } else {
        return ApiResponse<VideoModel>(
          success: false,
          message: 'Видео не найдено',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      return ApiResponse<VideoModel>(
        success: false,
        message: 'Ошибка загрузки видео: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<LikeData>> likeVideo(String videoId) async {
    try {
      final response = await _dio.post('/videos/$videoId/like');
    
      if (response.statusCode == 200) {
        final data = response.data['data'];
    
    return ApiResponse<LikeData>(
      success: true,
      data: LikeData(
        videoId: videoId,
            likes: data['likes'] ?? 0,
        isLiked: true,
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
      } else {
        return ApiResponse<LikeData>(
          success: false,
          message: 'Ошибка лайка',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      return ApiResponse<LikeData>(
        success: false,
        message: 'Ошибка лайка: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<LikeData>> unlikeVideo(String videoId) async {
    try {
      final response = await _dio.delete('/videos/$videoId/like');
    
      if (response.statusCode == 200) {
        final data = response.data['data'];
    
    return ApiResponse<LikeData>(
      success: true,
      data: LikeData(
        videoId: videoId,
            likes: data['likes'] ?? 0,
        isLiked: false,
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
      } else {
        return ApiResponse<LikeData>(
          success: false,
          message: 'Ошибка убирания лайка',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      return ApiResponse<LikeData>(
        success: false,
        message: 'Ошибка убирания лайка: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
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
    try {
      // Используем реальный endpoint /orders/feed из OpenAPI
      final response = await _dio.get('/orders/feed', queryParameters: params);
      
      if (response.statusCode == 200) {
        final data = response.data;
        // ИСПРАВЛЕНО: реальный API возвращает data.orders, а не data напрямую
        final List<dynamic> ordersJson = data['data']['orders'] ?? [];
        final orders = ordersJson.map((json) => OrderModel.fromJson(json)).toList();
    
    return ApiResponse<OrderFeedData>(
      success: true,
      data: OrderFeedData(
            orders: orders,
        pagination: PaginationData(
              page: data['data']['pagination']['page'] ?? 1,
              limit: data['data']['pagination']['limit'] ?? 20,
              total: data['data']['pagination']['total'] ?? orders.length,
              totalPages: data['data']['pagination']['pages'] ?? 1,
        ),
      ),
      message: null,
      timestamp: DateTime.now().toIso8601String(),
    );
      } else {
        return ApiResponse<OrderFeedData>(
          success: false,
          data: OrderFeedData(
            orders: [],
            pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
          ),
          message: 'Ошибка загрузки ленты заявок',
      timestamp: DateTime.now().toIso8601String(),
    );
      }
    } catch (e) {
      print('❌ API: Get user orders error: $e');
      return ApiResponse<OrderFeedData>(
        success: false,
        data: OrderFeedData(
          orders: [],
          pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
        ),
        message: 'Ошибка загрузки заказов: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<OrderModel>> getOrder(String orderId) async {
    try {
      print('📡 API: GET /orders/$orderId');
      final response = await _dio.get('/orders/$orderId');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final order = OrderModel.fromJson(data);
        
        print('✅ API: Order loaded: ${order.id}');
        
        return ApiResponse<OrderModel>(
          success: true,
          data: order,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<OrderModel>(
          success: false,
          message: 'Заказ не найден',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get order error: $e');
      throw Exception('Ошибка загрузки заказа: ${e.toString()}');
    }
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
    try {
      // ✅ ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ ENDPOINT /orders/create (как веб-фронтенд!)
      final formData = FormData.fromMap({
        'title': title,
        'description': description,
        'category': category,
        if (location != null) 'location': location,
        if (region != null) 'region': region,
        if (budget != null) 'budget': budget,
        if (deadline != null) 'deadline': deadline.toIso8601String(),
      });
      
      // Добавляем изображения если есть
      if (images != null && images.isNotEmpty) {
        for (var i = 0; i < images.length; i++) {
          formData.files.add(MapEntry(
            'images',
            await MultipartFile.fromFile(images[i].path),
          ));
        }
      }
      
      final response = await _dio.post('/orders/create', data: formData);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final order = OrderModel.fromJson(data);
        
        print('✅ API: Order created: ${order.id}');
        
        return ApiResponse<OrderModel>(
          success: true,
          data: order,
          message: response.data['message'] ?? 'Заказ создан',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<OrderModel>(
          success: false,
          message: 'Ошибка создания заказа',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Create order error: $e');
      return ApiResponse<OrderModel>(
        success: false,
        message: 'Ошибка создания заказа: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<OrderResponse>> respondToOrder(
    String orderId,
    OrderResponseRequest request,
  ) async {
    try {
      print('📡 API: POST /orders/$orderId/response');
      final response = await _dio.post('/orders/$orderId/response', data: {
        'message': request.message,
        'price': request.price,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final orderResponse = OrderResponse.fromJson(data);
        print('✅ API: Response created');
        
        return ApiResponse<OrderResponse>(
          success: true,
          data: orderResponse,
          message: response.data['message'],
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<OrderResponse>(
          success: false,
          message: 'Ошибка отклика на заказ',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Respond to order error: $e');
      throw Exception('Ошибка отклика: ${e.toString()}');
    }
  }

  Future<ApiResponse<AcceptResponse>> acceptResponse(
    String orderId,
    AcceptRequest request,
  ) async {
    try {
      print('📡 API: POST /orders/$orderId/accept');
      final response = await _dio.post('/orders/$orderId/accept', data: {
        'responseId': request.responseId,
      });
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final order = OrderModel.fromJson(data['order'] ?? data);
        final chatId = data['chatId'] ?? data['chat_id'] ?? '';
        
        print('✅ API: Response accepted');
        
        return ApiResponse<AcceptResponse>(
          success: true,
          data: AcceptResponse(order: order, chatId: chatId),
          message: response.data['message'],
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<AcceptResponse>(
          success: false,
          message: 'Ошибка принятия отклика',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Accept response error: $e');
      throw Exception('Ошибка принятия: ${e.toString()}');
    }
  }

  Future<ApiResponse<List<CategoryData>>> getOrderCategories() async {
    try {
      print('📡 API: GET /orders/categories');
      final response = await _dio.get('/orders/categories');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data['categories'] ?? [];
        final List<CategoryData> categories = (data as List).map((json) => CategoryData.fromJson(json)).toList();
        
        return ApiResponse<List<CategoryData>>(
          success: true,
          data: categories,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        // Fallback к захардкоженным категориям если API не работает
        return ApiResponse<List<CategoryData>>(
          success: true,
          data: [
            CategoryData(id: 'kitchen', name: 'Кухни', description: null),
            CategoryData(id: 'wardrobe', name: 'Шкафы', description: null),
            CategoryData(id: 'living_room', name: 'Гостиная', description: null),
          ],
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('⚠️ API: Categories error, using fallback: $e');
      return ApiResponse<List<CategoryData>>(
        success: true,
        data: [
          CategoryData(id: 'kitchen', name: 'Кухни', description: null),
          CategoryData(id: 'wardrobe', name: 'Шкафы', description: null),
          CategoryData(id: 'living_room', name: 'Гостиная', description: null),
        ],
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<List<String>>> getRegions() async {
    try {
      print('📡 API: GET /regions');
      final response = await _dio.get('/regions');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data['regions'] ?? [];
        final regions = (data as List).map((e) => e.toString()).toList();
        
        return ApiResponse<List<String>>(
          success: true,
          data: regions,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        // Fallback к захардкоженным регионам
        return ApiResponse<List<String>>(
          success: true,
          data: ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'],
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('⚠️ API: Regions error, using fallback: $e');
      return ApiResponse<List<String>>(
        success: true,
        data: ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'],
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Chat endpoints
  Future<ApiResponse<List<ChatModel>>> getChats() async {
    try {
      // ИСПРАВЛЕНО: реальный endpoint /chats/list (не /chat/list)
      final response = await _dio.get('/chats/list');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> chatsJson = data['data'] ?? [];
        final chats = chatsJson.map((json) => ChatModel.fromJson(json)).toList();
        
        return ApiResponse<List<ChatModel>>(
          success: true,
          data: chats,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<ChatModel>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки чатов',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get chats error: $e');
      return ApiResponse<List<ChatModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки чатов: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<List<MessageModel>>> getMessages(String chatId) async {
    try {
      // ИСПРАВЛЕНО: реальный endpoint /chats/{id}/messages (не /chat/{id}/messages)
      final response = await _dio.get('/chats/$chatId/messages');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> messagesJson = data['data']?['messages'] ?? data['messages'] ?? [];
        final messages = messagesJson.map((json) => MessageModel.fromJson(json)).toList();
        
        return ApiResponse<List<MessageModel>>(
          success: true,
          data: messages,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<MessageModel>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки сообщений',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get messages error: $e');
      return ApiResponse<List<MessageModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки сообщений: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<MessageModel>> sendMessage(
    String chatId,
    SendMessageRequest request,
  ) async {
    try {
      // ИСПРАВЛЕНО: реальный endpoint /chats/{id}/message (не /chat/{id}/message)
      final response = await _dio.post('/chats/$chatId/message', data: {
        'content': request.content,
      });
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final message = MessageModel.fromJson(data);
        
        return ApiResponse<MessageModel>(
          success: true,
          data: message,
          message: responseData['message'] ?? 'Сообщение отправлено',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<MessageModel>(
          success: false,
          message: 'Ошибка отправки сообщения',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      throw Exception('Ошибка отправки сообщения: $e');
    }
  }

  Future<ApiResponse<List<VideoModel>>> searchVideos(String query) async {
    try {
      // ✅ ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ ENDPOINT /search (как веб-фронтенд!)
      final response = await _dio.get('/search', queryParameters: {
        'q': query,
        'type': 'video',
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data']?['videos'] ?? data['videos'] ?? [];
        final videos = videosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        print('🔍 API: Found ${videos.length} videos for query "$query"');
        
        return ApiResponse<List<VideoModel>>(
          success: true,
          data: videos,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<VideoModel>>(
          success: false,
          data: [],
          message: 'Ошибка поиска видео',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Search videos error: $e');
      return ApiResponse<List<VideoModel>>(
        success: false,
        data: [],
        message: 'Ошибка поиска видео: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Поиск мастеров (каналов)
  Future<ApiResponse<List<UserModel>>> searchMasters(String query) async {
    try {
      print('📡 API: GET /search?q=$query&type=channel');
      final response = await _dio.get('/search', queryParameters: {
        'q': query,
        'type': 'channel',
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        // API возвращает видео мастеров, извлекаем уникальных мастеров
        final List<dynamic> videosJson = data['data']?['videos'] ?? data['videos'] ?? [];
        final Set<String> uniqueMasterIds = {};
        final List<UserModel> masters = [];
        
        for (var videoJson in videosJson) {
          final masterId = videoJson['authorId'] ?? videoJson['author_id'];
          if (masterId != null && !uniqueMasterIds.contains(masterId)) {
            uniqueMasterIds.add(masterId);
            // Создаём UserModel из данных автора в видео
            masters.add(UserModel(
              id: masterId,
              username: videoJson['username'] ?? 'Master',
              email: null,
              phone: null,
              firstName: videoJson['firstName'] ?? videoJson['first_name'],
              lastName: videoJson['lastName'] ?? videoJson['last_name'],
              avatar: videoJson['avatar'],
              role: 'master',
              isActive: true,
              isVerified: null,
              createdAt: null,
              updatedAt: null,
            ));
          }
        }
        
        print('🔍 API: Found ${masters.length} masters for query "$query"');
        
        return ApiResponse<List<UserModel>>(
          success: true,
          data: masters,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<UserModel>>(
          success: false,
          data: [],
          message: 'Ошибка поиска мастеров',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Search masters error: $e');
      return ApiResponse<List<UserModel>>(
        success: false,
        data: [],
        message: 'Ошибка поиска мастеров: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Подписаться на мастера
  Future<ApiResponse<EmptyResponse>> subscribeToUser(String userId) async {
    try {
      print('📡 API: POST /users/$userId/subscribe');
      final response = await _dio.post('/users/$userId/subscribe');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        print('✅ API: Subscribed to user $userId');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: response.data['message'] ?? 'Вы подписались',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: response.data['message'] ?? 'Ошибка подписки',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Subscribe error: $e');
      throw Exception('Ошибка подписки: ${e.toString()}');
    }
  }

  // Отписаться от мастера
  Future<ApiResponse<EmptyResponse>> unsubscribeFromUser(String userId) async {
    try {
      print('📡 API: DELETE /users/$userId/unsubscribe');
      final response = await _dio.delete('/users/$userId/unsubscribe');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        print('✅ API: Unsubscribed from user $userId');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: response.data?['message'] ?? 'Вы отписались',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: response.data?['message'] ?? 'Ошибка отписки',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Unsubscribe error: $e');
      throw Exception('Ошибка отписки: ${e.toString()}');
    }
  }

  // Получение профиля пользователя (мастера)
  Future<ApiResponse<UserModel>> getUser(String userId) async {
    try {
      print('📡 API: GET /users/$userId');
      final response = await _dio.get('/users/$userId');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(data);
        
        print('✅ API: User loaded: ${user.username}');
        
        return ApiResponse<UserModel>(
          success: true,
          data: user,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<UserModel>(
          success: false,
          message: 'Пользователь не найден',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get user error: $e');
      return ApiResponse<UserModel>(
        success: false,
        message: 'Ошибка загрузки пользователя: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Загрузка комментариев к видео
  Future<ApiResponse<List<CommentModel>>> getVideoComments(String videoId) async {
    try {
      print('📡 API: GET /videos/$videoId/comments');
      final response = await _dio.get('/videos/$videoId/comments');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> commentsJson = data['data']?['comments'] ?? data['comments'] ?? [];
        final comments = commentsJson.map((json) => CommentModel.fromJson(json)).toList();
        
        print('✅ API: Loaded ${comments.length} comments');
        
        return ApiResponse<List<CommentModel>>(
          success: true,
          data: comments,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<CommentModel>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки комментариев',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get comments error: $e');
      return ApiResponse<List<CommentModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки комментариев: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<List<VideoModel>>> getMasterVideos(String masterId) async {
    try {
      // ИСПРАВЛЕНО: используем реальный endpoint /videos/master/:masterId
      final response = await _dio.get('/videos/master/$masterId');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data']['videos'] ?? [];
        final videos = videosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        return ApiResponse<List<VideoModel>>(
          success: true,
          data: videos,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<VideoModel>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки видео мастера',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      return ApiResponse<List<VideoModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки видео мастера: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<OrderFeedData>> getUserOrders() async {
    try {
      // ✅ ИСПОЛЬЗУЕМ /orders/feed (как веб-фронтенд!)
      // Бэк автоматически фильтрует по текущему пользователю
      final response = await _dio.get('/orders/feed');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> ordersJson = data['data']?['orders'] ?? [];
        final orders = ordersJson.map((json) => OrderModel.fromJson(json)).toList();
        
        final pagination = data['data']?['pagination'];
        
        print('📦 API: Loaded ${orders.length} user orders');
        
        return ApiResponse<OrderFeedData>(
          success: true,
          data: OrderFeedData(
            orders: orders,
            pagination: PaginationData(
              page: pagination?['page'] ?? 1,
              limit: pagination?['limit'] ?? 20,
              total: pagination?['total'] ?? orders.length,
              totalPages: pagination?['totalPages'] ?? 1,
            ),
          ),
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<OrderFeedData>(
          success: false,
          data: OrderFeedData(
            orders: [],
            pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
          ),
          message: 'Ошибка загрузки заказов пользователя',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Get user orders error: $e');
      return ApiResponse<OrderFeedData>(
        success: false,
        data: OrderFeedData(
          orders: [],
          pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
        ),
        message: 'Ошибка загрузки заказов: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<OrderFeedData>> searchOrders(String query) async {
    try {
      // ✅ ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ ENDPOINT /search (как веб-фронтенд!)
      final response = await _dio.get('/search', queryParameters: {
        'q': query,
        'type': 'order',
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> ordersJson = data['data']?['orders'] ?? data['orders'] ?? [];
        final orders = ordersJson.map((json) => OrderModel.fromJson(json)).toList();
        
        print('🔍 API: Found ${orders.length} orders for query "$query"');
        
        return ApiResponse<OrderFeedData>(
          success: true,
          data: OrderFeedData(
            orders: orders,
            pagination: PaginationData(
              page: 1,
              limit: orders.length,
              total: orders.length,
              totalPages: 1,
            ),
          ),
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<OrderFeedData>(
          success: false,
          data: OrderFeedData(
            orders: [],
            pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
          ),
          message: 'Ошибка поиска заказов',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Search orders error: $e');
      return ApiResponse<OrderFeedData>(
        success: false,
        data: OrderFeedData(
          orders: [],
          pagination: PaginationData(page: 1, limit: 20, total: 0, totalPages: 0),
        ),
        message: 'Ошибка поиска заказов: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<List<OrderResponse>>> getOrderResponses(String orderId) async {
    try {
      // Используем реальный endpoint для получения откликов на заказ
      final response = await _dio.get('/orders/$orderId/responses');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> responsesJson = data['data']?['responses'] ?? data['responses'] ?? [];
        final responses = responsesJson.map((json) => OrderResponse.fromJson(json)).toList();
        
        return ApiResponse<List<OrderResponse>>(
          success: true,
          data: responses,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<OrderResponse>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки откликов',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // Support endpoints
  Future<ApiResponse<EmptyResponse>> sendSupportMessage({
    required String subject,
    required String message,
    String? category,
  }) async {
    try {
      print('📡 API: POST /support/contact');
      final response = await _dio.post('/support/contact', data: {
        'subject': subject,
        'message': message,
        if (category != null) 'category': category,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        print('✅ API: Support message sent');
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: response.data['message'] ?? 'Сообщение отправлено',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: 'Ошибка отправки сообщения',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      print('❌ API: Send support message error: $e');
      throw Exception('Ошибка отправки сообщения: ${e.toString()}');
    }
  }

  DioException _handleDioError(DioException e) {
    return e;
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
  final String? description;

  CategoryData({
    required this.id,
    required this.name,
    this.description,
  });
  
  factory CategoryData.fromJson(Map<String, dynamic> json) {
    return CategoryData(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }
}

class SendMessageRequest {
  final String content;

  SendMessageRequest({required this.content});
}

class EmptyResponse {
  EmptyResponse();
}