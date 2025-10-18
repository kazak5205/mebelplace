import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/chat_entity.dart';

abstract class ChatRepository {
  Future<Either<Failure, List<ChatEntity>>> getChats();
  Future<Either<Failure, List<MessageEntity>>> getMessages(String chatId);
  Future<Either<Failure, MessageEntity>> sendMessage({
    required String chatId,
    String? text,
    String type = 'text',
    List<String> attachments = const [],
  });
  Future<Either<Failure, void>> markAsRead(String chatId);
}

