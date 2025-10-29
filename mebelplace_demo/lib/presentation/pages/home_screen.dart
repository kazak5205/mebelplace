import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/image_helper.dart';
import '../../data/models/video_model.dart';
import '../../data/models/comment_model.dart';
import '../providers/video_provider.dart';
import '../providers/app_providers.dart' as providers;
import '../widgets/tiktok_video_player.dart';
import '../widgets/loading_widget.dart';
import '../../main.dart'; // Для routeObserver

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with AutomaticKeepAliveClientMixin, WidgetsBindingObserver, RouteAware {
  final GlobalKey<TikTokVideoPlayerState> _videoPlayerKey = GlobalKey<TikTokVideoPlayerState>();
  bool _isVisible = true;

  @override
  bool get wantKeepAlive => true; // Сохраняем состояние при переключении табов

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Load videos when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(videoProvider.notifier).loadVideos();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Подписываемся на изменения route
    final modalRoute = ModalRoute.of(context);
    if (modalRoute is PageRoute) {
      routeObserver.subscribe(this, modalRoute);
    }
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // RouteAware callbacks - отслеживают когда экран виден/невиден из-за других routes
  @override
  void didPush() {
    // Экран стал виден (первый раз или возврат из поверхностного route)
    _resumeIfNeeded();
  }

  @override
  void didPopNext() {
    // Вернулись на этот экран (убрали route который был поверх)
    _resumeIfNeeded();
  }

  @override
  void didPushNext() {
    // Новый route открылся поверх этого экрана
    _pauseVideo();
  }

  @override
  void didPop() {
    // Этот экран удаляется
    _pauseVideo();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Управление видео и звуком при переключении приложения
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _pauseVideo();
    } else if (state == AppLifecycleState.resumed) {
      _resumeIfNeeded();
    }
  }

  // Lifecycle методы для IndexedStack
  @override
  void deactivate() {
    // Останавливаем видео когда экран становится невидимым в IndexedStack
    _isVisible = false;
    _pauseVideo();
    super.deactivate();
  }

  @override
  void activate() {
    // Возобновляем видео когда экран снова становится видимым в IndexedStack
    super.activate();
    _isVisible = true;
    _resumeIfNeeded();
  }

  void _pauseVideo() {
    _videoPlayerKey.currentState?.pauseVideo();
  }

  void _resumeIfNeeded() {
    // Возобновляем только если экран действительно виден
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _isVisible) {
        final route = ModalRoute.of(context);
        if (route?.isCurrent == true) {
          _videoPlayerKey.currentState?.resumeVideo();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Обязательно для AutomaticKeepAliveClientMixin
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
                      key: _videoPlayerKey,
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
                      onOrder: (video) {
                        _showOrderDialog(video);
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
    // Проверяем, является ли это ошибкой 500 (нет видео на сервере)
    final isNoVideos = error.contains('500') || error.contains('Server error') || error.contains('Failed to load videos');
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isNoVideos ? Icons.video_library_outlined : Icons.error_outline,
            size: 80.sp,
            color: isNoVideos 
                ? Colors.white.withValues(alpha: 0.5) 
                : Colors.red.withValues(alpha: 0.7),
          ),
          SizedBox(height: 24.h),
          Text(
            isNoVideos ? 'Пока нет видео' : 'Ошибка загрузки',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          SizedBox(height: 8.h),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 40.w),
            child: Text(
              isNoVideos 
                  ? 'Станьте первым, кто загрузит мебельное видео!' 
                  : error,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withValues(alpha: 0.6),
              ),
            ),
          ),
          SizedBox(height: 32.h),
          ElevatedButton(
            onPressed: () {
              ref.read(videoProvider.notifier).loadVideos();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 32.w, vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'Попробовать снова',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
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
                  onTap: () async {
                    final link = 'https://mebelplace.com.kz/video/${video.id}';
                    await Clipboard.setData(ClipboardData(text: link));
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Ссылка скопирована'),
                        backgroundColor: Colors.green,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                      ),
                    );
                  },
                ),
                _buildShareOption(
                  icon: Icons.share,
                  label: 'Поделиться',
                  onTap: () async {
                    Navigator.pop(context);
                    final link = 'https://mebelplace.com.kz/video/${video.id}';
                    await Share.share(
                      'Смотри это видео на MebelPlace: ${video.title}\n$link',
                      subject: video.title,
                    );
                  },
                ),
                _buildShareOption(
                  icon: Icons.download,
                  label: 'Скачать',
                  onTap: () {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Функция скачивания будет доступна в следующей версии'),
                        backgroundColor: AppColors.primary,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                      ),
                    );
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

  void _showOrderDialog(VideoModel video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkSurface,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2.r),
              ),
            ),
            SizedBox(height: 24.h),
            
            // Аватар мастера
            Container(
              width: 80.w,
              height: 80.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.secondary],
                ),
              ),
              padding: EdgeInsets.all(3.w),
              child: ClipOval(
                child: ImageHelper.hasValidImagePath(video.avatar)
                    ? CachedNetworkImage(
                        imageUrl: ImageHelper.getFullImageUrl(video.avatar),
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: AppColors.darkSurface,
                        child: Icon(
                          Icons.person,
                          size: 40.sp,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
            
            SizedBox(height: 16.h),
            
            Text(
              'Заказать у @${video.authorDisplayName}',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            
            SizedBox(height: 8.h),
            
            Text(
              video.title,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.white.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            SizedBox(height: 32.h),
            
            // Кнопка создать заказ
            SizedBox(
              width: double.infinity,
              height: 56.h,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/create-order');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                ),
                child: Ink(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.secondary],
                    ),
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                  child: Container(
                    alignment: Alignment.center,
                    child: Text(
                      'Создать заказ',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 12.h),
            
            // Кнопка профиль мастера
            SizedBox(
              width: double.infinity,
              height: 56.h,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(
                    context,
                    '/master-profile',
                    arguments: video.authorId,
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: Colors.white.withOpacity(0.3),
                    width: 1.5,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                ),
                child: Text(
                  'Перейти в профиль',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }
}

// Отдельный виджет для комментариев с использованием Consumer
class CommentsBottomSheet extends ConsumerStatefulWidget {
  final VideoModel video;

  const CommentsBottomSheet({super.key, required this.video});

  @override
  ConsumerState<CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends ConsumerState<CommentsBottomSheet> {
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Load comments when sheet opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(providers.commentProvider(widget.video.id).notifier).loadComments();
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final commentState = ref.watch(providers.commentProvider(widget.video.id));

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
                                      backgroundImage: ImageHelper.hasValidImagePath(comment.avatar)
                                          ? CachedNetworkImageProvider(
                                              ImageHelper.getFullImageUrl(comment.avatar),
                                            )
                                          : null,
                                      child: !ImageHelper.hasValidImagePath(comment.avatar)
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
                    controller: _commentController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Добавить комментарий...',
                      hintStyle: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _sendComment(),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.send,
                    color: AppColors.primary,
                    size: 20.sp,
                  ),
                  onPressed: _sendComment,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendComment() async {
    final content = _commentController.text.trim();
    if (content.isEmpty) return;

    try {
      await ref.read(providers.commentProvider(widget.video.id).notifier).addComment(content);
      _commentController.clear();
      FocusScope.of(context).unfocus();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Ошибка отправки комментария: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
