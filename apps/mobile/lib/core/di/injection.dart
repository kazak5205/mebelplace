import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/dio_client.dart';
import '../services/token_service.dart';

// Video Feature
import '../../features/feed/data/sources/video_remote_data_source.dart';
import '../../features/feed/data/sources/video_local_data_source.dart';
import '../../features/feed/domain/repositories/video_repository.dart';
import '../../features/feed/data/repositories/video_repository_impl.dart';
import '../../features/feed/domain/usecases/get_video_feed_usecase.dart';
import '../../features/feed/domain/usecases/like_video_usecase.dart';
import '../../features/feed/domain/usecases/favorite_video_usecase.dart';

// Search Feature
import '../../features/search/data/sources/search_remote_data_source.dart';
import '../../features/search/data/sources/search_local_data_source.dart';
import '../../features/search/domain/repositories/search_repository.dart';
import '../../features/search/data/repositories/search_repository_impl.dart';
import '../../features/search/domain/usecases/search_usecase.dart';

// Auth Feature
import '../../features/auth/data/sources/auth_remote_data_source.dart';
import '../../features/auth/data/sources/auth_local_data_source.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/register_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';

// Requests Feature
import '../../features/requests/data/sources/request_remote_data_source.dart';
import '../../features/requests/domain/repositories/request_repository.dart';
import '../../features/requests/data/repositories/request_repository_impl.dart';

// Chats Feature
import '../../features/chats/data/sources/chat_remote_data_source.dart';
import '../../features/chats/data/sources/chat_local_data_source.dart';
import '../../features/chats/data/local/chat_database.dart';
import '../../features/chats/domain/repositories/chat_repository.dart';
import '../../features/chats/data/repositories/chat_repository_impl.dart';
import '../../features/chats/domain/usecases/send_message_usecase.dart';
import '../../features/chats/domain/usecases/get_messages_usecase.dart';

// Profile Feature
import '../../features/profile/data/sources/profile_remote_data_source.dart';
import '../../features/profile/domain/repositories/profile_repository.dart';
import '../../features/profile/data/repositories/profile_repository_impl.dart';

// Comments
import '../../features/feed/data/sources/comment_remote_data_source.dart';
import '../../features/feed/domain/repositories/comment_repository.dart';
import '../../features/feed/data/repositories/comment_repository_impl.dart';

// WebSocket
import '../network/websocket_service.dart';

// Services
import '../../services/push_notification_service.dart';
import '../services/gamification_service.dart';
import '../services/upload_service.dart';

/// GetIt instance для Dependency Injection
final getIt = GetIt.instance;

