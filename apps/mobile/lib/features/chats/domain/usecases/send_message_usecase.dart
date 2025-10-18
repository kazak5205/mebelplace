import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/chat_entity.dart';
import '../repositories/chat_repository.dart';

class SendMessageUseCase {
  final ChatRepository repository;

  SendMessageUseCase(this.repository);

  Future<Either<Failure, MessageEntity>> call({
    required String chatId,
    String? text,
    String type = 'text',
    List<String> attachments = const [],
  }) {
    return repository.sendMessage(
      chatId: chatId,
      text: text,
      type: type,
      attachments: attachments,
    );
  }
}

