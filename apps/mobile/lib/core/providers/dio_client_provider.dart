import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';
import '../di/injection.dart';

/// Global DioClient provider for all features
final dioClientProvider = Provider<DioClient>((ref) {
  return getIt<DioClient>();
});


