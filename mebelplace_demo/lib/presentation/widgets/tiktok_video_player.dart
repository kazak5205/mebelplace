import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/utils/image_helper.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/video_model.dart';
import '../providers/app_providers.dart' as providers;
import '../../utils/haptic_helper.dart';

/// Современный TikTok/YouTube Shorts стиль видео лента
/// 
/// Особенности:
/// - Предзагрузка видео (на один вперед и один назад)
/// - Blurred превью вместо черных экранов
/// - Fade transition при свайпе
/// - Звук выключен по дефолту, включается тапом
/// - Современный UI с градиентами и анимациями
class TikTokVideoPlayer extends ConsumerStatefulWidget {
  final List<VideoModel> videos;
  final int initialIndex;
  final bool mutedByDefault; // ✅ Параметр для управления звуком
  final Function(VideoModel)? onVideoChanged;
  final Function(VideoModel)? onLike;
  final Function(VideoModel)? onShare;
  final Function(VideoModel)? onComment;
  final Function(VideoModel)? onOrder;

  const TikTokVideoPlayer({
    super.key,
    required this.videos,
    this.initialIndex = 0,
    this.mutedByDefault = true, // По умолчанию выключен (для ленты)
    this.onVideoChanged,
    this.onLike,
    this.onShare,
    this.onComment,
    this.onOrder,
  });

  @override
  ConsumerState<TikTokVideoPlayer> createState() => TikTokVideoPlayerState();
}

