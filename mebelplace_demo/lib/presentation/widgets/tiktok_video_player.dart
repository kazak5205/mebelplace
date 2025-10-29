import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/image_helper.dart';
import '../../data/models/video_model.dart';
import '../providers/app_providers.dart';
import '../../utils/haptic_helper.dart';

class TikTokVideoPlayer extends ConsumerStatefulWidget {
  final List<VideoModel> videos;
  final int initialIndex;
  final Function(VideoModel video)? onVideoChanged;
  final Function(VideoModel video)? onLike;
  final Function(VideoModel video)? onShare;
  final Function(VideoModel video)? onComment;
  final Function(VideoModel video)? onOrder;

  const TikTokVideoPlayer({
    super.key,
    required this.videos,
    this.initialIndex = 0,
    this.onVideoChanged,
    this.onLike,
    this.onShare,
    this.onComment,
    this.onOrder,
  });

  @override
  ConsumerState<TikTokVideoPlayer> createState() => _TikTokVideoPlayerState();
}

class _TikTokVideoPlayerState extends ConsumerState<TikTokVideoPlayer>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  late PageController _pageController;
  VideoPlayerController? _videoController;
  VideoPlayerController? _preloadController; // Предзагрузка следующего видео
  int _currentIndex = 0;
  bool _isPlaying = true;
  bool _isMuted = false;
  bool _showControls = false;
  late AnimationController _heartAnimationController;
  late AnimationController _controlsAnimationController;
  late AnimationController _orderButtonAnimationController;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    
    _heartAnimationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _controlsAnimationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _orderButtonAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    
    _initializeVideo();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Пауза видео когда приложение в фоне
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _videoController?.pause();
    } else if (state == AppLifecycleState.resumed && _isPlaying) {
      _videoController?.play();
    }
  }

  void _initializeVideo() {
    if (widget.videos.isNotEmpty && widget.videos.length > _currentIndex) {
      _videoController?.dispose();
      
      // Создаем новый контроллер
      _videoController = VideoPlayerController.networkUrl(
        Uri.parse(widget.videos[_currentIndex].videoUrl),
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: false, // Не миксовать с другими видео
          allowBackgroundPlayback: false,
        ),
      );
      
      // Инициализация с оптимизацией
      _videoController!.initialize().then((_) {
        if (mounted) {
          setState(() {});
          if (_isPlaying) {
            _videoController!.play();
          }
          _videoController!.setVolume(_isMuted ? 0 : 1);
          _videoController!.setLooping(true);
          
          // Предзагружаем следующее видео
          _preloadNextVideo();
        }
      }).catchError((error) {
        // ❌ Video init error: $error');
      });
    }
  }
  
  void _preloadNextVideo() {
    final nextIndex = _currentIndex + 1;
    if (nextIndex < widget.videos.length) {
      _preloadController?.dispose();
      _preloadController = VideoPlayerController.networkUrl(
        Uri.parse(widget.videos[nextIndex].videoUrl),
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: false,
          allowBackgroundPlayback: false,
        ),
      );
      // Только инициализация, не воспроизведение
      _preloadController!.initialize().catchError((error) {
        // ❌ Preload error: $error');
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _videoController?.dispose();
    _preloadController?.dispose(); // Очищаем предзагруженный контроллер
    _pageController.dispose();
    _heartAnimationController.dispose();
    _controlsAnimationController.dispose();
    _orderButtonAnimationController.dispose();
    super.dispose();
  }
  
  // Метод для паузы видео извне (когда уходим со страницы)
  void pauseVideo() {
    _videoController?.pause();
    _isPlaying = false;
  }
  
  // Метод для возобновления видео
  void resumeVideo() {
    if (_isPlaying) {
      _videoController?.play();
    }
  }

  void _onPageChanged(int index) {
    if (index != _currentIndex && index < widget.videos.length) {
      final oldController = _videoController;
      
      setState(() {
        _currentIndex = index;
        
        // Если следующее видео уже предзагружено, используем его
        if (_preloadController != null && index == _currentIndex) {
          _videoController = _preloadController;
          _preloadController = null;
          
          // Сразу воспроизводим
          if (_isPlaying && _videoController!.value.isInitialized) {
            _videoController!.play();
            _videoController!.setVolume(_isMuted ? 0 : 1);
            _videoController!.setLooping(true);
          }
          
          // Предзагружаем следующее
          _preloadNextVideo();
        } else {
          // Если не предзагружено, инициализируем обычным способом
          _initializeVideo();
        }
      });
      
      // Удаляем старый контроллер асинхронно
      Future.delayed(const Duration(milliseconds: 500), () {
        oldController?.dispose();
      });
      
      widget.onVideoChanged?.call(widget.videos[_currentIndex]);
    }
  }

  void _togglePlayPause() {
    HapticHelper.lightImpact(); // ✨ Вибрация
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _videoController?.play();
      } else {
        _videoController?.pause();
      }
    });
  }

  void _toggleMute() {
    HapticHelper.lightImpact(); // ✨ Вибрация
    setState(() {
      _isMuted = !_isMuted;
      _videoController?.setVolume(_isMuted ? 0 : 1);
    });
  }

  void _onLike() {
    HapticHelper.like(); // ✨ Вибрация при лайке
    _heartAnimationController.forward().then((_) {
      _heartAnimationController.reverse();
    });
    widget.onLike?.call(widget.videos[_currentIndex]);
  }

  void _onDoubleTap() {
    HapticHelper.mediumImpact(); // ✨ Вибрация при double tap
    _onLike();
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
    if (_showControls) {
      _controlsAnimationController.forward();
      
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          _controlsAnimationController.reverse().then((_) {
            if (mounted) {
              setState(() {
                _showControls = false;
              });
            }
          });
        }
      });
    } else {
      _controlsAnimationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.videos.isEmpty) {
      return const Center(
        child: Text(
          'Нет видео для воспроизведения',
          style: TextStyle(color: Colors.white),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Video PageView
          PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            onPageChanged: _onPageChanged,
            itemCount: widget.videos.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: _toggleControls,
                onDoubleTap: _onDoubleTap,
                child: _buildVideoItem(widget.videos[index]),
              );
            },
          ),
          
          // Overlay elements
          if (_showControls) _buildControls(),
          _buildRightActions(),
          _buildBottomInfo(),
          _buildOrderButton(), // Новая кнопка заказа
        ],
      ),
    );
  }

  Widget _buildVideoItem(VideoModel video) {
    return SizedBox(
      width: double.infinity,
      height: double.infinity,
      child: _videoController?.value.isInitialized == true
          ? FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _videoController!.value.size.width,
                height: _videoController!.value.size.height,
                child: VideoPlayer(_videoController!),
              ),
            )
          : Stack(
              children: [
                // Thumbnail placeholder
                if (ImageHelper.hasValidImagePath(video.thumbnailUrl))
                  Positioned.fill(
                    child: CachedNetworkImage(
                      imageUrl: ImageHelper.getFullImageUrl(video.thumbnailUrl),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.black87,
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.black87,
                      ),
                    ),
                  ),
                // Loading indicator
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(
                        color: AppColors.primary,
                        strokeWidth: 3,
                      ),
                      SizedBox(height: 16.h),
                      Text(
                        'Загрузка видео...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14.sp,
                          shadows: const [
                            Shadow(
                              color: Colors.black,
                              blurRadius: 10,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildControls() {
    return AnimatedBuilder(
      animation: _controlsAnimationController,
      builder: (context, child) {
        return Opacity(
          opacity: _controlsAnimationController.value,
          child: Center(
            child: GestureDetector(
              onTap: _togglePlayPause,
              child: Container(
                width: 80.w,
                height: 80.w,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 48.sp,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildRightActions() {
    final video = widget.videos[_currentIndex];
    
    return Positioned(
      right: 12.w,
      bottom: 140.h,
      child: Column(
        children: [
          // Avatar (круглый, как в TikTok)
          _buildActionButton(
            onTap: () {
              HapticHelper.lightImpact(); // ✨ Вибрация
              Navigator.pushNamed(
                context,
                '/master-profile',
                arguments: video.authorId,
              );
            },
            child: Hero(
              tag: 'master_avatar_${video.authorId}', // ✨ Hero animation
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 52.w,
                    height: 52.w,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.secondary],
                      ),
                    ),
                  ),
                  Container(
                    width: 48.w,
                    height: 48.w,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black,
                    ),
                    child: ClipOval(
                      child: ImageHelper.hasValidImagePath(video.avatar)
                          ? CachedNetworkImage(
                              imageUrl: ImageHelper.getFullImageUrl(video.avatar),
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Icon(
                                Icons.person_rounded,
                                color: Colors.white,
                                size: 24.sp,
                              ),
                              errorWidget: (context, url, error) => Icon(
                                Icons.person_rounded,
                                color: Colors.white,
                                size: 24.sp,
                              ),
                            )
                          : Icon(
                              Icons.person_rounded,
                              color: Colors.white,
                              size: 24.sp,
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Like button
          _buildActionButton(
            onTap: _onLike,
            child: Column(
              children: [
                AnimatedBuilder(
                  animation: _heartAnimationController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1.0 + (_heartAnimationController.value * 0.4),
                      child: Icon(
                        video.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        color: video.isLiked ? Colors.red : Colors.white,
                        size: 32.sp,
                        shadows: const [
                          Shadow(
                            color: Colors.black,
                            offset: Offset(0, 2),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    );
                  },
                ),
                SizedBox(height: 4.h),
                Text(
                  video.formattedLikes,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    shadows: const [
                      Shadow(
                        color: Colors.black,
                        offset: Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Comment button
          _buildActionButton(
            onTap: () => widget.onComment?.call(video),
            child: Column(
              children: [
                Icon(
                  Icons.chat_bubble_outline_rounded,
                  color: Colors.white,
                  size: 30.sp,
                  shadows: const [
                    Shadow(
                      color: Colors.black,
                      offset: Offset(0, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
                SizedBox(height: 4.h),
                Text(
                  video.formattedComments,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    shadows: const [
                      Shadow(
                        color: Colors.black,
                        offset: Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Share button
          _buildActionButton(
            onTap: () => widget.onShare?.call(video),
            child: Icon(
              Icons.share_outlined,
              color: Colors.white,
              size: 28.sp,
              shadows: const [
                Shadow(
                  color: Colors.black,
                  offset: Offset(0, 2),
                  blurRadius: 4,
                ),
              ],
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Mute button
          _buildActionButton(
            onTap: _toggleMute,
            child: Icon(
              _isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
              color: Colors.white,
              size: 28.sp,
              shadows: const [
                Shadow(
                  color: Colors.black,
                  offset: Offset(0, 2),
                  blurRadius: 4,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required Widget child,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(8.w),
        child: child,
      ),
    );
  }

  Widget _buildBottomInfo() {
    final video = widget.videos[_currentIndex];
    
    return Positioned(
      left: 12.w,
      right: 80.w,
      bottom: 24.h,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author info
          Row(
            children: [
              Text(
                '@${video.authorDisplayName}',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                  shadows: const [
                    Shadow(
                      color: Colors.black,
                      offset: Offset(0, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
              ),
              SizedBox(width: 8.w),
              Text(
                video.timeAgo,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 13.sp,
                  shadows: const [
                    Shadow(
                      color: Colors.black,
                      offset: Offset(0, 1),
                      blurRadius: 3,
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          SizedBox(height: 8.h),
          
          // Title
          Text(
            video.title,
            style: TextStyle(
              color: Colors.white,
              fontSize: 15.sp,
              fontWeight: FontWeight.w600,
              shadows: const [
                Shadow(
                  color: Colors.black,
                  offset: Offset(0, 2),
                  blurRadius: 4,
                ),
              ],
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          
          // Description
          if (video.description != null && video.description!.isNotEmpty) ...[
            SizedBox(height: 6.h),
            Text(
              video.description!,
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 14.sp,
                shadows: const [
                  Shadow(
                    color: Colors.black,
                    offset: Offset(0, 1),
                    blurRadius: 3,
                  ),
                ],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          
          // Tags
          if (video.tags.isNotEmpty) ...[
            SizedBox(height: 8.h),
            Wrap(
              spacing: 6.w,
              runSpacing: 4.h,
              children: video.tags.take(3).map((tag) {
                return Text(
                  '#$tag',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    shadows: const [
                      Shadow(
                        color: Colors.black,
                        offset: Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderButton() {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    
    // Показываем кнопку только авторизованным клиентам
    if (user == null || user.role != 'user') {
      return const SizedBox.shrink();
    }
    
    return Positioned(
      left: 12.w,
      right: 12.w,
      top: 60.h,
      child: AnimatedBuilder(
        animation: _orderButtonAnimationController,
        builder: (context, child) {
          return Transform.scale(
            scale: 1.0 + (_orderButtonAnimationController.value * 0.05),
            child: GestureDetector(
              onTap: () {
                final video = widget.videos[_currentIndex];
                widget.onOrder?.call(video);
              },
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 20.w,
                  vertical: 12.h,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                  ),
                  borderRadius: BorderRadius.circular(30.r),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.shopping_bag_outlined,
                      color: Colors.white,
                      size: 20.sp,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      'Заказать мебель',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
