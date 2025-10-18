import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'dart:async';
import '../../domain/entities/story_entity.dart';
import '../providers/stories_provider.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';

class StoryViewerScreen extends ConsumerStatefulWidget {
  final StoryGroup storyGroup;
  final int initialIndex;

  const StoryViewerScreen({
    super.key,
    required this.storyGroup,
    this.initialIndex = 0,
  });

  @override
  ConsumerState<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends ConsumerState<StoryViewerScreen>
    with SingleTickerProviderStateMixin {
  late PageController _pageController;
  late int _currentIndex;
  late AnimationController _progressController;
  VideoPlayerController? _videoController;
  Timer? _autoProgressTimer;
  bool _isPaused = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
    _progressController = AnimationController(vsync: this);

    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
    _loadStory(_currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _progressController.dispose();
    _videoController?.dispose();
    _autoProgressTimer?.cancel();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _loadStory(int index) async {
    final story = widget.storyGroup.stories[index];
    
    // Mark as viewed
    ref.read(storiesProvider.notifier).markAsViewed(story.id);

    _videoController?.dispose();
    _progressController.reset();
    _autoProgressTimer?.cancel();

    if (story.mediaType == 'video') {
      _videoController = VideoPlayerController.networkUrl(Uri.parse(story.mediaUrl));
      await _videoController!.initialize();
      
      if (mounted && !_isPaused) {
        _videoController!.play();
        _startProgress(_videoController!.value.duration);
      }
    } else {
      // Image - show for 5 seconds
      _startProgress(const Duration(seconds: 5));
    }

    setState(() {});
  }

  void _startProgress(Duration duration) {
    _progressController.duration = duration;
    _progressController.forward();

    _autoProgressTimer = Timer(duration, () {
      if (mounted && !_isPaused) {
        _nextStory();
      }
    });
  }

  void _nextStory() {
    if (_currentIndex < widget.storyGroup.stories.length - 1) {
      setState(() => _currentIndex++);
      _pageController.animateToPage(
        _currentIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      _loadStory(_currentIndex);
    } else {
      Navigator.pop(context);
    }
  }

  void _previousStory() {
    if (_currentIndex > 0) {
      setState(() => _currentIndex--);
      _pageController.animateToPage(
        _currentIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      _loadStory(_currentIndex);
    }
  }

  void _togglePause() {
    setState(() {
      _isPaused = !_isPaused;
      if (_isPaused) {
        _progressController.stop();
        _videoController?.pause();
        _autoProgressTimer?.cancel();
      } else {
        _progressController.forward();
        _videoController?.play();
        
        final remainingTime = _progressController.duration! * (1 - _progressController.value);
        _autoProgressTimer = Timer(remainingTime, () {
          if (mounted && !_isPaused) {
            _nextStory();
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final story = widget.storyGroup.stories[_currentIndex];
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: (details) {
          final screenWidth = MediaQuery.of(context).size.width;
          if (details.globalPosition.dx < screenWidth * 0.3) {
            _previousStory();
          } else if (details.globalPosition.dx > screenWidth * 0.7) {
            _nextStory();
          } else {
            _togglePause();
          }
        },
        onLongPressStart: (_) => _togglePause(),
        onLongPressEnd: (_) => _togglePause(),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Content
            PageView.builder(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: widget.storyGroup.stories.length,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
                _loadStory(index);
              },
              itemBuilder: (context, index) {
                final storyItem = widget.storyGroup.stories[index];
                
                if (storyItem.mediaType == 'video' && _videoController != null) {
                  return Center(
                    child: AspectRatio(
                      aspectRatio: _videoController!.value.aspectRatio,
                      child: VideoPlayer(_videoController!),
                    ),
                  );
                } else {
                  return Image.network(
                    storyItem.mediaUrl,
                    fit: BoxFit.contain,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(
                        child: CircularProgressIndicator(
                          color: LiquidGlassColors.primaryOrange,
                        ),
                      );
                    },
                  );
                }
              },
            ),

            // Progress bars
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 8,
              right: 8,
              child: Row(
                children: List.generate(
                  widget.storyGroup.stories.length,
                  (index) => Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(1),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: index < _currentIndex
                            ? 1.0
                            : index == _currentIndex
                                ? _progressController.value
                                : 0.0,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Header
            Positioned(
              top: MediaQuery.of(context).padding.top + 20,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  // Avatar
                  CircleAvatar(
                    radius: 20,
                    backgroundImage: widget.storyGroup.authorAvatar != null
                        ? NetworkImage(widget.storyGroup.authorAvatar!)
                        : null,
                    backgroundColor: LiquidGlassColors.primaryOrange,
                    child: widget.storyGroup.authorAvatar == null
                        ? Text(
                            widget.storyGroup.authorName.substring(0, 1).toUpperCase(),
                            style: const TextStyle(color: Colors.white),
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),

                  // Name and time
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.storyGroup.authorName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          _formatTimeAgo(story.createdAt),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Close button
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Pause indicator
            if (_isPaused)
              const Center(
                child: Icon(
                  Icons.pause_circle_filled,
                  size: 80,
                  color: Colors.white54,
                ),
              ),

            // Bottom info (views, etc)
            Positioned(
              bottom: 40,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  Icon(
                    Icons.visibility,
                    size: 16,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${story.viewsCount}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 14,
                    ),
                  ),
                  const Spacer(),
                  if (!story.isExpired && !story.isHighlight)
                    Text(
                      'Истекает через ${_formatDuration(story.timeRemaining)}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    
    if (diff.inMinutes < 1) return 'Только что';
    if (diff.inHours < 1) return '${diff.inMinutes}м назад';
    if (diff.inDays < 1) return '${diff.inHours}ч назад';
    return '${diff.inDays}д назад';
  }

  String _formatDuration(Duration duration) {
    if (duration.inHours > 0) {
      return '${duration.inHours}ч';
    }
    return '${duration.inMinutes}м';
  }
}


