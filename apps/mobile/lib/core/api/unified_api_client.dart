import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_endpoints.dart';
import '../constants/app_constants.dart';

/// Единый унифицированный API клиент для MebelPlace
/// Заменяет OpenApiClient, ApiClientV2 и прямые dio вызовы
class UnifiedApiClient {
  static final UnifiedApiClient _instance = UnifiedApiClient._internal();
  factory UnifiedApiClient() => _instance;
  UnifiedApiClient._internal();

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  /// Инициализация клиента
  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: AppConstants.connectionTimeout,
      receiveTimeout: AppConstants.receiveTimeout,
      sendTimeout: AppConstants.sendTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) {
        return status != null && status < 500;
      },
    ));

    _setupInterceptors();
  }

  /// Настройка интерсепторов
  void _setupInterceptors() {
    // Request interceptor - добавление токена авторизации
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: AppConstants.accessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Попытка обновить токен
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Повторяем запрос с новым токеном
            final token = await _storage.read(key: AppConstants.accessTokenKey);
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            final response = await _dio.fetch(error.requestOptions);
            handler.resolve(response);
            return;
          }
        }
        handler.next(error);
      },
    ));

    // Logging interceptor для отладки
    if (const bool.fromEnvironment('DEBUG')) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
      ));
    }
  }

  /// Обновление токена
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await _dio.post(ApiEndpoints.refreshToken, data: {
        'refresh_token': refreshToken,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        await _storage.write(key: AppConstants.accessTokenKey, value: data['access_token']);
        await _storage.write(key: AppConstants.refreshTokenKey, value: data['refresh_token']);
        return true;
      }
    } catch (e) {
      debugPrint('Token refresh failed: $e');
    }
    return false;
  }

  // ========== УНИВЕРСАЛЬНЫЕ МЕТОДЫ ==========

  /// GET запрос
  Future<Response<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(endpoint, queryParameters: queryParameters, options: options);
  }

  /// POST запрос
  Future<Response<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(endpoint, data: data, queryParameters: queryParameters, options: options);
  }

  /// PUT запрос
  Future<Response<T>> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(endpoint, data: data, queryParameters: queryParameters, options: options);
  }

  /// DELETE запрос
  Future<Response<T>> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(endpoint, data: data, queryParameters: queryParameters, options: options);
  }

  /// PATCH запрос
  Future<Response<T>> patch<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.patch<T>(endpoint, data: data, queryParameters: queryParameters, options: options);
  }

  // ========== СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ ==========

  /// Загрузка файла
  Future<Response<T>> uploadFile<T>(
    String endpoint, {
    required String filePath,
    String fieldName = 'file',
    Map<String, dynamic>? additionalFields,
    ProgressCallback? onSendProgress,
  }) async {
    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(filePath),
      ...?additionalFields,
    });

    return _dio.post<T>(
      endpoint,
      data: formData,
      options: Options(
        headers: {'Content-Type': 'multipart/form-data'},
      ),
      onSendProgress: onSendProgress,
    );
  }

  /// Скачивание файла
  Future<Response<T>> downloadFile<T>(
    String endpoint, {
    required String savePath,
    ProgressCallback? onReceiveProgress,
  }) async {
    return _dio.download<T>(endpoint, savePath, onReceiveProgress: onReceiveProgress);
  }

  // ========== УТИЛИТЫ ==========

  /// Проверка авторизации
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: AppConstants.accessTokenKey);
    return token != null;
  }

  /// Очистка токенов
  Future<void> clearTokens() async {
    await _storage.delete(key: AppConstants.accessTokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
  }

  /// Получение текущего токена
  Future<String?> getCurrentToken() async {
    return _storage.read(key: AppConstants.accessTokenKey);
  }

  /// Сохранение токенов
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: AppConstants.accessTokenKey, value: accessToken);
    await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  /// Health check
  Future<bool> healthCheck() async {
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Health check error: $e');
      return false;
    }
  }

  /// Получение Dio instance для совместимости
  Dio get dio => _dio;
}

/// Глобальный экземпляр для использования по всему приложению
final unifiedApiClient = UnifiedApiClient();
