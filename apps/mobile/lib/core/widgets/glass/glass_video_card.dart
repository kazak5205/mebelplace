import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';
import '../../../features/feed/domain/entities/video_entity.dart';
import 'glass_button.dart';
import 'glass_panel.dart';

/// Liquid Glass Video Card для ленты
class GlassVideoCard extends StatelessWidget {
  final VideoEntity video;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onComment;
  final VoidCallback? onShare;
  final VoidCallback? onFavorite;
  final VoidCallback? onOrder;
  final VoidCallback? onSubscribe;

  const GlassVideoCard({
    super.key,
    required this.video,
    this.onTap,
    this.onLike,
    this.onComment,
    this.onShare,
    this.onFavorite,
    this.onOrder,
    this.onSubscribe,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Видео фон
          Hero(
            tag: 'video_${video.id}',
            child: CachedNetworkImage(
              imageUrl: video.thumbnailUrl ?? '',
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: Colors.black,
                child: const Center(child: CircularProgressIndicator()),
              ),
              errorWidget: (context, url, error) => Container(
                color: Colors.black,
                child: const Icon(Icons.video_library, size: 64, color: Colors.white54),
              ),
            ),
          ),

          // Градиенты для читаемости
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            child: Container(
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
            ),
          ),

          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: 250,
            child: Container(
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
            ),
          ),

          // Правая панель с иконками
          Positioned(
            right: 16,
            bottom: 120,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Avatar + Subscribe
                if (video.author.username != null) ...[
                  _buildGlassAvatar(),
                  if (onSubscribe != null) ...[
                    const SizedBox(height: 8),
                    _buildSubscribeButton(),
                  ],
                  const SizedBox(height: 24),
                ],

                // Like
                GlassIconButton(
                  icon: video.isLiked ? Icons.favorite : Icons.favorite_border,
                  count: _formatCount(video.likesCount),
                  onTap: onLike,
                  iconColor: video.isLiked 
                      ? LiquidGlassColors.primaryOrange 
                      : Colors.white.withValues(alpha: 0.9),
                ),
                const SizedBox(height: 16),

                // Comment
                GlassIconButton(
                  icon: Icons.chat_bubble_outline,
                  count: _formatCount(video.commentsCount),
                  onTap: onComment,
                ),
                const SizedBox(height: 16),

                // Share
                GlassIconButton(
                  icon: Icons.share_outlined,
                  count: _formatCount(video.sharesCount),
                  onTap: onShare,
                ),
                const SizedBox(height: 16),

                // Bookmark
                GlassIconButton(
                  icon: video.isFavorite ? Icons.bookmark : Icons.bookmark_border,
                  onTap: onFavorite,
                  iconColor: video.isFavorite 
                      ? LiquidGlassColors.primaryOrange 
                      : Colors.white.withValues(alpha: 0.9),
                ),
              ],
            ),
          ),

          // Нижняя панель с описанием
          Positioned(
            bottom: 80,
            left: 16,
            right: 90,
            child: GlassPanel(
              padding: const EdgeInsets.all(16),
              borderRadius: 20,
              color: Colors.black.withValues(alpha: 0.3),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Название
                  Text(
                    video.title,
                    style: LiquidGlassTextStyles.videoTitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  // Описание
                  if (video.description != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      video.description!,
                      style: LiquidGlassTextStyles.videoDescription,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // Хэштеги
                  if (video.hashtags.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: video.hashtags.take(3).map((tag) {
                        return Text(
                          '#$tag',
                          style: LiquidGlassTextStyles.videoCaption.copyWith(
                            color: LiquidGlassColors.primaryOrangeLight,
                          ),
                        );
                      }).toList(),
                    ),
                  ],

                  // Кнопка заказа (если есть товар)
                  if (video.id != null && onOrder != null) ...[
                    const SizedBox(height: 12),
                    GlassButton.primary(
                      video.productPrice != null
                          ? 'Заказать ${video.productPrice} ₸'
                          : 'Заказать',
                      onTap: onOrder,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassAvatar() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.3),
              width: 2,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: video.author.username != null
                ? CircleAvatar(
                    backgroundColor: LiquidGlassColors.primaryOrange,
                    child: Text(
                      video.author.username!.substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  )
                : const Icon(Icons.person, color: Colors.white70),
          ),
        ),
      ),
    );
  }

  Widget _buildSubscribeButton() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: LiquidGlassColors.primaryGradient,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.3),
              width: 1,
            ),
          ),
          child: const Text(
            'Подписаться',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    } else {
      return count.toString();
    }
  }
}

