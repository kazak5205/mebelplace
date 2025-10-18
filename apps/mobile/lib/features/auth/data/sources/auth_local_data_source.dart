import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../models/user_model.dart';
import 'dart:convert';

abstract class AuthLocalDataSource {
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  });
  
  Future<String?> getAccessToken();
  
  Future<String?> getRefreshToken();
  
  Future<void> deleteTokens();
  
  Future<void> saveUser(UserModel user);
  
  Future<UserModel?> getCachedUser();
  
  Future<void> deleteUser();
  
  Future<bool> isLoggedIn();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final FlutterSecureStorage secureStorage;
  final SharedPreferences sharedPreferences;

  AuthLocalDataSourceImpl({
    required this.secureStorage,
    required this.sharedPreferences,
  });

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      secureStorage.write(
        key: AppConstants.accessTokenKey,
        value: accessToken,
      ),
      secureStorage.write(
        key: AppConstants.refreshTokenKey,
        value: refreshToken,
      ),
    ]);
  }

  @override
  Future<String?> getAccessToken() async {
    return await secureStorage.read(key: AppConstants.accessTokenKey);
  }

  @override
  Future<String?> getRefreshToken() async {
    return await secureStorage.read(key: AppConstants.refreshTokenKey);
  }

  @override
  Future<void> deleteTokens() async {
    await Future.wait([
      secureStorage.delete(key: AppConstants.accessTokenKey),
      secureStorage.delete(key: AppConstants.refreshTokenKey),
    ]);
  }

  @override
  Future<void> saveUser(UserModel user) async {
    final userJson = jsonEncode(user.toJson());
    await sharedPreferences.setString(
      AppConstants.userDataKey,
      userJson,
    );
  }

  @override
  Future<UserModel?> getCachedUser() async {
    final userJson = sharedPreferences.getString(AppConstants.userDataKey);
    if (userJson == null) return null;

    try {
      final userMap = jsonDecode(userJson) as Map<String, dynamic>;
      return UserModel.fromJson(userMap);
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> deleteUser() async {
    await sharedPreferences.remove(AppConstants.userDataKey);
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}

