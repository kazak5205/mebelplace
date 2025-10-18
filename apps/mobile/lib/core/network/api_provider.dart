import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client_v2.dart';

/// Provider for API Client v2
final apiClientV2Provider = Provider<ApiClientV2>((ref) {
  return ApiClientV2();
});

/// Auth API provider
final authApiProvider = Provider((ref) {
  final client = ref.watch(apiClientV2Provider);
  return AuthApi(client);
});

/// Users API provider
final usersApiProvider = Provider((ref) {
  final client = ref.watch(apiClientV2Provider);
  return UsersApi(client);
});

/// Auth API wrapper
class AuthApi {
  final ApiClientV2 _client;
  
  AuthApi(this._client);
  
  Future<Map<String, dynamic>> login(String email, String password) {
    return _client.login(email, password);
  }
  
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) {
    return _client.register(
      name: name,
      email: email,
      phone: phone,
      password: password,
    );
  }
  
  Future<Map<String, dynamic>> refresh() {
    return _client.refreshToken();
  }
}

/// Users API wrapper
class UsersApi {
  final ApiClientV2 _client;
  
  UsersApi(this._client);
  
  Future<Map<String, dynamic>> getMe() {
    return _client.getMe();
  }
  
  Future<Map<String, dynamic>> updateMe(Map<String, dynamic> data) {
    return _client.updateMe(data);
  }
  
  Future<Map<String, dynamic>> getById(int id) {
    return _client.getUserById(id);
  }
}

