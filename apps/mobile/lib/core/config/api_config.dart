import '../constants/api_endpoints.dart';

/// API Configuration for MebelPlace Mobile App
class ApiConfig {
  // Private constructor to prevent instantiation
  ApiConfig._();

  // Base URLs
  static const String baseUrl = 'https://mebelplace.com.kz';
  static const String apiBaseUrl = '$baseUrl/api/v2';
  static const String wsBaseUrl = 'wss://mebelplace.com.kz';
  
  // Web URL for referrals and sharing
  static const String webUrl = 'https://mebelplace.com.kz';
  
  // Health check endpoint
  static const String healthUrl = '$baseUrl/health';
  
  // File upload endpoints
  static const String uploadUrl = '$apiBaseUrl/upload';
  static const String mediaUrl = '$baseUrl/media';
  
  // WebSocket endpoints
  static const String wsUrl = '$wsBaseUrl/ws';
  static const String chatWsUrl = '$wsBaseUrl/chat';
  static const String notificationsWsUrl = '$wsBaseUrl/notifications';
  
  // Feature flags for API endpoints
  static const bool enableRealTimeFeatures = true;
  static const bool enableFileUpload = true;
  static const bool enableWebSocket = true;
  
  // API Endpoints accessor - согласно mobile-api.yaml
  static Type get endpoints => ApiEndpoints;
  
  // API Version
  static const String apiVersion = 'v2';
  
  // Request timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}
