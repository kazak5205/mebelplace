import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/video_model.dart';
import '../../data/models/comment_model.dart';
import '../providers/video_provider.dart';
import '../providers/repository_providers.dart';
import '../providers/app_providers.dart' hide videoProvider;
import '../widgets/tiktok_video_player.dart';
import '../widgets/loading_widget.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Load videos when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(videoProvider.notifier).loadVideos();
    });
  }

  @override
  Widget build(BuildContext context) {
    final videoState = ref.watch(videoProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: videoState.isLoading
          ? const LoadingWidget()
          : videoState.error != null
              ? _buildErrorState(videoState.error!)
              : videoState.videos.isEmpty
                  ? _buildEmptyState()
                  : TikTokVideoPlayer(
                      videos: videoState.videos,
                      onVideoChanged: (video) {
                        // Record view
                        ref.read(videoProvider.notifier).recordView(video.id);
                      },
                      onLike: (video) {
                        ref.read(videoProvider.notifier).likeVideo(video.id);
                      },
                      onShare: (video) {
                        _showShareDialog(video);
                      },
                      onComment: (video) {
                        _showCommentsDialog(video);
                      },
                    ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.video_library_outlined,
            size: 80.sp,
            color: Colors.white.withValues(alpha: 0.5),
          ),
          SizedBox(height: 24.h),
          Text(
            'Пока нет видео',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Загрузите первое видео!',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80.sp,
            color: Colors.red.withValues(alpha: 0.7),
          ),
          SizedBox(height: 24.h),
          Text(
            'Ошибка загрузки',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            error,
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withValues(alpha: 0.5),
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24.h),
          ElevatedButton(
            onPressed: () {
              ref.read(videoProvider.notifier).loadVideos();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Попробовать снова'),
          ),
        ],
      ),
    );
  }

  void _showShareDialog(VideoModel video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Поделиться видео',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 24.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildShareOption(
                  icon: Icons.copy,
                  label: 'Копировать ссылку',
                  onTap: () {
                    // Copy link to clipboard
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Ссылка скопирована')),
                    );
                  },
                ),
                _buildShareOption(
                  icon: Icons.share,
                  label: 'Поделиться',
                  onTap: () {
                    // Share via system share
                    Navigator.pop(context);
                  },
                ),
                _buildShareOption(
                  icon: Icons.download,
                  label: 'Скачать',
                  onTap: () {
                    // Download video
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }

  Widget _buildShareOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60.w,
            height: 60.w,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(30.r),
            ),
            child: Icon(
              icon,
              color: AppColors.primary,
              size: 30.sp,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            label,
            style: TextStyle(
              fontSize: 12.sp,
              color: Colors.white.withValues(alpha: 0.8),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showCommentsDialog(VideoModel video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => CommentsBottomSheet(video: video),
    );
  }
}

// Отдельный виджет для комментариев с использованием Consumer
class CommentsBottomSheet extends ConsumerWidget {
  final VideoModel video;

  const CommentsBottomSheet({super.key, required this.video});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final commentState = ref.watch(commentProvider(video.id));

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      padding: EdgeInsets.all(24.w),
      child: Column(
        children: [
          Text(
            'Комментарии',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 24.h),
          Expanded(
            child: commentState.isLoading
                ? const Center(child: LoadingWidget())
                : commentState.error != null
                    ? Center(
                        child: Text(
                          commentState.error!,
                          style: TextStyle(
                            color: Colors.red,
                            fontSize: 14.sp,
                          ),
                        ),
                      )
                    : commentState.comments.isEmpty
                        ? Center(
                            child: Text(
                              'Нет комментариев',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 14.sp,
                              ),
                            ),
                          )
                        : ListView.builder(
                            itemCount: commentState.comments.length,
                            itemBuilder: (context, index) {
                              final comment = commentState.comments[index];
                              return Container(
                                margin: EdgeInsets.only(bottom: 16.h),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    CircleAvatar(
                                      radius: 16.r,
                                      backgroundColor: AppColors.primary,
                                      backgroundImage: comment.avatar != null
                                          ? NetworkImage(comment.avatar!)
                                          : null,
                                      child: comment.avatar == null
                                          ? Icon(
                                              Icons.person,
                                              size: 16.sp,
                                              color: Colors.white,
                                            )
                                          : null,
                                    ),
                                    SizedBox(width: 12.w),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            comment.username ?? 'Пользователь',
                                            style: TextStyle(
                                              fontSize: 14.sp,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.white,
                                            ),
                                          ),
                                          SizedBox(height: 4.h),
                                          Text(
                                            comment.content,
                                            style: TextStyle(
                                              fontSize: 14.sp,
                                              color: Colors.white.withValues(alpha: 0.8),
                                            ),
                                          ),
                                          SizedBox(height: 4.h),
                                          Text(
                                            _formatCommentTime(comment.createdAt),
                                            style: TextStyle(
                                              fontSize: 12.sp,
                                              color: Colors.white.withValues(alpha: 0.5),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Icon(
                                      Icons.favorite_border,
                                      color: Colors.white.withValues(alpha: 0.5),
                                      size: 16.sp,
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Добавить комментарий...',
                      hintStyle: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                Icon(
                  Icons.send,
                  color: AppColors.primary,
                  size: 20.sp,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatCommentTime(DateTime? time) {
    if (time == null) return '';
    
    final now = DateTime.now();
    final difference = now.difference(time);
    
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
