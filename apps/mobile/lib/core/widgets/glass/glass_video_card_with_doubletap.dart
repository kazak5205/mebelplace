import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../features/feed/domain/entities/video_entity.dart';
import '../../../features/subscriptions/presentation/providers/hashtag_subscriptions_provider.dart';
import '../../../features/subscriptions/presentation/providers/region_subscriptions_provider.dart';
import '../effects/particle_system.dart';
import '../effects/3d_card.dart';
import 'glass_icon_button.dart' as glass_icon;
import '../../../features/auth/presentation/providers/auth_provider_export.dart';
import '../../../features/auth/presentation/providers/auth_state.dart';
import '../../../features/auth/domain/entities/user_entity.dart';
import '../../../widgets/login_required_dialog.dart';
import '../../../services/pending_action_service.dart';

/// Liquid Glass Video Card с double-tap анимацией и Guest blocking
class GlassVideoCardWithDoubleTap extends ConsumerStatefulWidget {
  final VideoEntity video;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onComment;
  final VoidCallback? onShare;
  final VoidCallback? onFavorite;
  final VoidCallback? onOrder;

  const GlassVideoCardWithDoubleTap({
    super.key,
    required this.video,
    this.onTap,
    this.onLike,
    this.onComment,
    this.onShare,
    this.onFavorite,
    this.onOrder,
  });

  @override
  ConsumerState<GlassVideoCardWithDoubleTap> createState() => _GlassVideoCardWithDoubleTapState();
}

class _GlassVideoCardWithDoubleTapState extends ConsumerState<GlassVideoCardWithDoubleTap>
    with SingleTickerProviderStateMixin {
  late AnimationController _likeAnimationController;
  late Animation<double> _likeAnimation;
  bool _showLikeAnimation = false;
  bool _showConfetti = false;

  @override
  void initState() {
    super.initState();
    
    _likeAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );

    _likeAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.6, end: 1.4).chain(
          CurveTween(curve: Curves.easeOut),
        ),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.4, end: 1.0).chain(
          CurveTween(curve: Curves.easeIn),
        ),
        weight: 50,
      ),
    ]).animate(_likeAnimationController);

    _likeAnimationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _likeAnimationController.reset();
        setState(() => _showLikeAnimation = false);
      }
    });
  }

  @override
  void dispose() {
    _likeAnimationController.dispose();
    super.dispose();
  }

  void _handleDoubleTap() {
    // Check if user is authenticated (not guest)
    final authState = ref.read(authProvider);
    final isGuest = authState is! Authenticated || 
                    (authState).user.role == UserRole.guest;
    
    if (isGuest) {
      // Show login required dialog
      showDialog(
        context: context,
        builder: (context) => const LoginRequiredDialog(
          message: 'Войдите, чтобы ставить лайки',
          actionType: 'like_video',
        ),
      );
      
      // Save pending action
      PendingActionService.savePendingAction(
        actionType: 'like_video',
        data: {'video_id': widget.video.id, 'author_id': widget.video.author.id},
      );
      
      return;
    }

    // ✅ PREMIUM: Haptic feedback
    HapticFeedback.mediumImpact();

    // ✅ PREMIUM: Particles + Animation
    setState(() {
      _showLikeAnimation = true;
      _showConfetti = true;
    });
    _likeAnimationController.forward();

    // Remove confetti after 1.5s
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() => _showConfetti = false);
      }
    });

    // Trigger like callback
    widget.onLike?.call();
  }

  @override
  Widget build(BuildContext context) {
    final subscriptionsState = ref.watch(hashtagSubscriptionsProvider);
    final operationState = ref.watch(regionSubscriptionsProvider);
    
    final bool isSubscribed = subscriptionsState is HashtagSubscriptionsLoaded &&
        subscriptionsState.subscriptions.any((s) => s.userId == widget.video.author.id.toString());

    // ✅ PREMIUM: 3D Card effect
    return Card3D(
      depth: 15.0,
      enableTilt: false, // Disable tilt on mobile to avoid conflicts with swipe
      enableHover: false,
      child: GestureDetector(
        onTap: widget.onTap,
        onDoubleTap: _handleDoubleTap,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Video background
            if (widget.video.thumbnailUrl != null)
              CachedNetworkImage(
                imageUrl: widget.video.thumbnailUrl!,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.black12,
                  child: const Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.black26,
                  child: const Icon(Icons.error, color: Colors.white54, size: 48),
                ),
              ),

            // Glass overlay
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: ClipRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.0),
                          Colors.black.withValues(alpha: 0.7),
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Author row
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 16,
                              backgroundImage: widget.video.author.avatarUrl != null
                                  ? NetworkImage(widget.video.author.avatarUrl!)
                                  : null,
                              child: widget.video.author.avatarUrl == null
                                  ? Text(widget.video.author.username[0].toUpperCase())
                                  : null,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                widget.video.author.username,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            if (!isSubscribed)
                              _buildSubscribeButton(operationState),
                          ],
                        ),
                        const SizedBox(height: 8),
                        
                        // Title
                        Text(
                          widget.video.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ✅ PREMIUM: Confetti particles при лайке
            if (_showConfetti)
              Positioned.fill(
                child: IgnorePointer(
                  child: ParticleSystem(
                    type: ParticleType.hearts,
                    particleCount: 20,
                    duration: const Duration(milliseconds: 1500),
                  ),
                ),
              ),

            // Like animation heart
            if (_showLikeAnimation)
              Center(
                child: ScaleTransition(
                  scale: _likeAnimation,
                  child: const Icon(
                    Icons.favorite,
                    color: Colors.red,
                    size: 120,
                  ),
                ),
              ),

            // Right action buttons
            Positioned(
              right: 12,
              bottom: 120,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildActionButton(
                    icon: widget.video.isLiked ? Icons.favorite : Icons.favorite_border,
                    label: widget.video.likesCount.toString(),
                    onTap: widget.onLike,
                    color: widget.video.isLiked ? Colors.red : Colors.white,
                  ),
                  const SizedBox(height: 16),
                  _buildActionButton(
                    icon: Icons.comment,
                    label: widget.video.commentsCount.toString(),
                    onTap: widget.onComment,
                  ),
                  const SizedBox(height: 16),
                  _buildActionButton(
                    icon: Icons.share,
                    label: 'Поделиться',
                    onTap: widget.onShare,
                  ),
                  if (widget.onFavorite != null) ...[
                    const SizedBox(height: 16),
                    _buildActionButton(
                      icon: Icons.bookmark_border,
                      label: '',
                      onTap: widget.onFavorite,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubscribeButton(RegionSubscriptionsState operationState) {
    final isLoading = operationState is RegionSubscriptionsLoading;

    return glass_icon.GlassIconButton(
      icon: isLoading ? Icons.hourglass_empty : Icons.add,
      size: 32,
      onTap: isLoading 
          ? null 
          : () {
              ref.read(regionSubscriptionsProvider.notifier).subscribe(
                widget.video.author.id.toString(),
              );
            },
      color: Colors.white,
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    VoidCallback? onTap,
    Color color = Colors.white,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        glass_icon.GlassIconButton(
          icon: icon,
          size: 48,
          onTap: onTap,
          color: color,
        ),
        if (label.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }
}
