import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../network/dio_client.dart';

/// API Service provider stub for backward compatibility
final apiServiceProvider = Provider((ref) {
  const storage = FlutterSecureStorage();
  return DioClient(storage).dio;
});


