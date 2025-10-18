import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/feed/presentation/providers/comments_provider.dart';
import '../../features/feed/domain/entities/comment_entity.dart';

class GlassCommentsScreen extends ConsumerStatefulWidget {
  final String videoId;

  const GlassCommentsScreen({super.key, required this.videoId});

  @override
  ConsumerState<GlassCommentsScreen> createState() => _GlassCommentsScreenState();
}

class _GlassCommentsScreenState extends ConsumerState<GlassCommentsScreen> {
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(commentProvider.notifier).loadComments(int.parse(widget.videoId)));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final commentState = ref.watch(commentProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Комментарии', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          Expanded(
            child: switch (commentState) {
              CommentLoading() => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
              CommentError(:final message) => Center(child: Text('Ошибка: $message', style: const TextStyle(color: Colors.red))),
              CommentLoaded(:final comments) => comments.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.comment_outlined, size: 80, color: LiquidGlassColors.primaryOrange),
                          const SizedBox(height: 16),
                          Text('Нет комментариев', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                          const SizedBox(height: 8),
                          Text('Будьте первым!', style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: comments.length,
                      itemBuilder: (context, index) {
                        final comment = comments[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: GlassPanel(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: LiquidGlassColors.primaryOrange,
                                      child: Text(comment.author.username[0], style: const TextStyle(color: Colors.white, fontSize: 14)),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(comment.author.username, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w600)),
                                    const Spacer(),
                                    Text(
                                      _formatTime(comment.createdAt),
                                      style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white54 : Colors.black54),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(comment.text, style: LiquidGlassTextStyles.bodySmall.copyWith(color: isDark ? Colors.white : Colors.black)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
              _ => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
            },
          ),
          GlassPanel(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: GlassTextField(
                    hint: 'Добавить комментарий...',
                    controller: _commentController,
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  icon: const Icon(Icons.send_outlined, color: LiquidGlassColors.primaryOrange),
                  onPressed: () async {
                    if (_commentController.text.trim().isEmpty) return;
                    
                    await ref.read(commentProvider.notifier).postComment(
                      int.parse(widget.videoId),
                      _commentController.text.trim(),
                    );
                    
                    _commentController.clear();
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inDays > 0) return '${diff.inDays}д назад';
    if (diff.inHours > 0) return '${diff.inHours}ч назад';
    if (diff.inMinutes > 0) return '${diff.inMinutes}м назад';
    return 'только что';
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }
}
