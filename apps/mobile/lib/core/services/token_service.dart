import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/data/sources/auth_local_data_source.dart';

/// Сервис для получения токена из любого места приложения
class TokenService {
  final AuthLocalDataSource _localDataSource;

  TokenService(this._localDataSource);

  /// Получить access token для API запросов
  Future<String?> getAccessToken() async {
    return await _localDataSource.getAccessToken();
  }

  /// Получить refresh token
  Future<String?> getRefreshToken() async {
    return await _localDataSource.getRefreshToken();
  }

  /// Проверить авторизован ли пользователь
  Future<bool> isLoggedIn() async {
    return await _localDataSource.isLoggedIn();
  }

  /// Получить token с fallback на пустую строку (для API которые могут работать без auth)
  Future<String> getAccessTokenOrEmpty() async {
    final token = await getAccessToken();
    return token ?? '';
  }
}

/// Provider для TokenService
final tokenServiceProvider = Provider<TokenService>((ref) {
  throw UnimplementedError('TokenService must be overridden in main');
});

