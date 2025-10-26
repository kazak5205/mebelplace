import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/video_model.dart';

class TikTokVideoPlayer extends StatefulWidget {
  final List<VideoModel> videos;
  final int initialIndex;
  final Function(VideoModel video)? onVideoChanged;
  final Function(VideoModel video)? onLike;
  final Function(VideoModel video)? onShare;
  final Function(VideoModel video)? onComment;

  const TikTokVideoPlayer({
    Key? key,
    required this.videos,
    this.initialIndex = 0,
    this.onVideoChanged,
    this.onLike,
    this.onShare,
    this.onComment,
  }) : super(key: key);

  @override
  State<TikTokVideoPlayer> createState() => _TikTokVideoPlayerState();
}

class _TikTokVideoPlayerState extends State<TikTokVideoPlayer>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late VideoPlayerController _videoController;
  int _currentIndex = 0;
  bool _isPlaying = true;
  bool _isMuted = false;
  bool _showControls = false;
  late AnimationController _heartAnimationController;
  late AnimationController _controlsAnimationController;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    _heartAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _controlsAnimationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _initializeVideo();
  }

  void _initializeVideo() {
    if (widget.videos.isNotEmpty) {
      _videoController = VideoPlayerController.networkUrl(
        Uri.parse(widget.videos[_currentIndex].videoUrl),
      );
      _videoController.initialize().then((_) {
        setState(() {});
        if (_isPlaying) {
          _videoController.play();
        }
        if (_isMuted) {
          _videoController.setVolume(0);
        }
      });
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    _pageController.dispose();
    _heartAnimationController.dispose();
    _controlsAnimationController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    if (index != _currentIndex && index < widget.videos.length) {
      _videoController.dispose();
      _currentIndex = index;
      _initializeVideo();
      widget.onVideoChanged?.call(widget.videos[_currentIndex]);
    }
  }

  void _togglePlayPause() {
    setState(() {
      _isPlaying = !_isPlaying;
      if (_isPlaying) {
        _videoController.play();
      } else {
        _videoController.pause();
      }
    });
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
      _videoController.setVolume(_isMuted ? 0 : 1);
    });
  }

  void _onLike() {
    _heartAnimationController.forward().then((_) {
      _heartAnimationController.reverse();
    });
    widget.onLike?.call(widget.videos[_currentIndex]);
  }

  void _onDoubleTap() {
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
            setState(() {
              _showControls = false;
            });
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
        child: Text('Нет видео для воспроизведения'),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _toggleControls,
        onDoubleTap: _onDoubleTap,
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              scrollDirection: Axis.vertical,
              onPageChanged: _onPageChanged,
              itemCount: widget.videos.length,
              itemBuilder: (context, index) {
                return _buildVideoItem(widget.videos[index]);
              },
            ),
            if (_showControls) _buildControls(),
            _buildRightActions(),
            _buildBottomInfo(),
            _buildProgressIndicator(),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoItem(VideoModel video) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: _videoController.value.isInitialized
          ? AspectRatio(
              aspectRatio: _videoController.value.aspectRatio,
              child: VideoPlayer(_videoController),
            )
          : const Center(
              child: CircularProgressIndicator(
                color: AppColors.primary,
              ),
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
                  color: Colors.black54,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                  size: 40.sp,
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
      right: 16.w,
      bottom: 120.h,
      child: Column(
        children: [
          // Avatar
          GestureDetector(
            onTap: () {
              // Navigate to user profile
            },
            child: Container(
              width: 48.w,
              height: 48.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: video.avatar != null
                  ? ClipOval(
                      child: CachedNetworkImage(
                        imageUrl: video.avatar!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => const Icon(
                          Icons.person,
                          color: Colors.white,
                        ),
                        errorWidget: (context, url, error) => const Icon(
                          Icons.person,
                          color: Colors.white,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.person,
                      color: Colors.white,
                    ),
            ),
          ),
          SizedBox(height: 24.h),
          
          // Like button
          GestureDetector(
            onTap: _onLike,
            child: Column(
              children: [
                AnimatedBuilder(
                  animation: _heartAnimationController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1.0 + (_heartAnimationController.value * 0.3),
                      child: Icon(
                        video.isLiked ? Icons.favorite : Icons.favorite_border,
                        color: video.isLiked ? Colors.red : Colors.white,
                        size: 36.sp,
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
                    shadows: [
                      Shadow(
                        color: Colors.black.withOpacity(0.75),
                        offset: const Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 24.h),
          
          // Comment button
          GestureDetector(
            onTap: () => widget.onComment?.call(video),
            child: Column(
              children: [
                Icon(
                  Icons.comment_outlined,
                  color: Colors.white,
                  size: 34.sp,
                ),
                SizedBox(height: 4.h),
                Text(
                  video.formattedComments,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    shadows: [
                      Shadow(
                        color: Colors.black.withOpacity(0.75),
                        offset: const Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 24.h),
          
          // Share button
          GestureDetector(
            onTap: () => widget.onShare?.call(video),
            child: Column(
              children: [
                Icon(
                  Icons.send,
                  color: Colors.white,
                  size: 28.sp,
                ),
                SizedBox(height: 4.h),
                Text(
                  'Поделиться',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    shadows: [
                      Shadow(
                        color: Colors.black.withOpacity(0.75),
                        offset: const Offset(0, 1),
                        blurRadius: 3,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 24.h),
          
          // Bookmark button
          Icon(
            Icons.bookmark_border,
            color: Colors.white,
            size: 32.sp,
          ),
          SizedBox(height: 24.h),
          
          // Mute button
          GestureDetector(
            onTap: _toggleMute,
            child: Icon(
              _isMuted ? Icons.volume_off : Icons.volume_up,
              color: Colors.white,
              size: 28.sp,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomInfo() {
    final video = widget.videos[_currentIndex];
    
    return Positioned(
      left: 16.w,
      right: 90.w,
      bottom: 20.h,
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
                  shadows: [
                    Shadow(
                      color: Colors.black.withOpacity(0.75),
                      offset: const Offset(0, 1),
                      blurRadius: 3,
                    ),
                  ],
                ),
              ),
              Text(
                ' • ${video.timeAgo}',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 14.sp,
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
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              shadows: [
                Shadow(
                  color: Colors.black.withOpacity(0.75),
                  offset: const Offset(0, 1),
                  blurRadius: 3,
                ),
              ],
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          
          // Description
          if (video.description != null) ...[
            SizedBox(height: 8.h),
            Text(
              video.description!,
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 14.sp,
                shadows: [
                  Shadow(
                    color: Colors.black.withOpacity(0.75),
                    offset: const Offset(0, 1),
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
            SizedBox(height: 12.h),
            Wrap(
              spacing: 8.w,
              children: video.tags.take(3).map((tag) {
                return Text(
                  '#$tag',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    shadows: [
                      Shadow(
                        color: Colors.black.withOpacity(0.75),
                        offset: const Offset(0, 1),
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

  Widget _buildProgressIndicator() {
    return Positioned(
      top: 50.h,
      left: 0,
      right: 0,
      child: Row(
        children: widget.videos.asMap().entries.map((entry) {
          final index = entry.key;
          final isActive = index == _currentIndex;
          final isCompleted = index < _currentIndex;
          
          return Expanded(
            child: Container(
              height: 2.h,
              margin: EdgeInsets.symmetric(horizontal: 2.w),
              decoration: BoxDecoration(
                color: isActive
                    ? Colors.white
                    : isCompleted
                        ? Colors.white.withOpacity(0.5)
                        : Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(1.r),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
