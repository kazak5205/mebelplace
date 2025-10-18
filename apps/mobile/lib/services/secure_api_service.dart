import 'package:flutter/foundation.dart';
import '../../core/config/api_config_export.dart';

import 'dart:async';
import '../../core/config/api_config_export.dart';
import 'dart:convert';
import '../../core/config/api_config_export.dart';
import 'package:http/http.dart' as http;
import '../../core/config/api_config_export.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/api_config_export.dart';
import '../../features/auth/domain/entities/user_entity.dart';
import '../../core/config/api_config_export.dart';

/// Secure API Service с полной поддержкой безопасности
/// - CSRF токены для всех изменяющих запросов
/// - Rate limiting обработка с retry логикой
/// - Secure storage для токенов
/// - Автоматическое обновление JWT токенов
class SecureApiService {
  static final SecureApiService _instance = SecureApiService._internal();
  factory SecureApiService() => _instance;
  SecureApiService._internal();

  // Secure storage для токенов
  final _secureStorage = const FlutterSecureStorage();
  
  // Cache для CSRF токена
  String? _csrfToken;
  DateTime? _csrfTokenExpiry;
  
  // JWT токены
  String? _accessToken;
  String? _refreshToken;
  
  // Rate limiting queue
  final List<_QueuedRequest> _requestQueue = [];
  bool _isProcessingQueue = false;
  
  /// Инициализация - загрузка токенов из secure storage
  Future<void> init() async {
    try {
      _accessToken = await _secureStorage.read(key: 'access_token');
      _refreshToken = await _secureStorage.read(key: 'refresh_token');
      _csrfToken = await _secureStorage.read(key: 'csrf_token');
      
      // Проверяем expiry CSRF токена
      final expiryStr = await _secureStorage.read(key: 'csrf_token_expiry');
      if (expiryStr != null) {
        _csrfTokenExpiry = DateTime.tryParse(expiryStr);
      }
    } catch (e) {
      debugPrint('SecureApiService init error: $e');
    }
  }

