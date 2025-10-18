import '../features/auth/presentation/providers/auth_provider_export.dart';
import '../../features/auth/presentation/providers/auth_state.dart' show Authenticated;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/comment.dart';
import '../models/video.dart';
import '../features/feed/presentation/providers/comments_provider.dart';
import '../features/auth/presentation/providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';

class CommentsDialog extends ConsumerStatefulWidget {
  final Video video;

  const CommentsDialog({
    super.key,
    required this.video,
  });

  @override
  ConsumerState<CommentsDialog> createState() => _CommentsDialogState();
}

class _CommentsDialogState extends ConsumerState<CommentsDialog> {
  final TextEditingController _commentController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(commentProvider.notifier).loadComments(widget.video.id.toString());
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final commentState = ref.watch(commentProvider);

    return Dialog(
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.blue,
                borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.comment, color: Colors.white),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Комментарии',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            
            // Comments list
            Expanded(
              child: switch (commentState) {
                CommentLoading() => const Center(child: CircularProgressIndicator()),
                CommentError(:final message) => _buildErrorState(message),
                CommentLoaded(:final comments) when comments.isEmpty => _buildEmptyState(),
                CommentLoaded(:final comments) => _buildCommentsList(comments.cast()),
                _ => const Center(child: CircularProgressIndicator()),
              },
            ),
            
            // Add comment section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(8)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: InputDecoration(
                        hintText: 'Добавить комментарий...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                      ),
                      maxLines: null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addComment,
                    icon: const Icon(Icons.send, color: Colors.blue),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.grey[600],
          ),
          const SizedBox(height: 16),
          Text(
            'Ошибка загрузки комментариев',
            style: AppTheme.headline3,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: AppTheme.body2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ref.read(commentProvider.notifier).loadComments(widget.video.id.toString());
            },
            child: const Text('Повторить'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.comment_outlined,
            size: 64,
            color: Colors.grey[600],
          ),
          SizedBox(height: 16),
          Text(
            'Пока нет комментариев',
            style: AppTheme.headline3,
          ),
          SizedBox(height: 8),
          Text(
            'Будьте первым, кто оставит комментарий!',
            style: AppTheme.body2,
          ),
        ],
      ),
    );
  }

  Widget _buildCommentsList(List<Comment> comments) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: comments.length,
      itemBuilder: (context, index) {
        final comment = comments[index];
        return _buildCommentCard(comment);
      },
    );
  }

  Widget _buildCommentCard(Comment comment) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundImage: comment.userAvatar != null
                      ? NetworkImage(comment.userAvatar!)
                      : null,
                  child: comment.userAvatar == null
                      ? const Icon(Icons.person, size: 16)
                      : null,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment.userName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        _formatDate(comment.createdAt),
                        style: AppTheme.caption,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {
                    ref.read(commentProvider.notifier).likeComment(comment.id);
                  },
                  icon: Icon(
                    comment.isLiked ? Icons.favorite : Icons.favorite_border,
                    color: comment.isLiked ? Colors.red : Colors.grey[600],
                    size: 20,
                  ),
                ),
                Text(
                  '${comment.likesCount}',
                  style: AppTheme.caption,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              comment.content,
              style: AppTheme.body2,
            ),
          ],
        ),
      ),
    );
  }

  void _addComment() {
    final content = _commentController.text.trim();
    if (content.isEmpty) return;

    final authState = ref.read(authProvider);
    // final videoNotifier = ref.read(videoProvider.notifier);
    // Мастера могут комментировать только свои видео
    if ((authState is Authenticated ? (authState as Authenticated).user : null)?.role == 'master' && widget.video.author.id != (authState is Authenticated ? (authState as Authenticated).user : null)?.id) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Мастера могут комментировать только свои видео'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    ref.read(commentProvider.notifier).addComment(int.tryParse(widget.video.id) ?? 0, content);
    _commentController.clear();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}д назад';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}ч назад';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}м назад';
    } else {
      return 'только что';
    }
  }
}
