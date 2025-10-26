import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/api_service.dart';
import '../../data/datasources/local_storage.dart';
import '../../data/repositories/app_repositories.dart';

// Dio Provider
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();
  dio.options.baseUrl = "https://mebelplace.com.kz/api";
  dio.options.connectTimeout = const Duration(seconds: 30);
  dio.options.receiveTimeout = const Duration(seconds: 30);
  
  // Add interceptors
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    logPrint: (obj) => debugPrint(obj),
  ));
  
  return dio;
});

// Local Storage Provider
final localStorageProvider = Provider<LocalStorage>((ref) {
  return LocalStorage();
});

// API Service Provider
final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiService(dio);
});

// Repository Providers
final videoRepositoryProvider = Provider<VideoRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final localStorage = ref.watch(localStorageProvider);
  return VideoRepository(apiService, localStorage);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final localStorage = ref.watch(localStorageProvider);
  return AuthRepository(apiService, localStorage);
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final localStorage = ref.watch(localStorageProvider);
  return OrderRepository(apiService, localStorage);
});

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final localStorage = ref.watch(localStorageProvider);
  return ChatRepository(apiService, localStorage);
});