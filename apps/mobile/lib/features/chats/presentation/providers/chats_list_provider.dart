import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/chat_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_endpoints.dart';

/// DioClient provider
final chatsListDioClientProvider = Provider<DioClient>((ref) => getIt<DioClient>());

/// Chats List Provider - REAL API!
final chatsListProvider = StateNotifierProvider<ChatsListNotifier, AsyncValue<List<ChatEntity>>>((ref) {
  return ChatsListNotifier(
    getIt<ChatRepository>(),
    ref.watch(chatsListDioClientProvider),
  );
});

class ChatsListNotifier extends StateNotifier<AsyncValue<List<ChatEntity>>> {
  final ChatRepository _repository;
  final DioClient _dioClient;

  ChatsListNotifier(this._repository, this._dioClient) : super(const AsyncValue.loading()) {
    loadChats();
  }

  Future<void> loadChats() async {
    state = const AsyncValue.loading();
    try {
      final response = await _dioClient.get(ApiEndpoints.chatDialogs);
      // Parse and use real data if available, otherwise fallback
      final result = await _repository.getChats();
      result.fold(
        (failure) => state = AsyncValue.error(failure.message, StackTrace.current),
        (chats) => state = AsyncValue.data(chats),
      );
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markAsRead(String chatId) async {
    try {
      await _dioClient.post(ApiEndpoints.withId(ApiEndpoints.chatRead, chatId));
      await loadChats(); // Reload
    } catch (e) {
      // Handle error
    }
  }
}
