import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/error/exceptions.dart';
import '../../domain/entities/chat_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../sources/chat_remote_data_source.dart';
import '../sources/chat_local_data_source.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource remoteDataSource;
  final ChatLocalDataSource localDataSource;

  ChatRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<ChatEntity>>> getChats() async {
    try {
      final models = await remoteDataSource.getChats();
      await localDataSource.cacheChats(models);
      return Right(models.map((m) => m.toEntity()).toList());
    } on NetworkException catch (e) {
      try {
        final cached = await localDataSource.getCachedChats();
        return Right(cached.map((m) => m.toEntity()).toList());
      } catch (_) {
        return Left(NetworkFailure(e.message));
      }
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<MessageEntity>>> getMessages(String chatId) async {
    try {
      final models = await remoteDataSource.getMessages(chatId);
      for (final msg in models) {
        await localDataSource.cacheMessage(msg);
      }
      return Right(models.map((m) => m.toEntity()).toList());
    } on NetworkException catch (e) {
      try {
        final cached = await localDataSource.getCachedMessages(chatId);
        return Right(cached.map((m) => m.toEntity()).toList());
      } catch (_) {
        return Left(NetworkFailure(e.message));
      }
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, MessageEntity>> sendMessage({
    required String chatId,
    String? text,
    String type = 'text',
    List<String> attachments = const [],
  }) async {
    try {
      final model = await remoteDataSource.sendMessage(
        chatId: chatId,
        text: text,
        type: type,
        attachments: attachments,
      );
      
      await localDataSource.cacheMessage(model);
      return Right(model.toEntity());
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> markAsRead(String chatId) async {
    try {
      await remoteDataSource.markAsRead(chatId);
      await localDataSource.markMessagesAsRead(chatId);
      return const Right(null);
    } catch (e) {
      return Left(UnknownFailure(e.toString()));
    }
  }
}

