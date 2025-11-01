import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/video_model.dart';
import '../models/order_model.dart';
import '../models/chat_model.dart';
import '../models/message_model.dart';
import '../models/order_response_model.dart';
import '../models/comment_model.dart';
import '../adapters/case_converter.dart';
import 'local_storage.dart';

// Debug logging helper - only logs in debug mode
void _debugLog(String message) {
  if (kDebugMode) {
    print(message);
  }
}

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
        _debugLog('📤 API Request: ${options.method} ${options.path}');
        if (options.queryParameters.isNotEmpty) {
          _debugLog('   Query: ${options.queryParameters}');
        }
        if (options.data != null && options.data is! FormData) {
          _debugLog('   Body: ${options.data}');
        }
        
        // Добавляем JWT токен если есть
        final token = await LocalStorage().getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          _debugLog('   Auth: Bearer ${token.substring(0, 20)}...');
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        _debugLog('📥 API Response: ${response.statusCode} ${response.requestOptions.path}');
        
        // ✅ ТРАНСФОРМАЦИЯ snake_case → camelCase (как веб-фронтенд!)
        // Трансформируем ТОЛЬКО response.data.data, а не весь response.data!
        if (response.data != null && response.data is Map) {
          final data = response.data as Map;
          if (data.containsKey('data') && data['data'] != null) {
            _debugLog('   Keys (before transform): ${data.keys.take(10).join(", ")}');
            data['data'] = snakeToCamel(data['data']);
            _debugLog('   Keys (after transform): ${data.keys.take(10).join(", ")}');
          }
        }
        return handler.next(response);
      },
      onError: (error, handler) async {
        _debugLog('❌ API Error: ${error.response?.statusCode} ${error.requestOptions.path}');
        if (error.response?.data != null) {
          _debugLog('   Error data: ${error.response?.data}');
        }
        // Try refresh once on 401/403
        final status = error.response?.statusCode ?? 0;
        if ((status == 401 || status == 403) && error.requestOptions.path != '/auth/refresh') {
          try {
            final rt = await LocalStorage().getRefreshToken();
            if (rt != null && rt.isNotEmpty) {
              final resp = await refreshToken(RefreshRequest(refreshToken: rt));
              if (resp.success && resp.data != null) {
                final newAccess = resp.data!.accessToken ?? '';
                await LocalStorage().saveToken(newAccess);
                if (resp.data!.refreshToken != null && resp.data!.refreshToken!.isNotEmpty) {
                  await LocalStorage().saveRefreshToken(resp.data!.refreshToken!);
                }
                final req = error.requestOptions;
                req.headers['Authorization'] = 'Bearer $newAccess';
                final retryResponse = await _dio.fetch(req);
                return handler.resolve(retryResponse);
              }
            }
          } catch (_) {}
        }
        _debugLog('   Message: ${error.message}');
        handler.next(error);
      },
    ));
  }


  // Auth endpoints
  
  // Восстановление пароля - отправка SMS кода
  Future<ApiResponse<EmptyResponse>> forgotPassword(String phone) async {
    try {
      _debugLog('📡 API: POST /auth/forgot-password');
      final response = await _dio.post('/auth/forgot-password', data: {
        'phone': phone,
      });
      
      if (response.statusCode == 200) {
        _debugLog('✅ API: SMS code sent to $phone');
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
      _debugLog('❌ API: Forgot password error: $e');
      throw Exception('Ошибка отправки кода: ${e.toString()}');
    }
  }

  // Отправка SMS кода для верификации
  Future<ApiResponse<Map<String, dynamic>>> sendSmsCode(String phone) async {
    try {
      _debugLog('📡 API: POST /auth/send-sms-code');
      final response = await _dio.post('/auth/send-sms-code', data: {
        'phone': phone,
      });
      
      if (response.statusCode == 200) {
        _debugLog('✅ API: SMS code sent to $phone');
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
      _debugLog('❌ API: Send SMS code error: $e');
      throw Exception('Ошибка отправки SMS: ${e.toString()}');
    }
  }

  // Проверка SMS кода (БЕЗ создания пользователя!)
  Future<ApiResponse<EmptyResponse>> verifySmsCode(String phone, String code) async {
    try {
      _debugLog('📡 API: POST /auth/verify-sms');
      _debugLog('   Phone: $phone, Code: $code');
      
      final response = await _dio.post('/auth/verify-sms', data: {
        'phone': phone,
        'code': code,
      });
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        
        _debugLog('✅ API: SMS verified successfully');
        
        // ✅ API просто подтверждает код, user создается позже при /auth/register
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: responseData['message'] ?? 'Код подтвержден',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          data: EmptyResponse(),
          message: response.data['message'] ?? 'Неверный код',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Verify SMS error: $e');
      if (e is DioException) {
        final errorMsg = e.response?.data?['message'] ?? 'Неверный код';
        return ApiResponse<EmptyResponse>(
          success: false,
          data: EmptyResponse(),
          message: errorMsg,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
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
      _debugLog('📡 API: POST /auth/reset-password');
      final response = await _dio.post('/auth/reset-password', data: {
        'phone': phone,
        'code': code,
        'newPassword': newPassword,
      });
      
      if (response.statusCode == 200) {
        _debugLog('✅ API: Password reset successful');
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
      _debugLog('❌ API: Reset password error: $e');
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
      _debugLog('❌ API: Login error: $e');
      throw Exception('Ошибка входа: ${e.toString()}');
    }
    
  }

  Future<ApiResponse<AuthData>> register(RegisterRequest request) async {
    try {
      _debugLog('📡 API: POST /auth/register - ${request.role}');
      final response = await _dio.post('/auth/register', data: request.toJson());
      
      if (response.statusCode == 201) {
        // ИСПРАВЛЕНО: правильная структура ответа
        final responseData = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(responseData['user']);
        final accessToken = responseData['accessToken'] ?? responseData['token'];
        final refreshToken = responseData['refreshToken'] ?? responseData['refresh_token'];
        
        // Сохраняем токены
        await LocalStorage().saveToken(accessToken);
        if (refreshToken != null) {
          await LocalStorage().saveRefreshToken(refreshToken);
        }
        
        _debugLog('✅ API: Registration successful, tokens saved');
        
        return ApiResponse<AuthData>(
          success: true,
          data: AuthData(
            user: user, 
            accessToken: accessToken,
            refreshToken: refreshToken,
          ),
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
      _debugLog('❌ API: Register error: $e');
      throw Exception('Ошибка регистрации: ${e.toString()}');
    }
  }

  Future<ApiResponse<UserModel>> getCurrentUser() async {
    try {
      _debugLog('📡 API: GET /auth/profile');
      final response = await _dio.get('/auth/profile');
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data);
        
        _debugLog('✅ API: Current user loaded: ${user.username}');
        
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
      _debugLog('❌ API: Get current user error: $e');
      throw Exception('Ошибка получения профиля: ${e.toString()}');
    }
  }

  Future<ApiResponse<UserModel>> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? phone,
    String? avatar,
  }) async {
    try {
      _debugLog('📡 API: PUT /auth/profile');
      final data = <String, dynamic>{};
      if (firstName != null) data['firstName'] = firstName;
      if (lastName != null) data['lastName'] = lastName;
      if (username != null) data['username'] = username;
      if (phone != null) data['phone'] = phone;
      if (avatar != null) data['avatar'] = avatar;
      
      final response = await _dio.put('/auth/profile', data: data);
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final userData = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(userData);
        
        _debugLog('✅ API: Profile updated: ${user.username}');
        
        return ApiResponse<UserModel>(
          success: true,
          data: user,
          message: responseData['message'] ?? 'Профиль обновлен',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<UserModel>(
          success: false,
          message: response.data['message'] ?? 'Ошибка обновления профиля',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Update profile error: $e');
      throw Exception('Ошибка обновления профиля: ${e.toString()}');
    }
  }

  Future<ApiResponse<EmptyResponse>> deleteAccount() async {
    try {
      _debugLog('📡 API: DELETE /auth/profile');
      final response = await _dio.delete('/auth/profile');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        _debugLog('✅ API: Account deleted successfully');
        
        return ApiResponse<EmptyResponse>(
          success: true,
          data: EmptyResponse(),
          message: 'Аккаунт удален',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<EmptyResponse>(
          success: false,
          message: response.data['message'] ?? 'Ошибка удаления аккаунта',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Delete account error: $e');
      throw Exception('Ошибка удаления аккаунта: ${e.toString()}');
    }
  }

  Future<ApiResponse<EmptyResponse>> logout(LogoutRequest request) async{
    try {
      _debugLog('📡 API: POST /auth/logout');
      final response = await _dio.post('/auth/logout');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        _debugLog('✅ API: Logout successful');
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
      _debugLog('❌ API: Logout error: $e');
      throw Exception('Ошибка выхода: ${e.toString()}');
    }
  }

  Future<ApiResponse<AuthData>> refreshToken(RefreshRequest request) async {
    try {
      _debugLog('📡 API: POST /auth/refresh');
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': request.refreshToken,
      });
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        final data = responseData['data'] ?? responseData;
        final user = UserModel.fromJson(data['user']);
        
        final accessToken = data['accessToken'] ?? data['access_token'];
        final refreshToken = data['refreshToken'] ?? data['refresh_token'];
        
        _debugLog('✅ API: Token refreshed');
        
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
      _debugLog('❌ API: Refresh token error: $e');
      throw Exception('Ошибка обновления токена: ${e.toString()}');
    }
  }

  // Video endpoints
  Future<ApiResponse<VideoFeedData>> getVideoFeed(Map<String, dynamic> params) async {
    try {
      _debugLog('🔍 API: Fetching videos from ${_dio.options.baseUrl}/videos/feed');
      _debugLog('📝 API: Params: $params');
      
      final response = await _dio.get('/videos/feed', queryParameters: params);
      
      _debugLog('✅ API: Response status ${response.statusCode}');
      _debugLog('📦 API: Response data: ${response.data}');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data']['videos'] ?? [];
        
        _debugLog('📦 API: Raw videos count: ${videosJson.length}');
        if (videosJson.isNotEmpty) {
          _debugLog('   First video keys: ${(videosJson.first as Map).keys.join(", ")}');
          _debugLog('   First video avatar: ${(videosJson.first as Map)['avatar']}');
          _debugLog('   First video username: ${(videosJson.first as Map)['username']}');
        }
        
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
              : (avatar != null && avatar.isNotEmpty ? 'https://mebelplace.com.kz$avatar' : null);
          
          _debugLog('   🖼️ Avatar processing: ${json['avatar']} -> ${fixedJson['avatar']}');
          
          return fixedJson;
        }).toList();
        
        // ✅ Безопасный парсинг - пропускаем видео с ошибками, но не падаем
        final videos = <VideoModel>[];
        for (var json in fixedVideosJson) {
          try {
            videos.add(VideoModel.fromJson(json));
          } catch (e) {
            _debugLog('⚠️ API: Failed to parse video: $e');
            _debugLog('   Video JSON keys: ${json.keys.join(", ")}');
            // Пропускаем это видео, продолжаем с остальными
          }
        }
        
        _debugLog('🎥 API: Loaded ${videos.length} videos from server (${fixedVideosJson.length} total, ${fixedVideosJson.length - videos.length} failed)');
        if (videos.isNotEmpty) {
          _debugLog('   ✅ First video avatar URL: ${videos.first.avatar}');
          _debugLog('   ✅ First video username: ${videos.first.username}');
        }
    
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
        _debugLog('❌ API: Bad status code ${response.statusCode}');
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
      _debugLog('❌ API: Error fetching videos: $e');
      
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

  // ✅ Toggle like (как на вебе - один метод для лайка/анлайка)
  Future<ApiResponse<LikeData>> likeVideo(String videoId) async {
    try {
      _debugLog('❤️ API: POST /videos/$videoId/like (toggle)');
      final response = await _dio.post('/videos/$videoId/like');
    
      if (response.statusCode == 200) {
        final data = response.data['data'];
        
        _debugLog('✅ API: Like toggled - is_liked: ${data['is_liked']}, likes: ${data['likes']}');
    
        return ApiResponse<LikeData>(
          success: true,
          data: LikeData(
            videoId: videoId,
            likes: data['likes'] ?? 0,
            isLiked: data['is_liked'] ?? false, // ✅ API возвращает реальное состояние
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
      _debugLog('❌ API: Like error: $e');
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
  
  // ✅ Bookmark endpoints (как на вебе videoService.addBookmark/removeBookmark)
  Future<ApiResponse<void>> addBookmark(String videoId) async {
    try {
      _debugLog('📌 API: POST /videos/$videoId/bookmark');
      final response = await _dio.post('/videos/$videoId/bookmark');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        _debugLog('✅ API: Bookmark added');
        return ApiResponse<void>(
          success: true,
          data: null,
          message: response.data['message'] as String?,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
      
      return ApiResponse<void>(
        success: false,
        data: null,
        message: 'Ошибка добавления закладки',
        timestamp: DateTime.now().toIso8601String(),
      );
    } catch (e) {
      _debugLog('❌ API: Add bookmark error: $e');
      throw Exception('Ошибка добавления закладки: $e');
    }
  }
  
  Future<ApiResponse<void>> removeBookmark(String videoId) async {
    try {
      _debugLog('📌 API: DELETE /videos/$videoId/bookmark');
      final response = await _dio.delete('/videos/$videoId/bookmark');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        _debugLog('✅ API: Bookmark removed');
        return ApiResponse<void>(
          success: true,
          data: null,
          message: response.data['message'] as String?,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
      
      return ApiResponse<void>(
        success: false,
        data: null,
        message: 'Ошибка удаления закладки',
        timestamp: DateTime.now().toIso8601String(),
      );
    } catch (e) {
      _debugLog('❌ API: Remove bookmark error: $e');
      throw Exception('Ошибка удаления закладки: $e');
    }
  }

  // Получить избранные видео пользователя
  Future<ApiResponse<List<VideoModel>>> getBookmarkedVideos() async {
    try {
      _debugLog('📡 API: GET /videos/bookmarked');
      final response = await _dio.get('/videos/bookmarked');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data'] ?? [];
        final videos = videosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        _debugLog('✅ API: Loaded ${videos.length} bookmarked videos');
        
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
          message: 'Ошибка загрузки избранного',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get bookmarked videos error: $e');
      return ApiResponse<List<VideoModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки избранного: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Получить лайкнутые видео пользователя
  Future<ApiResponse<List<VideoModel>>> getLikedVideos() async {
    try {
      _debugLog('📡 API: GET /videos/liked');
      final response = await _dio.get('/videos/liked');
      
      if (response.statusCode == 200) {
        final data = response.data;
        // Бэкенд возвращает { data: { videos: [...], pagination: {...} } }
        final List<dynamic> videosJson = data['data']?['videos'] ?? data['data'] ?? [];
        final videos = videosJson.map((json) => VideoModel.fromJson(json)).toList();
        
        _debugLog('✅ API: Loaded ${videos.length} liked videos');
        
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
          message: 'Ошибка загрузки лайкнутых видео',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get liked videos error: $e');
      return ApiResponse<List<VideoModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки лайкнутых видео: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<VideoModel>> uploadVideo(
    File video,
    String title,
    String? description,
    String? category,
    String? tags,
    double? furniturePrice,
  ) async {
    try {
      // ✅ РЕАЛЬНЫЙ API endpoint /videos/upload
      final formData = FormData.fromMap({
        'video': await MultipartFile.fromFile(video.path),
        'title': title,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
        if (tags != null) 'tags': tags,
        if (furniturePrice != null) 'furniturePrice': furniturePrice,
      });

      _debugLog('📹 Uploading video: $title');
      _debugLog('   Category: $category');
      if (furniturePrice != null) print('   Price: $furniturePrice ₸');

      final response = await _dio.post('/videos/upload', data: formData);

      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final video = VideoModel.fromJson(data);

        _debugLog('✅ Video uploaded: ${video.id}');

        return ApiResponse<VideoModel>(
          success: true,
          data: video,
          message: 'Видео загружено',
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<VideoModel>(
          success: false,
          message: 'Ошибка загрузки видео',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ Video upload error: $e');
      return ApiResponse<VideoModel>(
        success: false,
        message: 'Ошибка загрузки видео: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
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
      _debugLog('❌ API: Get user orders error: $e');
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
      _debugLog('📡 API: GET /orders/$orderId');
      final response = await _dio.get('/orders/$orderId');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final order = OrderModel.fromJson(data);
        
        _debugLog('✅ API: Order loaded: ${order.id}');
        
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
      _debugLog('❌ API: Get order error: $e');
      throw Exception('Ошибка загрузки заказа: ${e.toString()}');
    }
  }

  Future<ApiResponse<OrderModel>> createOrder(
    String title,
    String description,
    String category, // ✅ Добавлено
    String? location,
    String? region,
    double? budget,
    DateTime? deadline,
    List<File>? images,
  ) async {
    try {
      _debugLog('📤 API: Creating order...');
      _debugLog('   Title: $title');
      _debugLog('   City: $location');
      _debugLog('   Region: $region');
      
      // ✅ ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ ENDPOINT /orders/create (как веб-фронтенд!)
      final formData = FormData.fromMap({
        'title': title,
        'description': description,
        'category': category, // ✅ Отправляем category (как в вебе!)
        if (location != null && location.isNotEmpty) 'city': location, // Бекенд ожидает 'city', а не 'location'
        if (region != null && region.isNotEmpty) 'region': region,
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
        
        _debugLog('✅ API: Order created: ${order.id}');
        
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
      _debugLog('❌ API: Create order error: $e');
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
      _debugLog('📡 API: POST /orders/$orderId/response');
      final response = await _dio.post('/orders/$orderId/response', data: {
        'message': request.message,
        'price': request.price,
        'deadline': request.deadline?.toIso8601String(),
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final orderResponse = OrderResponse.fromJson(data);
        _debugLog('✅ API: Response created');
        
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
      _debugLog('❌ API: Respond to order error: $e');
      throw Exception('Ошибка отклика: ${e.toString()}');
    }
  }

  Future<ApiResponse<AcceptResponse>> acceptResponse(
    String orderId,
    AcceptRequest request,
  ) async {
    try {
      // Проверка и очистка ID
      final cleanOrderId = orderId.trim();
      final responseId = request.responseId.trim();
      
      if (cleanOrderId.isEmpty) {
        throw Exception('ID заказа не может быть пустым');
      }
      if (responseId.isEmpty) {
        throw Exception('ID отклика не может быть пустым');
      }
      
      _debugLog('📡 API: POST /orders/$cleanOrderId/accept');
      _debugLog('   Order ID: "$cleanOrderId"');
      _debugLog('   Response ID: "$responseId"');
      
      // Как на вебе - просто запрос без таймаутов
      final response = await _dio.post(
        '/orders/$cleanOrderId/accept',
        data: {
          'responseId': responseId,
        },
        options: Options(
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );
      
      if (response.statusCode == 200) {
        // ✅ Как на вебе - просто берем data напрямую
        final data = response.data['data'] ?? response.data;
        
        // ✅ Простой парсинг как на вебе (apiService.post возвращает response.data.data)
        if (data is Map && data['order'] is Map) {
          final order = OrderModel.fromJson(data['order'] as Map<String, dynamic>);
          
          // ✅ Извлекаем chatId как на вебе result.chat.id
          String chatId = '';
          if (data['chat'] is Map) {
            chatId = data['chat']['id']?.toString() ?? '';
          } else if (data['chatId'] != null) {
            chatId = data['chatId'].toString();
          } else if (data['chat_id'] != null) {
            chatId = data['chat_id'].toString();
          }
          
          return ApiResponse<AcceptResponse>(
            success: true,
            data: AcceptResponse(order: order, chatId: chatId),
            message: response.data['message'],
            timestamp: DateTime.now().toIso8601String(),
          );
        } else {
          // Если структура неправильная - возвращаем ошибку (как на вебе просто не сработает типизация)
          return ApiResponse<AcceptResponse>(
            success: false,
            message: 'Неверная структура ответа сервера',
            timestamp: DateTime.now().toIso8601String(),
          );
        }
      } else {
        return ApiResponse<AcceptResponse>(
          success: false,
          message: 'Ошибка принятия отклика',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } on DioException catch (e) {
      _debugLog('❌ API: Accept response DioException');
      _debugLog('   Status: ${e.response?.statusCode}');
      _debugLog('   Message: ${e.message}');
      _debugLog('   Error data: ${e.response?.data}');
      
      // ✅ Как на вебе - используем сообщение от сервера
      if (e.response?.data != null && e.response!.data is Map) {
        final errorData = e.response!.data as Map;
        final serverMessage = errorData['message']?.toString();
        if (serverMessage != null && serverMessage.isNotEmpty) {
          throw Exception(serverMessage);
        }
      }
      
      // Если сообщения нет - стандартная обработка
      if (e.response?.statusCode == 500) {
        throw Exception('Ошибка сервера при принятии отклика. Попробуйте позже.');
      } else if (e.response?.statusCode == 404) {
        throw Exception('Отклик не найден');
      } else if (e.response?.statusCode == 400) {
        throw Exception('Некорректные данные');
      }
      throw Exception('Ошибка принятия отклика: ${e.message ?? 'Неизвестная ошибка'}');
    } catch (e) {
      _debugLog('❌ API: Accept response error: $e');
      throw Exception('Ошибка принятия: ${e.toString()}');
    }
  }

  Future<ApiResponse<List<CategoryData>>> getOrderCategories() async {
    try {
      _debugLog('📡 API: GET /orders/categories');
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
      _debugLog('⚠️ API: Categories error, using fallback: $e');
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
      _debugLog('📡 API: GET /orders/regions');
      final response = await _dio.get('/orders/regions');
      
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
      _debugLog('⚠️ API: Regions error, using fallback: $e');
      return ApiResponse<List<String>>(
        success: true,
        data: ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'],
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Chat endpoints
  
  // ✅ Создать чат (как на вебе)
  Future<ApiResponse<ChatModel>> createChat({
    required List<String> participants,
    String type = 'private',
    String? name,
    String? orderId,
  }) async {
    try {
      _debugLog('📡 API: POST /chat/create');
      final response = await _dio.post('/chat/create', data: {
        'participants': participants,
        'type': type,
        if (name != null) 'name': name,
        if (orderId != null) 'orderId': orderId,
      });
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data['data'] ?? response.data;
        // ✅ Получаем currentUserId из LocalStorage
        final token = await LocalStorage().getToken();
        String? currentUserId;
        if (token != null) {
          // Парсим JWT токен для получения user ID
          try {
            final parts = token.split('.');
            if (parts.length == 3) {
              final payload = parts[1];
              final normalized = base64.normalize(payload);
              final decoded = utf8.decode(base64.decode(normalized));
              final json = jsonDecode(decoded);
              currentUserId = json['userId']?.toString() ?? json['user_id']?.toString();
            }
          } catch (e) {
            _debugLog('⚠️ Failed to parse token: $e');
          }
        }
        final chat = ChatModel.fromJson(data, currentUserId: currentUserId);
        
        _debugLog('✅ API: Chat created: ${chat.id}');
        
        return ApiResponse<ChatModel>(
          success: true,
          data: chat,
          message: response.data['message'],
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<ChatModel>(
          success: false,
          message: 'Ошибка создания чата',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Create chat error: $e');
      return ApiResponse<ChatModel>(
        success: false,
        message: 'Ошибка создания чата: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }
  
  Future<ApiResponse<List<ChatModel>>> getChats({String? currentUserId}) async {
    try {
      final response = await _dio.get('/chat/list');
      
      if (response.statusCode == 200) {
        final data = response.data;
        // ✅ Backend возвращает { data: { chats: [], pagination: {} } } (строка 240-252)
        final List<dynamic> chatsJson = data['data']?['chats'] ?? [];
        
        _debugLog('📋 API: Parsing ${chatsJson.length} chats with currentUserId: $currentUserId');
        
        final chats = chatsJson.map((json) => ChatModel.fromJson(json, currentUserId: currentUserId)).toList();
        
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
      _debugLog('❌ API: Get chats error: $e');
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
      // GET /chat/:id/messages - получить сообщения чата
      final response = await _dio.get('/chat/$chatId/messages');
      
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
          message: response.statusCode == 403 ? '403' : 'Ошибка загрузки сообщений',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      final is403 = e is DioException && e.response?.statusCode == 403;
      _debugLog('❌ API: Get messages error: $e');
      return ApiResponse<List<MessageModel>>(
        success: false,
        data: [],
        message: is403 ? '403' : 'Ошибка загрузки сообщений: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<MessageModel>> sendMessage(
    String chatId,
    SendMessageRequest request, {
    String? type,
    String? replyTo,
    Map<String, dynamic>? metadata,
    File? file,
  }) async {
    try {
      _debugLog('📤 API: Sending message to chat $chatId');
      
      // Если есть файл, отправляем через FormData
      if (file != null) {
        final formData = FormData.fromMap({
          if (request.content.isNotEmpty) 'content': request.content,
          if (type != null) 'type': type,
          if (replyTo != null) 'replyTo': replyTo,
          if (metadata != null) 'metadata': jsonEncode(metadata),
          'file': await MultipartFile.fromFile(file.path),
        });
        
        final response = await _dio.post('/chat/$chatId/message', data: formData);
        
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
      } else {
        // Обычное текстовое сообщение
        final data = <String, dynamic>{
          'content': request.content,
        };
        if (type != null) data['type'] = type;
        if (replyTo != null) data['replyTo'] = replyTo;
        if (metadata != null) data['metadata'] = metadata;
        
        final response = await _dio.post('/chat/$chatId/message', data: data);
        
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
      }
    } catch (e) {
      throw Exception('Ошибка отправки сообщения: $e');
    }
  }

  Future<ApiResponse<Map<String, dynamic>>> searchVideos(String query) async {
    try {
      // ✅ ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ ENDPOINT /search (как веб-фронтенд!) - теперь возвращает videos + masters
      final response = await _dio.get('/search', queryParameters: {
        'q': query,
        'type': 'all', // ✅ Как на вебе: ищем всё (видео + мастеров)
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        final videosJson = data['data']?['videos'] ?? [];
        final mastersJson = data['data']?['masters'] ?? [];
        
        // ✅ Fix relative URLs by adding base URL (как в getVideoFeed строки 527-545)
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
              : (avatar != null && avatar.isNotEmpty ? 'https://mebelplace.com.kz$avatar' : null);
          
          return fixedJson;
        }).toList();
        
        // ✅ Fix relative URLs for masters
        final fixedMastersJson = mastersJson.map((json) {
          final avatar = json['avatar'] as String?;
          
          final Map<String, dynamic> fixedJson = Map<String, dynamic>.from(json);
          fixedJson['avatar'] = avatar?.startsWith('http') == true 
              ? avatar 
              : (avatar != null && avatar.isNotEmpty ? 'https://mebelplace.com.kz$avatar' : null);
          
          return fixedJson;
        }).toList();
        
        final videos = fixedVideosJson.map((json) => VideoModel.fromJson(json)).toList();
        final masters = fixedMastersJson.map((json) => UserModel.fromJson(json)).toList();
        
        _debugLog('🔍 API: Found ${videos.length} videos and ${masters.length} masters for query "$query"');
        
        return ApiResponse<Map<String, dynamic>>(
          success: true,
          data: {
            'videos': videos,
            'masters': masters,
          },
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<Map<String, dynamic>>(
          success: false,
          data: {'videos': [], 'masters': []},
          message: 'Ошибка поиска',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Search error: $e');
      return ApiResponse<Map<String, dynamic>>(
        success: false,
        data: {'videos': [], 'masters': []},
        message: 'Ошибка поиска: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Поиск мастеров (каналов)
  Future<ApiResponse<List<UserModel>>> searchMasters(String query) async {
    try {
      _debugLog('📡 API: GET /search?q=$query&type=channel');
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
        
        _debugLog('🔍 API: Found ${masters.length} masters for query "$query"');
        
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
      _debugLog('❌ API: Search masters error: $e');
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
      _debugLog('📡 API: POST /users/$userId/subscribe');
      final response = await _dio.post('/users/$userId/subscribe');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        _debugLog('✅ API: Subscribed to user $userId');
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
      _debugLog('❌ API: Subscribe error: $e');
      throw Exception('Ошибка подписки: ${e.toString()}');
    }
  }

  // Отписаться от мастера
  Future<ApiResponse<EmptyResponse>> unsubscribeFromUser(String userId) async {
    try {
      _debugLog('📡 API: DELETE /users/$userId/unsubscribe');
      final response = await _dio.delete('/users/$userId/unsubscribe');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        _debugLog('✅ API: Unsubscribed from user $userId');
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
      _debugLog('❌ API: Unsubscribe error: $e');
      throw Exception('Ошибка отписки: ${e.toString()}');
    }
  }

  // Проверка статуса подписки на пользователя
  Future<ApiResponse<Map<String, dynamic>>> getSubscriptionStatus(String userId) async {
    try {
      _debugLog('📡 API: GET /users/$userId/subscription-status');
      final response = await _dio.get('/users/$userId/subscription-status');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        _debugLog('✅ API: Subscription status loaded');
        
        return ApiResponse<Map<String, dynamic>>(
          success: true,
          data: data is Map<String, dynamic> ? data : {},
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<Map<String, dynamic>>(
          success: false,
          data: {},
          message: 'Не удалось получить статус подписки',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get subscription status error: $e');
      // Возвращаем успешный ответ с isSubscribed: false вместо ошибки
      return ApiResponse<Map<String, dynamic>>(
        success: true,
        data: {'isSubscribed': false},
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Получить подписки пользователя (список мастеров)
  Future<ApiResponse<List<UserModel>>> getSubscriptions(String userId) async {
    try {
      _debugLog('📡 API: GET /users/$userId/subscriptions');
      final response = await _dio.get('/users/$userId/subscriptions');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final List<dynamic> subscriptionsJson = data['subscriptions'] ?? [];
        final masters = subscriptionsJson.map((json) => UserModel.fromJson(json)).toList();
        
        _debugLog('✅ API: Loaded ${masters.length} subscriptions');
        
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
          message: 'Ошибка загрузки подписок',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get subscriptions error: $e');
      return ApiResponse<List<UserModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки подписок: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  // Получение профиля пользователя (мастера)
  Future<ApiResponse<UserModel>> getUser(String userId) async {
    try {
      _debugLog('📡 API: GET /users/$userId');
      final response = await _dio.get('/users/$userId');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(data);
        
        _debugLog('✅ API: User loaded: ${user.username}');
        
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
      _debugLog('❌ API: Get user error: $e');
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
      _debugLog('📡 API: GET /videos/$videoId/comments');
      final response = await _dio.get('/videos/$videoId/comments');
      
      if (response.statusCode == 200) {
        final data = response.data;
        // Backend возвращает data как массив напрямую, а не data.comments
        final List<dynamic> commentsJson = data['data'] is List 
            ? data['data'] 
            : (data['data'] is Map && data['data']['comments'] != null) 
                ? data['data']['comments']
                : [];
        
        _debugLog('📦 API: Comments JSON structure: ${commentsJson.length} items');
        if (commentsJson.isNotEmpty) {
          _debugLog('   First comment keys: ${(commentsJson.first as Map).keys.join(", ")}');
        }
        
        final comments = commentsJson.map((json) => CommentModel.fromJson(json)).toList();
        
        _debugLog('✅ API: Loaded ${comments.length} comments');
        
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
      _debugLog('❌ API: Get comments error: $e');
      return ApiResponse<List<CommentModel>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки комментариев: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<CommentModel>> addComment(String videoId, String content) async {
    try {
      _debugLog('📡 API: POST /videos/$videoId/comment');
      final response = await _dio.post('/videos/$videoId/comment', data: {
        'content': content,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data;
        final commentData = data['data'] ?? data;
        final comment = CommentModel.fromJson(commentData);
        
        _debugLog('✅ API: Comment added');
        
        return ApiResponse<CommentModel>(
          success: true,
          data: comment,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<CommentModel>(
          success: false,
          message: 'Ошибка добавления комментария',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Add comment error: $e');
      throw Exception('Ошибка добавления комментария: ${e.toString()}');
    }
  }

  Future<ApiResponse<List<VideoModel>>> getMasterVideos(String masterId) async {
    try {
      // ✅ Используем /videos/feed с author_id как на вебе
      final response = await _dio.get('/videos/feed', queryParameters: {
        'author_id': masterId,
        'limit': 50,
      });
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> videosJson = data['data']['videos'] ?? [];
        
        // ✅ Фиксим относительные URL как в getVideoFeed
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
              : (avatar != null && avatar.isNotEmpty ? 'https://mebelplace.com.kz$avatar' : null);
          
          return fixedJson;
        }).toList();
        
        final videos = fixedVideosJson.map((json) => VideoModel.fromJson(json)).toList();
        
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

  // ✅ Получить категории заявок
  Future<ApiResponse<List<Map<String, dynamic>>>> getCategories() async {
    try {
      _debugLog('📡 API: GET /orders/categories');
      final response = await _dio.get('/orders/categories');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> categoriesJson = data['data'] ?? [];
        final categories = categoriesJson.cast<Map<String, dynamic>>();
        
        _debugLog('✅ API: Loaded ${categories.length} categories');
        
        return ApiResponse<List<Map<String, dynamic>>>(
          success: true,
          data: categories,
          message: data['message'],
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<Map<String, dynamic>>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки категорий',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get categories error: $e');
      return ApiResponse<List<Map<String, dynamic>>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки категорий: ${e.toString()}',
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
        
        _debugLog('📦 API: Loaded ${orders.length} user orders');
        
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
      _debugLog('❌ API: Get user orders error: $e');
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
        
        _debugLog('🔍 API: Found ${orders.length} orders for query "$query"');
        
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
      _debugLog('❌ API: Search orders error: $e');
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
      print('📡 [API] GET /orders/$orderId/responses');
      print('📡 [API] Response status: ${response.statusCode}');
      print('📡 [API] Response data: ${response.data}');
      
      if (response.statusCode == 200) {
        final data = response.data;
        // Сервер возвращает data: responses (массив), а не data: { responses: [] }
        final List<dynamic> responsesJson = data['data'] ?? [];
        print('📡 [API] Parsed responses count: ${responsesJson.length}');
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
    String? priority,
  }) async {
    try {
      _debugLog('📡 API: POST /support/contact');
      final response = await _dio.post('/support/contact', data: {
        'subject': subject,
        'message': message,
        if (category != null) 'category': category,
        if (priority != null) 'priority': priority,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        _debugLog('✅ API: Support message sent');
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
      _debugLog('❌ API: Send support message error: $e');
      throw Exception('Ошибка отправки сообщения: ${e.toString()}');
    }
  }

  DioException _handleDioError(DioException e) {
    return e;
  }

  // Support API Methods
  Future<ApiResponse<SupportInfo>> getSupportInfo() async {
    try {
      _debugLog('📡 API: GET /support/info');
      final response = await _dio.get('/support/info');
      
      if (response.statusCode == 200) {
        final data = response.data;
        final supportInfo = SupportInfo.fromJson(data['data'] ?? data);
        
        _debugLog('✅ API: Loaded support info');
        
        return ApiResponse<SupportInfo>(
          success: true,
          data: supportInfo,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<SupportInfo>(
          success: false,
          data: SupportInfo(
            supportPhone: {},
            supportEmail: {},
            supportHours: {},
            supportContacts: {},
          ),
          message: 'Ошибка загрузки информации о поддержке',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      // Если endpoint не существует (404), возвращаем пустые данные (будет использован fallback)
      if (e is DioException && e.response?.statusCode == 404) {
        _debugLog('⚠️ API: /support/info endpoint not found, using fallback');
        return ApiResponse<SupportInfo>(
          success: false,
          data: SupportInfo(
            supportPhone: {},
            supportEmail: {},
            supportHours: {},
            supportContacts: {},
          ),
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
      _debugLog('❌ API: Get support info error: $e');
      return ApiResponse<SupportInfo>(
        success: false,
        data: SupportInfo(
          supportPhone: {},
          supportEmail: {},
          supportHours: {},
          supportContacts: {},
        ),
        message: null,
        timestamp: DateTime.now().toIso8601String(),
      );
    }
  }

  Future<ApiResponse<List<SupportTicket>>> getSupportTickets() async {
    try {
      _debugLog('📡 API: GET /support/tickets');
      final response = await _dio.get('/support/tickets');
      
      if (response.statusCode == 200) {
        final data = response.data;
        // Бэкенд возвращает { data: { tickets: [...], pagination: {...} } }
        final List<dynamic> ticketsJson = data['data']?['tickets'] ?? data['data'] ?? [];
        final tickets = ticketsJson.map((json) => SupportTicket.fromJson(json)).toList();
        
        _debugLog('✅ API: Loaded ${tickets.length} support tickets');
        
        return ApiResponse<List<SupportTicket>>(
          success: true,
          data: tickets,
          message: null,
          timestamp: DateTime.now().toIso8601String(),
        );
      } else {
        return ApiResponse<List<SupportTicket>>(
          success: false,
          data: [],
          message: 'Ошибка загрузки тикетов',
          timestamp: DateTime.now().toIso8601String(),
        );
      }
    } catch (e) {
      _debugLog('❌ API: Get support tickets error: $e');
      return ApiResponse<List<SupportTicket>>(
        success: false,
        data: [],
        message: 'Ошибка загрузки тикетов: ${e.toString()}',
        timestamp: DateTime.now().toIso8601String(),
      );
    }
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
  final String? companyName;
  final String? companyAddress;
  final String? companyDescription;

  RegisterRequest({
    required this.phone,
    required this.username,
    required this.password,
    this.firstName,
    this.lastName,
    this.role = 'user',
    this.companyName,
    this.companyAddress,
    this.companyDescription,
  });
  
  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'phone': phone,
      'username': username,
      'password': password,
      'role': role,
    };
    if (firstName != null) map['firstName'] = firstName!;
    if (lastName != null) map['lastName'] = lastName!;
    if (companyName != null) map['companyName'] = companyName!;
    if (companyAddress != null) map['companyAddress'] = companyAddress!;
    if (companyDescription != null) map['companyDescription'] = companyDescription!;
    return map;
  }
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

// Support Info Model
class SupportInfo {
  final Map<String, dynamic> supportPhone;
  final Map<String, dynamic> supportEmail;
  final Map<String, dynamic> supportHours;
  final Map<String, dynamic> supportContacts;

  SupportInfo({
    required this.supportPhone,
    required this.supportEmail,
    required this.supportHours,
    required this.supportContacts,
  });

  factory SupportInfo.fromJson(Map<String, dynamic> json) {
    return SupportInfo(
      supportPhone: json['support_phone'] ?? {},
      supportEmail: json['support_email'] ?? {},
      supportHours: json['support_hours'] ?? {},
      supportContacts: json['support_contacts'] ?? {},
    );
  }
}

// Support Ticket Model
class SupportTicket {
  final String id;
  final String subject;
  final String status;
  final String priority;
  final String category;
  final String createdAt;
  final String updatedAt;
  final String? resolvedAt;

  SupportTicket({
    required this.id,
    required this.subject,
    required this.status,
    required this.priority,
    required this.category,
    required this.createdAt,
    required this.updatedAt,
    this.resolvedAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    return SupportTicket(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      status: json['status'] as String? ?? 'open',
      priority: json['priority'] as String? ?? 'medium',
      category: json['category'] as String? ?? 'general',
      createdAt: json['created_at'] as String? ?? json['createdAt'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? json['updatedAt'] as String? ?? '',
      resolvedAt: json['resolved_at'] as String? ?? json['resolvedAt'] as String?,
    );
  }
}