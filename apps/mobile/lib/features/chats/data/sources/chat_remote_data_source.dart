import '../../../../core/network/dio_client.dart';
import '../../../../core/services/upload_service.dart';
import '../../../../core/di/injection.dart';
import '../models/chat_model.dart';
import '../../../../core/constants/api_endpoints.dart';

abstract class ChatRemoteDataSource {
  Future<List<ChatModel>> getChats();
  Future<List<MessageModel>> getMessages(String chatId, {int limit = 50, int offset = 0});
  Future<MessageModel> sendMessage({
    required String chatId,
    String? text,
    String type = 'text',
    List<String> attachments = const [],
  });
  Future<void> markAsRead(String chatId);
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final DioClient dioClient;

  ChatRemoteDataSourceImpl(this.dioClient);

  @override
  Future<List<ChatModel>> getChats() async {
    final response = await dioClient.get(ApiEndpoints.chatDialogs);
    
    if (response.data is Map && response.data.containsKey('dialogs')) {
      return (response.data['dialogs'] as List)
          .map((json) => ChatModel.fromJson(json))
          .toList();
    } else if (response.data is List) {
      return (response.data as List)
          .map((json) => ChatModel.fromJson(json))
          .toList();
    }
    
    return [];
  }

  @override
  Future<List<MessageModel>> getMessages(
    String chatId, {
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await dioClient.get(
      ApiEndpoints.chatMessages,
      queryParameters: {
        'chat_id': chatId,
        'limit': limit,
        'offset': offset,
      },
    );

    if (response.data is Map && response.data.containsKey('messages')) {
      return (response.data['messages'] as List)
          .map((json) => MessageModel.fromJson(json))
          .toList();
    } else if (response.data is List) {
      return (response.data as List)
          .map((json) => MessageModel.fromJson(json))
          .toList();
    }

    return [];
  }

  @override
  Future<MessageModel> sendMessage({
    required String chatId,
    String? text,
    String type = 'text',
    List<String> attachments = const [],
  }) async {
    // Upload attachments if they are local files
    List<String> uploadedUrls = [];
    
    if (attachments.isNotEmpty) {
      final uploadService = getIt<UploadService>();
      
      for (final attachment in attachments) {
        if (!attachment.startsWith('http')) {
          // Local file - upload it
          final url = await uploadService.uploadFile(attachment);
          uploadedUrls.add(url);
        } else {
          // Already a URL
          uploadedUrls.add(attachment);
        }
      }
    }

    final response = await dioClient.post(
      ApiEndpoints.chatSend,
      data: {
        'chat_id': chatId,
        if (text != null) 'text': text,
        'type': type,
        'attachments': uploadedUrls,
      },
    );

    return MessageModel.fromJson(response.data);
  }

  @override
  Future<void> markAsRead(String chatId) async {
    await dioClient.post(
      ApiEndpoints.withId(ApiEndpoints.chatRead, chatId),
    );
  }
}