class TikTokVideoPlayerState extends ConsumerState<TikTokVideoPlayer>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  late PageController _pageController;
  
  // Контроллеры для предзагрузки (текущий, предыдущий, следующий)
  VideoPlayerController? _currentController;
  VideoPlayerController? _previousController;
  VideoPlayerController? _nextController;
  
  int _currentIndex = 0;
  bool _isPlaying = true;
  bool _isMuted = true; // Инициализируется из widget.mutedByDefault
  bool _isBuffering = false;
  bool _isDescriptionExpanded = false;
  
  // Анимации
  late AnimationController _heartAnimationController;
  late AnimationController _fadeAnimationController;
  late AnimationController _scaleAnimationController;
  
  // ✅ Убрали _lastSwipeTime - больше не ограничиваем задержку между свайпами
  
  // Map для кеширования контроллеров
  final Map<int, VideoPlayerController> _controllerCache = {};
  
  // Отслеживаем последнее видео, для которого вызвали onVideoChanged (чтобы избежать двойных вызовов)
  String? _lastNotifiedVideoId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    
    // Инициализируем звук из параметра виджета
    _isMuted = widget.mutedByDefault;
    
    // Анимации
    _heartAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200), // ✅ Быстрее для отсутствия лагов
      reverseDuration: const Duration(milliseconds: 200),
    );
    _scaleAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    // Инициализация видео - минимальная задержка для mounted
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeVideos();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _disposeAllControllers();
    _pageController.dispose();
    _heartAnimationController.dispose();
    _fadeAnimationController.dispose();
    _scaleAnimationController.dispose();
    super.dispose();
  }

  void _disposeAllControllers() {
    _currentController?.removeListener(_videoListener);
    _currentController?.dispose();
    _previousController?.removeListener(_videoListener);
    _previousController?.dispose();
    _nextController?.removeListener(_videoListener);
    _nextController?.dispose();
    for (var controller in _controllerCache.values) {
      controller.removeListener(_videoListener);
      controller.dispose();
    }
    _controllerCache.clear();
  }

  void _videoListener() {
    if (_currentController != null && _currentController!.value.isInitialized) {
      final isPlaying = _currentController!.value.isPlaying;
      if (mounted && _isPlaying != isPlaying) {
        setState(() {
          _isPlaying = isPlaying;
          _isBuffering = _currentController!.value.isBuffering;
        });
        
        // Если видео должно играть, но не играет - запускаем
        if (!isPlaying && !_currentController!.value.isBuffering && _currentController!.value.isInitialized) {
          // Пробуем запустить еще раз
          Future.delayed(const Duration(milliseconds: 100), () {
            if (mounted && _currentController != null && 
                _currentController!.value.isInitialized && 
                !_currentController!.value.isPlaying) {
              _currentController!.play().catchError((_) {
                // Игнорируем ошибки
              });
            }
          });
        }
      }
    }
  }

  Future<void> _initializeVideos() async {
    if (widget.videos.isEmpty) return;
    
    // НЕ ЖДЕМ инициализацию - начинаем сразу проигрывать
    _initializeController(_currentIndex, isCurrent: true).catchError((_) {});
    
    // Предзагрузка следующего и предыдущего (параллельно, не ждем)
    if (_currentIndex > 0) {
      _initializeController(_currentIndex - 1, isCurrent: false).catchError((_) {});
    }
    if (_currentIndex < widget.videos.length - 1) {
      _initializeController(_currentIndex + 1, isCurrent: false).catchError((_) {});
    }
  }

  Future<void> _initializeController(int index, {required bool isCurrent}) async {
    if (index < 0 || index >= widget.videos.length) return;
    
    final video = widget.videos[index];
    final videoUrl = ImageHelper.getFullImageUrl(video.videoUrl);
    
    if (videoUrl.isEmpty) {
      debugPrint('❌ [VideoPlayer] Video URL is empty for index $index');
      return;
    }
    
    // Проверяем кеш
    if (_controllerCache.containsKey(index)) {
      final cachedController = _controllerCache[index]!;
      if (!cachedController.hasListeners) {
        cachedController.addListener(_videoListener);
      }
      if (isCurrent) {
        setState(() {
          _currentController = cachedController;
          _isBuffering = !cachedController.value.isInitialized;
        });
        if (cachedController.value.isInitialized) {
          _playCurrentVideo();
        } else {
          // Повторная инициализация для кешированного контроллера
          try {
            await cachedController.initialize();
            if (mounted && _currentController == cachedController) {
              setState(() {
                _isBuffering = false;
              });
              _playCurrentVideo();
            }
          } catch (e) {
            debugPrint('❌ [VideoPlayer] Failed to initialize cached controller: $e');
            if (mounted) {
              setState(() {
                _isBuffering = false;
              });
            }
          }
        }
      }
      return;
    }
    
    debugPrint('🎬 [VideoPlayer] Initializing video $index: $videoUrl');
    
    final controller = VideoPlayerController.networkUrl(
      Uri.parse(videoUrl),
      videoPlayerOptions: VideoPlayerOptions(
        mixWithOthers: true,
        allowBackgroundPlayback: false,
      ),
    );
    
    // Добавляем listener для отслеживания состояния
    controller.addListener(_videoListener);
    
    _controllerCache[index] = controller;
    
    if (isCurrent) {
      setState(() {
        _currentController = controller;
        _isBuffering = true;
      });
    }
    
    try {
      // ✅ Инициализация с таймаутом
      await controller.initialize().timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException('Video initialization timeout after 10 seconds');
        },
      );
      
      debugPrint('✅ [VideoPlayer] Video $index initialized successfully');
      
      if (mounted && isCurrent && controller.value.isInitialized) {
        setState(() {
          _currentController = controller;
          _isBuffering = false;
        });
        _playCurrentVideo();
        // Уведомляем о смене видео (только один раз для этого видео)
        if (widget.onVideoChanged != null && _lastNotifiedVideoId != video.id) {
          _lastNotifiedVideoId = video.id;
          widget.onVideoChanged!(video);
        }
      }
    } catch (e) {
      debugPrint('❌ [VideoPlayer] Failed to initialize video $index: $e');
      
      // Ошибка инициализации - удаляем контроллер и очищаем состояние
      if (_controllerCache[index] == controller) {
        _controllerCache.remove(index);
        controller.removeListener(_videoListener);
        controller.dispose();
      }
      
      if (mounted && isCurrent) {
        setState(() {
          _isBuffering = false;
          // Оставляем _currentController, но видео не будет воспроизводиться
        });
      }
    }
  }

  void _playCurrentVideo() {
    if (_currentController != null && _currentController!.value.isInitialized) {
      // Устанавливаем параметры
      _currentController!.setLooping(true);
      _currentController!.setVolume(_isMuted ? 0 : 1);
      
      // Запускаем проигрывание сразу - как на вебе (autoPlay)
      _currentController!.play().catchError((_) {});
    }
  }

  void _onPageChanged(int index) {
    // Проверяем только валидность индекса
    if (index == _currentIndex || index < 0 || index >= widget.videos.length) {
      return;
    }
    
    // Останавливаем предыдущее видео
    _currentController?.pause();
    
    // ✅ Плавный fade transition (быстрая анимация 200мс вместо 400мс)
    _fadeAnimationController.forward(from: 0).then((_) {
      if (mounted) {
        setState(() {
          _currentIndex = index;
          _isDescriptionExpanded = false;
          _isBuffering = false;
        });
        _updateControllers(index);
        _fadeAnimationController.reverse();
      }
    });
  }

  void _updateControllers(int newIndex) {
    // Очищаем старые контроллеры (кроме кешированных)
    if (_previousController != null && !_controllerCache.containsValue(_previousController)) {
      _previousController?.dispose();
    }
    if (_nextController != null && !_controllerCache.containsValue(_nextController)) {
      _nextController?.dispose();
    }
    
    // Текущий становится предыдущим или следующим
    _previousController = null;
    _nextController = null;
    
    // Устанавливаем текущий
    if (_controllerCache.containsKey(newIndex)) {
      setState(() {
        _currentController = _controllerCache[newIndex]!;
      });
      if (_currentController!.value.isInitialized) {
        _playCurrentVideo();
      } else {
        _currentController!.initialize().then((_) {
          if (mounted && _currentController == _controllerCache[newIndex]) {
            _playCurrentVideo();
          }
        }).catchError((_) {});
      }
      // Уведомляем о смене видео
      if (widget.onVideoChanged != null && newIndex < widget.videos.length) {
        final video = widget.videos[newIndex];
        if (_lastNotifiedVideoId != video.id) {
          _lastNotifiedVideoId = video.id;
          widget.onVideoChanged!(video);
        }
      }
      setState(() {
        _isBuffering = false;
      });
    } else {
      // Инициализируем новый контроллер
      _initializeController(newIndex, isCurrent: true);
    }
    
    // Предзагрузка соседних
    if (newIndex > 0) {
      final prevIndex = newIndex - 1;
      if (_controllerCache.containsKey(prevIndex)) {
        _previousController = _controllerCache[prevIndex];
      } else {
        _initializeController(prevIndex, isCurrent: false);
      }
    }
    
    if (newIndex < widget.videos.length - 1) {
      final nextIndex = newIndex + 1;
      if (_controllerCache.containsKey(nextIndex)) {
        _nextController = _controllerCache[nextIndex];
      } else {
        _initializeController(nextIndex, isCurrent: false);
      }
    }
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
    });
    
    if (_currentController != null && _currentController!.value.isInitialized) {
      _currentController!.setVolume(_isMuted ? 0 : 1);
    }
    
    HapticHelper.lightImpact();
  }

  void _handleLike() {
    if (widget.onLike != null) {
      widget.onLike!(widget.videos[_currentIndex]);
    }
    _heartAnimationController.forward(from: 0).then((_) {
      _heartAnimationController.reverse();
    });
    HapticHelper.mediumImpact();
  }

  void _handleComment() {
    if (widget.onComment != null) {
      widget.onComment!(widget.videos[_currentIndex]);
    }
    HapticHelper.lightImpact();
  }

  void _handleShare() {
    if (widget.onShare != null) {
      widget.onShare!(widget.videos[_currentIndex]);
    }
    HapticHelper.lightImpact();
  }

  void _handleOrder() {
    if (widget.onOrder != null) {
      widget.onOrder!(widget.videos[_currentIndex]);
    }
    HapticHelper.lightImpact();
  }

  // Методы для внешнего управления (из HomeScreen)
  void pauseVideo() {
    _currentController?.pause();
    _currentController?.setVolume(0); // Убираем звук при паузе
    setState(() {
      _isPlaying = false;
    });
  }
  
  void resumeVideo() {
    if (_currentController != null && _currentController!.value.isInitialized) {
      _currentController!.play();
      // Восстанавливаем состояние звука (остается выключенным по умолчанию)
      _currentController!.setVolume(_isMuted ? 0 : 1);
      setState(() {
        _isPlaying = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.videos.isEmpty) {
      return const Center(
        child: Text(
          'Нет видео',
          style: TextStyle(color: Colors.white),
        ),
      );
    }

    return GestureDetector(
      onTap: _toggleMute, // Тап по экрану включает/выключает звук
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Видео лента с PageView
          PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            physics: const ClampingScrollPhysics(),
            itemCount: widget.videos.length,
            onPageChanged: _onPageChanged,
            itemBuilder: (context, index) {
              return _buildVideoPage(widget.videos[index], index);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildVideoPage(VideoModel video, int index) {
    final isCurrent = index == _currentIndex;
    final controller = isCurrent ? _currentController : null;
    final thumbnailUrl = ImageHelper.getFullImageUrl(video.thumbnailUrl ?? '');
    
    return AnimatedBuilder(
      animation: _fadeAnimationController,
      builder: (context, child) {
        final fadeOpacity = isCurrent 
            ? (1.0 - _fadeAnimationController.value * 0.5).clamp(0.0, 1.0)
            : 1.0;
        
        return Opacity(
          opacity: fadeOpacity,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Blurred превью (показывается пока видео не загружено) - ВСЕГДА если есть thumbnail
              if (thumbnailUrl.isNotEmpty)
                Positioned.fill(
                  child: Opacity(
                    // Показываем превью если видео не загружено, скрываем когда видео готово
                    opacity: (controller == null || !controller.value.isInitialized) ? 1.0 : 0.0,
                    child: ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: CachedNetworkImage(
                        imageUrl: thumbnailUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.darkBackground,
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.darkBackground,
                        ),
                      ),
                    ),
                  ),
                ),
              
              // Видео с fade transition
              if (controller != null && controller.value.isInitialized)
                Positioned.fill(
                  child: FadeTransition(
                    opacity: AlwaysStoppedAnimation(
                      (1.0 - _fadeAnimationController.value).clamp(0.0, 1.0),
                    ),
                    child: ScaleTransition(
                      scale: Tween(begin: 0.95, end: 1.0).animate(
                        CurvedAnimation(
                          parent: _fadeAnimationController,
                          curve: const Cubic(0.25, 0.1, 0.25, 1.0),
                        ),
                      ),
                      child: SizedBox.expand(
                        child: FittedBox(
                          fit: BoxFit.cover,
                          alignment: Alignment.center,
                          child: SizedBox(
                            width: controller.value.size.width,
                            height: controller.value.size.height,
                            child: VideoPlayer(controller),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              
              // Черный фон только если нет ни видео, ни превью
              if ((controller == null || !controller.value.isInitialized) && thumbnailUrl.isEmpty)
                Container(
                  color: AppColors.darkBackground,
                ),
              
              // Индикатор загрузки
              if (_isBuffering && isCurrent)
                const Center(
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                ),
              
              // UI элементы поверх видео
              if (isCurrent)
                Positioned.fill(
                  child: FadeTransition(
                    opacity: AlwaysStoppedAnimation(
                      (1.0 - _fadeAnimationController.value * 0.3).clamp(0.0, 1.0),
                    ),
                    child: _buildVideoOverlay(video),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildVideoOverlay(VideoModel video) {
    final authState = ref.watch(providers.authProvider);
    final currentUser = authState.user;
    final isClient = currentUser?.role == 'user';
    final videoAuthorId = video.authorId;
    final isOwnVideo = currentUser != null && videoAuthorId == currentUser.id;
    final shouldShowOrderButton = isClient && !isOwnVideo && widget.onOrder != null;
    final formattedPrice = video.furniturePrice != null
        ? '${video.furniturePrice!.toStringAsFixed(0)} ₸'
        : null;
    
    return Stack(
      children: [
        // Верхняя панель
        _buildTopBar(video),
        
        // Левая зона - информация (повыше от кнопки заказа)
        Positioned(
          left: 16.w,
          bottom: shouldShowOrderButton ? 180.h : 120.h, // Выше если есть кнопка заказа
          right: 80.w,
          child: _buildLeftInfo(video),
        ),
        
        // Правая зона - иконки действий
        Positioned(
          right: 16.w,
          bottom: 120.h,
          top: 80.h,
          child: _buildRightActions(video),
        ),
        
        // Нижняя панель - кнопка заказа (повыше чтобы не перекрывалась навигацией)
        if (shouldShowOrderButton)
          Positioned(
            bottom: 90.h, // Повыше от низа
            left: 16.w,
            right: 16.w,
            child: _buildOrderButton(formattedPrice),
          ),
        
        // Иконка mute/unmute (правый верхний угол)
        Positioned(
          top: MediaQuery.of(context).padding.top + 8.h,
          right: 16.w,
          child: _buildMuteButton(),
        ),
      ],
    );
  }

  Widget _buildTopBar(VideoModel video) {
    return Positioned(
      top: 0,
      left: 0,
      child: Container(
        padding: EdgeInsets.only(
          top: MediaQuery.of(context).padding.top + 8.h,
          left: 16.w,
          bottom: 12.h,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.black.withValues(alpha: 0.6),
              Colors.transparent,
            ],
          ),
        ),
        child: GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/search', arguments: '');
          },
          child: Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Icon(
              Icons.search,
              color: Colors.white,
              size: 20.sp,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLeftInfo(VideoModel video) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Автор и бейдж
        GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/master-profile', arguments: video.authorId);
          },
          child: Row(
            children: [
              Text(
                video.authorDisplayName,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      color: Colors.black.withValues(alpha: 0.5),
                      blurRadius: 8,
                    ),
                  ],
                ),
              ),
              if (video.role == 'master' && video.companyType != null) ...[
                SizedBox(width: 8.w),
                _buildAccountTypeBadge(video.companyType!),
              ],
            ],
          ),
        ),
        
        SizedBox(height: 12.h),
        
        // Описание
        if (video.description != null && video.description!.isNotEmpty)
          GestureDetector(
            onTap: () {
              setState(() {
                _isDescriptionExpanded = !_isDescriptionExpanded;
              });
            },
            child: Text(
              video.description!,
              style: TextStyle(
                color: Colors.white,
                fontSize: 14.sp,
                shadows: [
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 8,
                  ),
                ],
              ),
              maxLines: _isDescriptionExpanded ? null : 3,
              overflow: _isDescriptionExpanded ? null : TextOverflow.ellipsis,
            ),
          ),
        
        SizedBox(height: 12.h),
        
        // Теги (горизонтальный скролл)
        if (video.tags.isNotEmpty)
          SizedBox(
            height: 28.h,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: video.tags.length,
              separatorBuilder: (context, index) => SizedBox(width: 8.w),
              itemBuilder: (context, index) {
                return Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(14.r),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    '#${video.tags[index]}',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildRightActions(VideoModel video) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // Аватар канала (внизу блока)
        GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/master-profile', arguments: video.authorId);
          },
          child: Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white,
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipOval(
              child: ImageHelper.hasValidImagePath(video.avatar)
                  ? CachedNetworkImage(
                      imageUrl: ImageHelper.getFullImageUrl(video.avatar ?? ''),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppColors.primary,
                        child: Icon(Icons.person, color: Colors.white, size: 24.sp),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppColors.primary,
                        child: Icon(Icons.person, color: Colors.white, size: 24.sp),
                      ),
                    )
                  : Container(
                      color: AppColors.primary,
                      child: Icon(Icons.person, color: Colors.white, size: 24.sp),
                    ),
            ),
          ),
        ),
        
        SizedBox(height: 24.h),
        
        // Лайк
        _buildActionButton(
          icon: video.isLiked ? Icons.favorite : Icons.favorite_border,
          color: video.isLiked ? Colors.red : Colors.white,
          count: video.likesCount,
          onTap: _handleLike,
          animation: _heartAnimationController,
        ),
        
        SizedBox(height: 20.h),
        
        // Комментарии
        _buildActionButton(
          icon: Icons.comment_outlined,
          color: Colors.white,
          count: video.commentsCount,
          onTap: _handleComment,
        ),
        
        SizedBox(height: 20.h),
        
        // Избранное
        _buildActionButton(
          icon: video.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
          color: video.isBookmarked ? Colors.amber : Colors.white,
          onTap: () {
            // TODO: Добавить функционал избранного
            HapticHelper.lightImpact();
          },
        ),
        
        SizedBox(height: 20.h),
        
        // Поделиться
        _buildActionButton(
          icon: Icons.share,
          color: Colors.white,
          onTap: _handleShare,
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    int? count,
    required VoidCallback onTap,
    AnimationController? animation,
  }) {
    Widget iconWidget = Icon(
      icon,
      color: color,
      size: 32.sp,
      shadows: [
        Shadow(
          color: Colors.black.withValues(alpha: 0.5),
          blurRadius: 8,
        ),
      ],
    );
    
    if (animation != null) {
      iconWidget = ScaleTransition(
        scale: Tween(begin: 1.0, end: 1.3).animate(
          CurvedAnimation(parent: animation, curve: Curves.easeOut),
        ),
        child: iconWidget,
      );
    }
    
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              shape: BoxShape.circle,
            ),
            child: iconWidget,
          ),
          if (count != null) ...[
            SizedBox(height: 4.h),
            Text(
              _formatNumber(count),
              style: TextStyle(
                color: Colors.white,
                fontSize: 12.sp,
                fontWeight: FontWeight.bold,
                shadows: [
                  Shadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 8,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOrderButton(String? price) {
    return GestureDetector(
      onTap: _handleOrder,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 20.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary,
              AppColors.secondary,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.4),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 18.sp),
            SizedBox(width: 8.w),
            if (price != null)
              Text(
                'Заказать $price',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                ),
              )
            else
              Text(
                'Заказать',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMuteButton() {
    return GestureDetector(
      onTap: _toggleMute,
      child: Container(
        padding: EdgeInsets.all(8.w),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.5),
          shape: BoxShape.circle,
        ),
        child: Icon(
          _isMuted ? Icons.volume_off : Icons.volume_up,
          color: Colors.white,
          size: 24.sp,
        ),
      ),
    );
  }

  Widget _buildAccountTypeBadge(String type) {
    Color bgColor;
    Color textColor;
    String label;
    
    switch (type) {
      case 'company':
        bgColor = Colors.orange.withValues(alpha: 0.2);
        textColor = Colors.orange.shade300;
        label = 'Мебельная компания';
        break;
      case 'shop':
        bgColor = Colors.red.withValues(alpha: 0.2);
        textColor = Colors.red.shade300;
        label = 'Мебельный магазин';
        break;
      case 'master':
      default:
        bgColor = Colors.amber.withValues(alpha: 0.2);
        textColor = Colors.amber.shade300;
        label = 'Мастер';
    }
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: textColor.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 10.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatNumber(int number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    } else if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}K';
    }
    return number.toString();
  }
}