/// Инициализация всех зависимостей
Future<void> setupDependencies() async {
  // ==================== Core ====================
  
  // Storage
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(sharedPreferences);
  
  const secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );
  getIt.registerSingleton<FlutterSecureStorage>(secureStorage);

  // Network
  getIt.registerLazySingleton<DioClient>(
    () => DioClient(getIt<FlutterSecureStorage>()),
  );

  // ==================== Video Feature ====================
  
  // Data Sources
  getIt.registerLazySingleton<VideoRemoteDataSource>(
    () => VideoRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  getIt.registerLazySingleton<VideoLocalDataSource>(
    () => VideoLocalDataSourceImpl(),
  );
  
  // Repositories
  getIt.registerLazySingleton<VideoRepository>(
    () => VideoRepositoryImpl(
      remoteDataSource: getIt<VideoRemoteDataSource>(),
      localDataSource: getIt<VideoLocalDataSource>(),
    ),
  );
  
  // Use Cases
  getIt.registerLazySingleton(() => GetVideoFeedUseCase(getIt<VideoRepository>()));
  getIt.registerLazySingleton(() => LikeVideoUseCase(getIt<VideoRepository>()));
  getIt.registerLazySingleton(() => FavoriteVideoUseCase(getIt<VideoRepository>()));

  // ==================== Search Feature ====================
  
  // Data Sources
  getIt.registerLazySingleton<SearchRemoteDataSource>(
    () => SearchRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  getIt.registerLazySingleton<SearchLocalDataSource>(
    () => SearchLocalDataSourceImpl(),
  );
  
  // Repositories
  getIt.registerLazySingleton<SearchRepository>(
    () => SearchRepositoryImpl(
      remoteDataSource: getIt<SearchRemoteDataSource>(),
      localDataSource: getIt<SearchLocalDataSource>(),
    ),
  );
  
  // Use Cases
  getIt.registerLazySingleton(() => SearchUseCase(getIt<SearchRepository>()));

  // ==================== Auth Feature ====================
  
  // Data Sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  getIt.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(
      secureStorage: getIt<FlutterSecureStorage>(),
      sharedPreferences: getIt<SharedPreferences>(),
    ),
  );
  
  // Token Service (for easy access to auth tokens)
  getIt.registerLazySingleton<TokenService>(
    () => TokenService(getIt<AuthLocalDataSource>()),
  );
  
  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt<AuthRemoteDataSource>(),
      localDataSource: getIt<AuthLocalDataSource>(),
    ),
  );
  
  // Use Cases
  getIt.registerLazySingleton(() => LoginUseCase(getIt<AuthRepository>()));
  getIt.registerLazySingleton(() => RegisterUseCase(getIt<AuthRepository>()));
  getIt.registerLazySingleton(() => LogoutUseCase(getIt<AuthRepository>()));

  // ==================== Services ====================
  
  // WebSocket
  getIt.registerLazySingleton<WebSocketService>(
    () => WebSocketManager.getInstance(getIt<FlutterSecureStorage>()),
  );
  
  // Push Notifications
  getIt.registerLazySingleton<PushNotificationService>(
    () => PushNotificationService(),
  );
  
  // Gamification
  getIt.registerLazySingleton<GamificationService>(
    () => GamificationService(getIt<DioClient>()),
  );

  // Upload
  getIt.registerLazySingleton<UploadService>(
    () => UploadService(getIt<DioClient>()),
  );

  // ==================== Requests Feature ====================
  
  // Data Sources
  getIt.registerLazySingleton<RequestRemoteDataSource>(
    () => RequestRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  // Repositories
  getIt.registerLazySingleton<RequestRepository>(
    () => RequestRepositoryImpl(
      remoteDataSource: getIt<RequestRemoteDataSource>(),
    ),
  );

  // ==================== Chats Feature ====================
  
  // Database
  getIt.registerLazySingleton<ChatDatabase>(() => ChatDatabase());
  
  // Data Sources
  getIt.registerLazySingleton<ChatRemoteDataSource>(
    () => ChatRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  getIt.registerLazySingleton<ChatLocalDataSource>(
    () => ChatLocalDataSourceImpl(), // No DB dependency for now
  );
  
  // Repositories
  getIt.registerLazySingleton<ChatRepository>(
    () => ChatRepositoryImpl(
      remoteDataSource: getIt<ChatRemoteDataSource>(),
      localDataSource: getIt<ChatLocalDataSource>(),
    ),
  );
  
  // Use Cases
  getIt.registerLazySingleton(() => SendMessageUseCase(getIt<ChatRepository>()));
  getIt.registerLazySingleton(() => GetMessagesUseCase(getIt<ChatRepository>()));

  // ==================== Profile Feature ====================
  
  // Data Sources
  getIt.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  // Repositories
  getIt.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(
      remoteDataSource: getIt<ProfileRemoteDataSource>(),
    ),
  );

  // ==================== Comments ====================
  
  // Data Sources
  getIt.registerLazySingleton<CommentRemoteDataSource>(
    () => CommentRemoteDataSourceImpl(getIt<DioClient>()),
  );
  
  // Repositories
  getIt.registerLazySingleton<CommentRepository>(
    () => CommentRepositoryImpl(
      remoteDataSource: getIt<CommentRemoteDataSource>(),
    ),
  );

  // ==================== Providers (Riverpod) ====================
  // Riverpod providers не регистрируются в GetIt
  // Они используют собственную систему DI через Provider
}

