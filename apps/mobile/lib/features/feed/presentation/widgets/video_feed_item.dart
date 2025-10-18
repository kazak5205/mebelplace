import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/avatar.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/services/gamification_service.dart';
import '../../domain/entities/video_entity.dart';
import '../providers/video_feed_provider.dart';

/// Полноэкранный video player для вертикальной ленты (TikTok-style)
class VideoFeedItem extends StatefulWidget {
  final VideoEntity video;
  final bool isCurrentPage;
  final VoidCallback? onWatchedFor30Seconds;

  const VideoFeedItem({
    super.key,
    required this.video,
    required this.isCurrentPage,
    this.onWatchedFor30Seconds,
  });

  @override
  State<VideoFeedItem> createState() => _VideoFeedItemState();
}

class _VideoFeedItemState extends State<VideoFeedItem>
    with AutomaticKeepAliveClientMixin {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  DateTime? _playStartTime;
  bool _has30SecAward = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void didUpdateWidget(VideoFeedItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    // Управление воспроизведением при переключении страниц
    if (oldWidget.isCurrentPage != widget.isCurrentPage) {
      if (widget.isCurrentPage) {
        _play();
      } else {
        _pause();
      }
    }
  }

  Future<void> _initializeVideo() async {
    try {
      _controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.video.path),
      );

      await _controller!.initialize();
      
      if (mounted) {
        setState(() {
          _isInitialized = true;
          _hasError = false;
        });

        // Автоплей если это текущая страница
        if (widget.isCurrentPage) {
          _play();
        }

        // Слушаем прогресс для трекинга 30 секунд
        _controller!.addListener(_checkWatchTime);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _isInitialized = false;
        });
      }
    }
  }

  void _checkWatchTime() {
    if (_playStartTime != null && !_has30SecAward) {
      final watchDuration = DateTime.now().difference(_playStartTime!);
      
      if (watchDuration.inSeconds >= 30) {
        _has30SecAward = true;
        widget.onWatchedFor30Seconds?.call();
      }
    }
  }

  void _play() {
    if (_controller != null && !_controller!.value.isPlaying) {
      _controller!.play();
      _playStartTime = DateTime.now();
    }
  }

  void _pause() {
    if (_controller != null && _controller!.value.isPlaying) {
      _controller!.pause();
      _playStartTime = null;
    }
  }

  void _togglePlayPause() {
    if (_controller == null) return;
    
    setState(() {
      if (_controller!.value.isPlaying) {
        _pause();
      } else {
        _play();
      }
    });
  }

  @override
  void dispose() {
    _controller?.removeListener(_checkWatchTime);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return GestureDetector(
      onTap: _togglePlayPause,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Video player or thumbnail
          if (_isInitialized && _controller != null)
            FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller!.value.size.width,
                height: _controller!.value.size.height,
                child: VideoPlayer(_controller!),
              ),
            )
          else if (_hasError)
            Container(
              color: Colors.black,
              child: const Center(
                child: Icon(Icons.error_outline, color: Colors.white, size: 64),
              ),
            )
          else
            // Show thumbnail while loading
            CachedNetworkImage(
              imageUrl: widget.video.thumbnailUrl ?? '',
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(
                color: Colors.black,
                child: const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              ),
              errorWidget: (_, __, ___) => Container(
                color: Colors.black,
                child: const Icon(Icons.video_library, color: Colors.white, size: 64),
              ),
            ),

          // Pause indicator
          if (_isInitialized &&
              _controller != null &&
              !_controller!.value.isPlaying)
            const Center(
              child: Icon(
                Icons.play_circle_outline,
                color: Colors.white,
                size: 80,
              ),
            ),

          // Gradient overlay
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: 200,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.transparent, Colors.black45, Colors.black87],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Right vertical actions
          Positioned(
            right: 12,
            bottom: 100,
            child: _RightActions(video: widget.video),
          ),

          // Bottom info
          Positioned(
            left: 12,
            bottom: 20,
            right: 80,
            child: _BottomInfo(video: widget.video),
          ),

          // Ad badge
          if (widget.video.isAd)
            Positioned(
              top: MediaQuery.of(context).padding.top + 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.warning,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Реклама',
                  style: AppTextStyles.captionBold.copyWith(color: Colors.white),
                ),
              ),
            ),

          // Progress indicator
          if (_isInitialized && _controller != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: VideoProgressIndicator(
                _controller!,
                allowScrubbing: true,
                colors: const VideoProgressColors(
                  playedColor: AppColors.lightPrimary,
                  bufferedColor: Colors.white24,
                  backgroundColor: Colors.white12,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Правые действия (лайк, комментарии, шеринг, избранное)
class _RightActions extends ConsumerWidget {
  final VideoEntity video;

  const _RightActions({required this.video});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Like
        _ActionButton(
          icon: video.isLiked ? Icons.favorite : Icons.favorite_border,
          label: _formatCount(video.likesCount),
          color: video.isLiked ? AppColors.like : Colors.white,
          onTap: () {
            ref.read(videoFeedProvider.notifier).toggleLike(video.id.toString());
          },
        ),
        const SizedBox(height: 20),

        // Comment
        _ActionButton(
          icon: Icons.comment,
          label: _formatCount(video.commentsCount),
          color: Colors.white,
          onTap: () {
            context.push('/video/${video.id}/comments');
          },
        ),
        const SizedBox(height: 20),

        // Share
        _ActionButton(
          icon: Icons.share,
          label: _formatCount(video.sharesCount),
          color: Colors.white,
          onTap: () {
            // Share video URL
            final url = 'https://mebelplace.com.kz/video/${video.id}';
            // Award +5 points for sharing
            getIt<GamificationService>().awardPoints(
              action: GamificationAction.like,
              relatedId: video.id.toString(),
            );
          },
        ),
        const SizedBox(height: 20),

        // Favorite
        _ActionButton(
          icon: video.isFavorite ? Icons.bookmark : Icons.bookmark_border,
          label: '',
          color: video.isFavorite ? AppColors.favorite : Colors.white,
          onTap: () {
            ref.read(videoFeedProvider.notifier).toggleFavorite(video.id.toString());
          },
        ),
      ],
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: const BoxDecoration(
              color: Colors.black45,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTextStyles.caption.copyWith(
                color: Colors.white,
                shadows: [
                  const Shadow(
                    color: Colors.black45,
                    blurRadius: 4,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Нижняя информация (автор + название)
class _BottomInfo extends StatelessWidget {
  final VideoEntity video;

  const _BottomInfo({required this.video});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Author row
        Row(
          children: [
            Avatar(
              url: video.author.avatarUrl,
              size: 44,
              showBorder: false,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.author.username,
                    style: AppTextStyles.subtitle1.copyWith(
                      color: Colors.white,
                      shadows: [
                        const Shadow(color: Colors.black45, blurRadius: 4),
                      ],
                    ),
                  ),
                  if (video.description != null)
                    Text(
                      '♪ ${video.description}',
                      style: AppTextStyles.caption.copyWith(
                        color: Colors.white70,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            // Subscribe button
            if (!video.isFollowing)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.lightPrimary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Подписаться',
                  style: AppTextStyles.caption.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),

        // Title + description
        Text(
          video.title,
          style: AppTextStyles.body1.copyWith(
            color: Colors.white,
            shadows: [
              const Shadow(color: Colors.black45, blurRadius: 4),
            ],
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),

        if (video.description != null) ...[
          const SizedBox(height: 6),
          Text(
            video.description!,
            style: AppTextStyles.body2.copyWith(
              color: Colors.white70,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],

        // Hashtags
        if (video.hashtags.isNotEmpty) ...[
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: video.hashtags.take(3).map((tag) {
              return Text(
                '#$tag',
                style: AppTextStyles.caption.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              );
            }).toList(),
          ),
        ],

        // Product CTA
        if (video.id != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.lightPrimary, width: 1.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        video.title ?? 'Товар',
                        style: AppTextStyles.subtitle2.copyWith(color: Colors.white),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (video.productPrice != null)
                        Text(
                          '${video.productPrice} ₸',
                          style: AppTextStyles.h6.copyWith(color: AppColors.lightPrimary),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () {
                    if (video.id != null) {
                      context.push('/product/${video.id}');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: const Text('Заказать'),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// Виджет avatar для использования
class Avatar extends StatelessWidget {
  final String? url;
  final double size;
  final bool showBorder;

  const Avatar({
    super.key,
    this.url,
    this.size = 44,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: showBorder
            ? Border.all(color: AppColors.lightPrimary, width: 2)
            : null,
      ),
      clipBehavior: Clip.hardEdge,
      child: url == null || url!.isEmpty
          ? Container(
              color: Colors.grey.shade300,
              child: const Icon(Icons.person, color: Colors.white),
            )
          : CachedNetworkImage(
              imageUrl: url!,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(color: Colors.grey.shade300),
              errorWidget: (_, __, ___) => Container(
                color: Colors.grey.shade300,
                child: const Icon(Icons.person),
              ),
            ),
    );
  }
}