  /// Сохранить JWT токены в secure storage
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    
    await _secureStorage.write(key: 'access_token', value: accessToken);
    await _secureStorage.write(key: 'refresh_token', value: refreshToken);
  }

  /// Очистить все токены
  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    _csrfToken = null;
    _csrfTokenExpiry = null;
    
    await _secureStorage.deleteAll();
  }

  /// Получить CSRF токен (с кэшированием на 10 минут)
  Future<String?> _getCsrfToken() async {
    // Проверяем кэш
    if (_csrfToken != null && _csrfTokenExpiry != null) {
      if (DateTime.now().isBefore(_csrfTokenExpiry!)) {
        return _csrfToken;
      }
    }

    // Получаем новый CSRF токен
    if (_accessToken == null) {
      return null; // Требуется авторизация
    }

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.apiBaseUrl + "/csrf-token"),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_accessToken',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _csrfToken = data['csrf_token'];
        _csrfTokenExpiry = DateTime.now().add(const Duration(minutes: 10));
        
        // Сохраняем в secure storage
        await _secureStorage.write(key: 'csrf_token', value: _csrfToken!);
        await _secureStorage.write(
          key: 'csrf_token_expiry', 
          value: _csrfTokenExpiry!.toIso8601String(),
        );
        
        return _csrfToken;
      }
    } catch (e) {
      debugPrint('CSRF token error: $e');
    }
    
    return null;
  }

  /// Выполнить HTTP запрос с полной безопасностью
  Future<http.Response> request(
    String method,
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    bool requiresAuth = true,
    bool requiresCsrf = false,
    int retryCount = 0,
  }) async {
    // Подготовка заголовков
    final requestHeaders = <String, String>{
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      if (headers != null) ...headers,
    };

    // Добавляем JWT токен если требуется
    if (requiresAuth && _accessToken != null) {
      requestHeaders['Authorization'] = 'Bearer $_accessToken';
    }

    // Добавляем CSRF токен для изменяющих запросов
    if (requiresCsrf || ['POST', 'PUT', 'DELETE', 'PATCH'].contains(method.toUpperCase())) {
      final csrfToken = await _getCsrfToken();
      if (csrfToken != null) {
        requestHeaders['X-CSRF-Token'] = csrfToken;
      }
    }

    try {
      // Выполняем запрос
      final uri = Uri.parse(url);
      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: requestHeaders)
              .timeout(const Duration(seconds: 30));
          break;
        case 'POST':
          response = await http.post(
            uri,
            headers: requestHeaders,
            body: body != null ? json.encode(body) : null,
          ).timeout(const Duration(seconds: 30));
          break;
        case 'PUT':
          response = await http.put(
            uri,
            headers: requestHeaders,
            body: body != null ? json.encode(body) : null,
          ).timeout(const Duration(seconds: 30));
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: requestHeaders)
              .timeout(const Duration(seconds: 30));
          break;
        default:
          throw UnsupportedError('HTTP method $method not supported');
      }

      // Обработка ответов
      if (response.statusCode == 429) {
        // Rate limiting - добавляем в очередь
        return await _handleRateLimit(
          method, url, 
          body: body, 
          headers: headers,
          requiresAuth: requiresAuth,
          requiresCsrf: requiresCsrf,
          retryCount: retryCount,
        );
      }

      if (response.statusCode == 401 && requiresAuth) {
        // Токен истёк - пробуем обновить
        if (await _refreshAccessToken()) {
          // Повторяем запрос с новым токеном
          return await request(
            method, url,
            body: body,
            headers: headers,
            requiresAuth: requiresAuth,
            requiresCsrf: requiresCsrf,
            retryCount: retryCount + 1,
          );
        }
      }

      if (response.statusCode == 403 && requiresCsrf) {
        // CSRF токен невалиден - обновляем
        _csrfToken = null;
        _csrfTokenExpiry = null;
        
        if (retryCount < 3) {
          return await request(
            method, url,
            body: body,
            headers: headers,
            requiresAuth: requiresAuth,
            requiresCsrf: true,
            retryCount: retryCount + 1,
          );
        }
      }

      return response;
    } on TimeoutException {
      if (retryCount < 3) {
        await Future.delayed(const Duration(seconds: 2));
        return await request(
          method, url,
          body: body,
          headers: headers,
          requiresAuth: requiresAuth,
          requiresCsrf: requiresCsrf,
          retryCount: retryCount + 1,
        );
      }
      rethrow;
    } catch (e) {
      if (retryCount < 3) {
        await Future.delayed(const Duration(seconds: 2));
        return await request(
          method, url,
          body: body,
          headers: headers,
          requiresAuth: requiresAuth,
          requiresCsrf: requiresCsrf,
          retryCount: retryCount + 1,
        );
      }
      rethrow;
    }
  }

  /// Обработка Rate Limiting (429 ошибки)
  Future<http.Response> _handleRateLimit(
    String method,
    String url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    bool requiresAuth = true,
    bool requiresCsrf = false,
    int retryCount = 0,
  }) async {
    // Добавляем запрос в очередь
    final completer = Completer<http.Response>();
    _requestQueue.add(_QueuedRequest(
      method: method,
      url: url,
      body: body,
      headers: headers,
      requiresAuth: requiresAuth,
      requiresCsrf: requiresCsrf,
      completer: completer,
      retryCount: retryCount,
    ));

    // Запускаем обработку очереди
    if (!_isProcessingQueue) {
      _processQueue();
    }

    return completer.future;
  }

  /// Обработка очереди запросов
  Future<void> _processQueue() async {
    if (_isProcessingQueue) return;
    _isProcessingQueue = true;

    while (_requestQueue.isNotEmpty) {
      final queuedRequest = _requestQueue.removeAt(0);
      
      // Ждём перед повторным запросом
      await Future.delayed(const Duration(seconds: 1));

      try {
        final response = await request(
          queuedRequest.method,
          queuedRequest.url,
          body: queuedRequest.body,
          headers: queuedRequest.headers,
          requiresAuth: queuedRequest.requiresAuth,
          requiresCsrf: queuedRequest.requiresCsrf,
          retryCount: queuedRequest.retryCount + 1,
        );
        queuedRequest.completer.complete(response);
      } catch (e) {
        queuedRequest.completer.completeError(e);
      }
    }

    _isProcessingQueue = false;
  }

  /// Автоматическое обновление JWT токена
  Future<bool> _refreshAccessToken() async {
    if (_refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.apiBaseUrl}/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: json.encode({'refresh_token': _refreshToken}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await saveTokens(data['access_token'], data['refresh_token']);
        return true;
      }
    } catch (e) {
      debugPrint('Token refresh error: $e');
    }

    // Токен не удалось обновить - очищаем всё
    await clearTokens();
    return false;
  }

  /// Получить текущий access token
  String? get accessToken => _accessToken;

  /// Получить текущий refresh token
  String? get refreshToken => _refreshToken;

  /// Проверка авторизации
  bool get isAuthenticated => _accessToken != null;
}

/// Модель запроса в очереди
class _QueuedRequest {
  final String method;
  final String url;
  final Map<String, dynamic>? body;
  final Map<String, String>? headers;
  final bool requiresAuth;
  final bool requiresCsrf;
  final Completer<http.Response> completer;
  final int retryCount;

  _QueuedRequest({
    required this.method,
    required this.url,
    this.body,
    this.headers,
    required this.requiresAuth,
    required this.requiresCsrf,
    required this.completer,
    required this.retryCount,
  });
}


}

