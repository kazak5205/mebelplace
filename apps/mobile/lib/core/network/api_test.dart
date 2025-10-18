import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';

class ApiTest {
  static Future<bool> testConnection() async {
    final dio = Dio();
    try {
      // Тестируем health endpoint
      final response = await dio.get(AppConstants.healthUrl);
      if (response.statusCode == 200) {
        debugPrint('✅ API Health Check: SUCCESS');
        debugPrint('📄 Response: ${response.data}');
        return true;
      } else {
        debugPrint('❌ API Health Check: FAILED with status ${response.statusCode}');
        return false;
      }
    } on DioException catch (e) {
      debugPrint('❌ API Health Check: ERROR - ${e.message}');
      debugPrint('🔍 Error details: ${e.response?.data}');
      return false;
    } catch (e) {
      debugPrint('❌ API Health Check: UNKNOWN ERROR - ${e.toString()}');
      return false;
    }
  }

  static Future<bool> testRegisterEndpoint() async {
    final dio = Dio();
    try {
      // Тестируем register endpoint с новым API
      final response = await dio.post(
        '${AppConstants.apiBaseUrl}/auth/register',
        data: {
          'email_or_phone': 'test@example.com',
          'password': 'testpassword123',
          'username': 'Test User',
        },
      );
      debugPrint('✅ Register endpoint test: SUCCESS');
      debugPrint('📄 Response: ${response.data}');
      return true;
    } on DioException catch (e) {
      debugPrint('❌ Register endpoint test: ERROR - ${e.message}');
      debugPrint('🔍 Error details: ${e.response?.data}');
      debugPrint('🔍 Status code: ${e.response?.statusCode}');
      return false;
    } catch (e) {
      debugPrint('❌ Register endpoint test: UNKNOWN ERROR - ${e.toString()}');
      return false;
    }
  }

  static Future<bool> testLoginEndpoint() async {
    final dio = Dio();
    try {
      // Тестируем login endpoint с новым API
      final response = await dio.post(
        '${AppConstants.apiBaseUrl}/auth/login',
        data: {
          'email_or_phone': 'test@example.com',
          'password': 'testpassword123',
        },
      );
      debugPrint('✅ Login endpoint test: SUCCESS');
      debugPrint('📄 Response: ${response.data}');
      return true;
    } on DioException catch (e) {
      debugPrint('❌ Login endpoint test: ERROR - ${e.message}');
      debugPrint('🔍 Error details: ${e.response?.data}');
      debugPrint('🔍 Status code: ${e.response?.statusCode}');
      return false;
    } catch (e) {
      debugPrint('❌ Login endpoint test: UNKNOWN ERROR - ${e.toString()}');
      return false;
    }
  }

  static Future<bool> testVideoFeedEndpoint() async {
    final dio = Dio();
    try {
      // Тестируем video feed endpoint с новым API
      final response = await dio.get(
        '${AppConstants.apiBaseUrl}/videos/feed',
        queryParameters: {
          'page': 1,
          'limit': 20,
        },
      );
      debugPrint('✅ Video feed endpoint test: SUCCESS');
      debugPrint('📄 Response structure: ${response.data.runtimeType}');
      return true;
    } on DioException catch (e) {
      debugPrint('❌ Video feed endpoint test: ERROR - ${e.message}');
      debugPrint('🔍 Error details: ${e.response?.data}');
      debugPrint('🔍 Status code: ${e.response?.statusCode}');
      return false;
    } catch (e) {
      debugPrint('❌ Video feed endpoint test: UNKNOWN ERROR - ${e.toString()}');
      return false;
    }
  }
}