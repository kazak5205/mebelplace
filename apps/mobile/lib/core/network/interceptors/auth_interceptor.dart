import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../constants/app_constants.dart';
import '../../config/api_config.dart';
import '../../constants/api_endpoints.dart';

/// Интерцептор для обработки аутентификации
class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _secureStorage;
  final Dio _dio;

  AuthInterceptor(this._secureStorage, this._dio);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Получаем токен из secure storage
    final accessToken = await _secureStorage.read(
      key: AppConstants.accessTokenKey,
    );

    // Добавляем токен в заголовок, если он есть
    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Если получили 401 ошибку, пытаемся обновить токен
    if (err.response?.statusCode == 401) {
      try {
        // Пытаемся обновить токен
        final refreshed = await _refreshToken();
        
        if (refreshed) {
          // Повторяем оригинальный запрос
          final response = await _retry(err.requestOptions);
          handler.resolve(response);
          return;
        }
      } catch (e) {
        // Если не удалось обновить токен, удаляем все данные
        await _clearAuth();
      }
    }

    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(
        key: AppConstants.refreshTokenKey,
      );

      if (refreshToken == null) {
        return false;
      }

      // Отправляем запрос на обновление токена
      final response = await _dio.post(
        ApiEndpoints.authRefresh,
        data: {'refresh_token': refreshToken},
        options: Options(
          headers: {'Authorization': 'Bearer $refreshToken'},
        ),
      );

      if (response.statusCode == 200) {
        final newAccessToken = response.data['access_token'];
        final newRefreshToken = response.data['refresh_token'];

        // Сохраняем новые токены
        await _secureStorage.write(
          key: AppConstants.accessTokenKey,
          value: newAccessToken,
        );
        
        if (newRefreshToken != null) {
          await _secureStorage.write(
            key: AppConstants.refreshTokenKey,
            value: newRefreshToken,
          );
        }

        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  Future<Response> _retry(RequestOptions requestOptions) async {
    // Получаем обновленный токен
    final accessToken = await _secureStorage.read(
      key: AppConstants.accessTokenKey,
    );

    // Создаем новые options с обновленным токеном
    final options = Options(
      method: requestOptions.method,
      headers: {
        ...requestOptions.headers,
        'Authorization': 'Bearer $accessToken',
      },
    );

    // Повторяем запрос
    return _dio.request(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
    );
  }

  Future<void> _clearAuth() async {
    await _secureStorage.delete(key: AppConstants.accessTokenKey);
    await _secureStorage.delete(key: AppConstants.refreshTokenKey);
    await _secureStorage.delete(key: AppConstants.userDataKey);
  }
}

