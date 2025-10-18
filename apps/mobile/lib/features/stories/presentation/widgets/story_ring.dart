import 'package:flutter/material.dart';
import '../../../../../../../core/theme/liquid_glass_colors.dart';
import '../../domain/entities/story_entity.dart';

/// Story Ring Widget (circle with gradient border for unviewed stories)
class StoryRing extends StatelessWidget {
  final StoryGroup storyGroup;
  final VoidCallback onTap;
  final double size;

  const StoryRing({
    super.key,
    required this.storyGroup,
    required this.onTap,
    this.size = 72,
  });

  @override
  Widget build(BuildContext context) {
    final hasUnviewed = storyGroup.hasUnviewed;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: size,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Story Ring
            Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: hasUnviewed
                    ? LiquidGlassColors.primaryGradient
                    : null,
                border: !hasUnviewed
                    ? Border.all(
                        color: Colors.grey.withValues(alpha: 0.3),
                        width: 2,
                      )
                    : null,
              ),
              padding: const EdgeInsets.all(3),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black,
                  border: Border.all(
                    color: Colors.black,
                    width: 3,
                  ),
                ),
                child: ClipOval(
                  child: storyGroup.authorAvatar != null
                      ? Image.network(
                          storyGroup.authorAvatar!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallbackAvatar(),
                        )
                      : _buildFallbackAvatar(),
                ),
              ),
            ),

            const SizedBox(height: 4),

            // Author Name
            Text(
              storyGroup.authorName,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFallbackAvatar() {
    return Container(
      color: LiquidGlassColors.primaryOrange,
      child: Center(
        child: Text(
          storyGroup.authorName.substring(0, 1).toUpperCase(),
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}


