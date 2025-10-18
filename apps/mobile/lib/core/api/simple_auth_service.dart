import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Простой сервис аутентификации без сложных провайдеров
class SimpleAuthService {
  static final SimpleAuthService _instance = SimpleAuthService._internal();
  factory SimpleAuthService() => _instance;
  SimpleAuthService._internal();

  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();
  
  static const String _baseUrl = 'https://mebelplace.com.kz/api/v2';
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  /// Инициализация с базовым URL
  void init() {
    _dio.options.baseUrl = _baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Добавляем интерсептор для автоматического добавления токена
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: _accessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Пытаемся обновить токен
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Повторяем запрос с новым токеном
            final newToken = await _storage.read(key: _accessTokenKey);
            error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
            final response = await _dio.fetch(error.requestOptions);
            handler.resolve(response);
            return;
          }
        }
        handler.next(error);
      },
    ));
  }

  /// Регистрация пользователя
  Future<Map<String, dynamic>?> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'username': name,
        'email': email,
        'password': password,
        if (phone != null) 'phone': phone,
      });

      if (response.statusCode == 201) {
        // Сохраняем токены
        final data = response.data;
        if (data['access_token'] != null) {
          await _storage.write(key: _accessTokenKey, value: data['access_token']);
          await _storage.write(key: _refreshTokenKey, value: data['refresh_token']);
        }
        return data;
      }
      return null;
    } catch (e) {
      print('Registration error: $e');
      return null;
    }
  }

  /// Вход в систему
  Future<Map<String, dynamic>?> login({
    required String emailOrPhone,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': emailOrPhone,
        'password': password,
      });

      if (response.statusCode == 200) {
        // Сохраняем токены
        final data = response.data;
        if (data['access_token'] != null) {
          await _storage.write(key: _accessTokenKey, value: data['access_token']);
          await _storage.write(key: _refreshTokenKey, value: data['refresh_token']);
        }
        return data;
      }
      return null;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  /// Выход из системы
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (e) {
      print('Logout error: $e');
    } finally {
      // Очищаем токены
      await _storage.delete(key: _accessTokenKey);
      await _storage.delete(key: _refreshTokenKey);
    }
  }

  /// Проверка авторизации
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: _accessTokenKey);
    return token != null;
  }

  /// Получение текущего пользователя
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final response = await _dio.get('/users/me');
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      print('Get user error: $e');
      return null;
    }
  }

  /// Обновление токена
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        await _storage.write(key: _accessTokenKey, value: data['access_token']);
        await _storage.write(key: _refreshTokenKey, value: data['refresh_token']);
        return true;
      }
      return false;
    } catch (e) {
      print('Refresh token error: $e');
      return false;
    }
  }

  /// Получение токена для других сервисов
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
}
