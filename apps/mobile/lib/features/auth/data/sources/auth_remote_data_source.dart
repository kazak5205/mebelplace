import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../models/user_model.dart';
import '../models/auth_tokens_model.dart';
import '../../../../core/constants/api_endpoints.dart';

abstract class AuthRemoteDataSource {
  Future<AuthTokensModel> login({
    required String emailOrPhone,
    required String password,
  });
  
  Future<AuthTokensModel> register({
    required String emailOrPhone,
    required String password,
    String? username,
  });
  
  Future<void> logout();
  
  Future<AuthTokensModel> refreshToken(String refreshToken);
  
  Future<UserModel> getCurrentUser();
  
  Future<void> verifySms({
    required String phone,
    required String code,
  });
  
  Future<void> verifyEmail({
    required String email,
    required String code,
  });
  
  Future<void> resetPassword({
    required String email,
  });
  
  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;

  AuthRemoteDataSourceImpl(this.dioClient);

  @override
  Future<AuthTokensModel> login({
    required String emailOrPhone,
    required String password,
  }) async {
    try {
      final response = await dioClient.post(
        ApiEndpoints.login,
        data: {
          'email_or_phone': emailOrPhone,
          'password': password,
        },
      );

      return AuthTokensModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Login failed: ${e.message}');
    }
  }

  @override
  Future<AuthTokensModel> register({
    required String emailOrPhone,
    required String password,
    String? username,
  }) async {
    try {
      final response = await dioClient.post(
        ApiEndpoints.register,
        data: {
          'email_or_phone': emailOrPhone,
          'password': password,
          if (username != null) 'username': username,
        },
      );

      return AuthTokensModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Registration failed: ${e.message}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await dioClient.post(ApiEndpoints.logout);
    } catch (e) {
      // Игнорируем ошибки logout
    }
  }

  @override
  Future<AuthTokensModel> refreshToken(String refreshToken) async {
    try {
      final response = await dioClient.post(
        ApiEndpoints.refreshToken,
        data: {'refresh_token': refreshToken},
      );

      return AuthTokensModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Token refresh failed: ${e.message}');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await dioClient.get(ApiEndpoints.profile);

      return UserModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception('Failed to get user: ${e.message}');
    }
  }

  @override
  Future<void> verifySms({
    required String phone,
    required String code,
  }) async {
    try {
      await dioClient.post(
        ApiEndpoints.authVerifySms,
        data: {
          'phone': phone,
          'code': code,
        },
      );
    } on DioException catch (e) {
      throw Exception('SMS verification failed: ${e.message}');
    }
  }

  @override
  Future<void> verifyEmail({
    required String email,
    required String code,
  }) async {
    try {
      await dioClient.post(
        ApiEndpoints.authVerifyEmail,
        data: {
          'email': email,
          'code': code,
        },
      );
    } on DioException catch (e) {
      throw Exception('Email verification failed: ${e.message}');
    }
  }

  @override
  Future<void> resetPassword({required String email}) async {
    try {
      await dioClient.post(
        ApiEndpoints.resetPassword,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw Exception('Password reset failed: ${e.message}');
    }
  }

  @override
  Future<void> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async {
    try {
      await dioClient.post(
        '/profile/password',
        data: {
          'old_password': oldPassword,
          'new_password': newPassword,
        },
      );
    } on DioException catch (e) {
      throw Exception('Password change failed: ${e.message}');
    }
  }
}

