import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/repositories/chat_repository.dart';

// Repository provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return getIt<ChatRepository>();
});

// Chat state
sealed class ChatState {}
class ChatInitial extends ChatState {}
class ChatSending extends ChatState {}
class ChatSent extends ChatState {}
class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}

// Chat Notifier
class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _repository;

  ChatNotifier(this._repository) : super(ChatInitial());

  Future<void> sendMessage(String chatId, String content, {String? type, List<String>? attachments}) async {
    state = ChatSending();
    
    try {
      final result = await _repository.sendMessage(
        chatId: chatId,
        text: content,
        type: type ?? 'text',
        attachments: attachments ?? [],
      );
      
      result.fold(
        (failure) => state = ChatError(failure.message),
        (_) {
          state = ChatSent();
          
          // Reset after send
          Future.delayed(const Duration(milliseconds: 100), () {
            if (state is ChatSent) {
              state = ChatInitial();
            }
          });
        },
      );
    } catch (e) {
      state = ChatError('Failed to send message: $e');
    }
  }

  void clearError() {
    if (state is ChatError) {
      state = ChatInitial();
    }
  }
}

// Provider
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref.watch(chatRepositoryProvider));
});
