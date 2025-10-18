import '../models/chat_model.dart';

abstract class ChatLocalDataSource {
  Future<List<ChatModel>> getCachedChats();
  Future<void> cacheChats(List<ChatModel> chats);
  Future<List<MessageModel>> getCachedMessages(String chatId);
  Future<void> cacheMessage(MessageModel message);
  Future<void> markMessagesAsRead(String chatId);
}

/// Temporary no-op implementation - works online only
class ChatLocalDataSourceImpl implements ChatLocalDataSource {
  ChatLocalDataSourceImpl();

  @override
  Future<List<ChatModel>> getCachedChats() async {
    // No offline cache - return empty list
    return [];
  }

  @override
  Future<void> cacheChats(List<ChatModel> chats) async {
    // No-op: offline caching temporarily disabled
  }

  @override
  Future<List<MessageModel>> getCachedMessages(String chatId) async {
    // No offline cache - return empty list
    return [];
  }

  @override
  Future<void> cacheMessage(MessageModel message) async {
    // No-op: offline caching temporarily disabled
  }

  @override
  Future<void> markMessagesAsRead(String chatId) async {
    // No-op: offline caching temporarily disabled
  }
}
