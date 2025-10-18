import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/video.dart';
import '../../core/theme/app_theme.dart';

class VideoPlayerWidget extends StatefulWidget {
  final Video video;
  final bool isAd;
  final VoidCallback? onLike;
  final VoidCallback? onFavorite;
  final VoidCallback? onComment;
  final VoidCallback? onOrder;
  final VoidCallback? onShare;

  const VideoPlayerWidget({
    super.key,
    required this.video,
    this.isAd = false,
    this.onLike,
    this.onFavorite,
    this.onComment,
    this.onOrder,
    this.onShare,
  });

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  VideoPlayerController? _controller;
  bool _isPlaying = false;
  bool _isLoading = true;
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _initializeVideo() async {
    if (widget.video.videoUrl != null) {
      _controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.video.videoUrl!),
      );
      
      await _controller!.initialize();
      _controller!.setLooping(true);
      
      setState(() {
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _togglePlayPause() {
    if (_controller != null) {
      setState(() {
        if (_controller!.value.isPlaying) {
          _controller!.pause();
          _isPlaying = false;
        } else {
          _controller!.play();
          _isPlaying = true;
        }
      });
    }
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.black,
      child: Stack(
        children: [
          // Video Player or Thumbnail
          if (_isLoading)
            _buildLoadingWidget()
          else if (_controller != null && _controller!.value.isInitialized)
            _buildVideoPlayer()
          else
            _buildThumbnailWidget(),
          
          // Ad Badge
          if (widget.isAd)
            Positioned(
              top: 50,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'РЕКЛАМА',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          
          // Video Controls
          if (_showControls && !_isLoading)
            _buildVideoControls(),
          
          // Video Info Overlay
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildVideoInfo(),
          ),
          
          // Action Buttons
          Positioned(
            right: 16,
            bottom: 120,
            child: _buildActionButtons(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingWidget() {
    return const Center(
      child: CircularProgressIndicator(
        color: Colors.blue,
      ),
    );
  }

  Widget _buildVideoPlayer() {
    return GestureDetector(
      onTap: _toggleControls,
      child: Center(
        child: AspectRatio(
          aspectRatio: _controller!.value.aspectRatio,
          child: VideoPlayer(_controller!),
        ),
      ),
    );
  }

  Widget _buildThumbnailWidget() {
    return GestureDetector(
      onTap: _toggleControls,
      child: Center(
        child: widget.video.thumbnail != null
            ? CachedNetworkImage(
                imageUrl: widget.video.thumbnail!,
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
                placeholder: (context, url) => _buildLoadingWidget(), // Loading state
                errorWidget: (context, url, error) => _buildErrorWidget(),
              )
            : _buildErrorWidget(),
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Container(
      color: Colors.grey[900],
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              color: Colors.white,
              size: 48,
            ),
            SizedBox(height: 16),
            Text(
              'Ошибка загрузки видео',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoControls() {
    return Container(
      color: Colors.black.withValues(alpha: 0.3),
      child: Center(
        child: IconButton(
          onPressed: _togglePlayPause,
          icon: Icon(
            _isPlaying ? Icons.pause : Icons.play_arrow,
            color: Colors.white,
            size: 64,
          ),
        ),
      ),
    );
  }

  Widget _buildVideoInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [
            Colors.black.withValues(alpha: 0.8),
            Colors.transparent,
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            widget.video.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundImage: widget.video.author.avatar != null
                    ? CachedNetworkImageProvider(widget.video.author.avatar!)
                    : null,
                child: widget.video.author.avatar == null
                    ? const Icon(Icons.person, size: 16)
                    : null,
              ),
              const SizedBox(width: 8),
              Text(
                widget.video.author.name ?? widget.video.author.username,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              if (widget.video.productPrice != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${widget.video.productPrice} ₽',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildStatChip(Icons.visibility, '${widget.video.views}'),
              const SizedBox(width: 16),
              _buildStatChip(Icons.favorite, '${widget.video.likes}'),
              const SizedBox(width: 16),
              _buildStatChip(Icons.comment, '0'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        _buildActionButton(
          icon: Icons.favorite_border,
          label: '${widget.video.likes}',
          onTap: widget.onLike,
          isActive: false,
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          icon: Icons.favorite,
          label: 'Избранное',
          onTap: widget.onFavorite,
          isActive: widget.video.isFavorited,
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          icon: Icons.comment_outlined,
          label: 'Комментарии',
          onTap: widget.onComment,
          isActive: false,
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          icon: Icons.share,
          label: 'Поделиться',
          onTap: widget.onShare,
          isActive: false,
        ),
        if (widget.video.productPrice != null) ...[
          const SizedBox(height: 16),
          _buildActionButton(
            icon: Icons.shopping_cart,
            label: 'Заказать',
            onTap: widget.onOrder,
            isActive: false,
            isPrimary: true,
          ),
        ],
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
    required bool isActive,
    bool isPrimary = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isPrimary
              ? Colors.blue
              : isActive
                  ? Colors.blue
                  : Colors.black.withValues(alpha: 0.5),
          shape: BoxShape.circle,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
