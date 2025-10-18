import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/repositories/comment_repository.dart';

// Repository provider
final commentRepositoryProvider = Provider<CommentRepository>((ref) {
  return getIt<CommentRepository>();
});

// Comment state
sealed class CommentState {}
class CommentInitial extends CommentState {}
class CommentLoading extends CommentState {}
class CommentLoaded extends CommentState {
  final List<CommentEntity> comments;
  CommentLoaded(this.comments);
}
class CommentPosting extends CommentState {}
class CommentPosted extends CommentState {}
class CommentError extends CommentState {
  final String message;
  CommentError(this.message);
}

// Comment Notifier - Riverpod 2.x
class CommentNotifier extends StateNotifier<CommentState> {
  final CommentRepository _repository;

  CommentNotifier(this._repository) : super(CommentInitial());

  Future<void> loadComments(int videoId) async {
    state = CommentLoading();
    
    final result = await _repository.getComments(videoId);
    
    result.fold(
      (failure) => state = CommentError(failure.message),
      (comments) => state = CommentLoaded(comments),
    );
  }

  Future<void> postComment(int videoId, String content) async {
    state = CommentPosting();
    
    final result = await _repository.postComment(videoId, content);
    
    result.fold(
      (failure) => state = CommentError(failure.message),
      (_) {
        state = CommentPosted();
        // Reload comments
        loadComments(videoId);
      },
    );
  }

  Future<void> addComment(int videoId, String content) async {
    await postComment(videoId, content);
  }

  Future<void> likeComment(int commentId) async {
    try {
      final result = await _repository.likeComment(commentId);
      result.fold(
        (failure) => state = CommentError(failure.message),
        (_) {
          // Reload comments to get updated like count
          if (state is CommentLoaded) {
            final currentState = state as CommentLoaded;
            loadComments(currentState.comments.first.videoId);
          }
        },
      );
    } catch (e) {
      state = CommentError('Failed to like comment: $e');
    }
  }
}

// Provider
final commentProvider = StateNotifierProvider<CommentNotifier, CommentState>((ref) {
  return CommentNotifier(ref.watch(commentRepositoryProvider));
});
