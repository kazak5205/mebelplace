import 'user_model.dart';

/// AuthTokensModel соответствует backend API response
/// Поддерживает как новые поля (access_token, refresh_token), так и legacy (token)
class AuthTokensModel {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final UserModel? user;  // User info from response

  AuthTokensModel({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    this.user,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      // Поддержка нового API (access_token) и legacy (token)
      accessToken: json['access_token'] ?? json['token'] ?? '',
      refreshToken: json['refresh_token'] ?? '',
      expiresIn: json['expires_in'] ?? 3600,
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'expires_in': expiresIn,
      'user': user?.toJson(),
    };
  }
}
