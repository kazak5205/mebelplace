import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';
import 'glass_panel.dart';
import 'glass_button.dart';

/// Advertisement Video Card
class GlassAdVideoCard extends StatelessWidget {
  final String title;
  final String description;
  final String? imageUrl;
  final String ctaText;
  final VoidCallback onTap;
  final VoidCallback onCtaTap;
  final VoidCallback? onSkip;

  const GlassAdVideoCard({
    super.key,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.ctaText,
    required this.onTap,
    required this.onCtaTap,
    this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background image
          if (imageUrl != null)
            CachedNetworkImage(
              imageUrl: imageUrl!,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: Colors.black,
                child: const Center(
                  child: CircularProgressIndicator(
                    color: LiquidGlassColors.primaryOrange,
                  ),
                ),
              ),
              errorWidget: (context, url, error) => Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                      Colors.black,
                    ],
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.video_library,
                    size: 64,
                    color: Colors.white54,
                  ),
                ),
              ),
            )
          else
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                    Colors.black,
                  ],
                ),
              ),
            ),

          // Dark overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.4),
                  Colors.black.withValues(alpha: 0.8),
                ],
              ),
            ),
          ),

          // AD Badge (top-right)
          Positioned(
            top: 16,
            right: 16,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.campaign,
                        size: 14,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        'Реклама',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Skip button (top-left)
          if (onSkip != null)
            Positioned(
              top: 16,
              left: 16,
              child: GestureDetector(
                onTap: onSkip,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.skip_next,
                            size: 16,
                            color: Colors.white,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Пропустить',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

          // Content (bottom)
          Positioned(
            bottom: 80,
            left: 16,
            right: 16,
            child: GlassPanel(
              padding: const EdgeInsets.all(20),
              borderRadius: 24,
              color: Colors.black.withValues(alpha: 0.4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title
                  Text(
                    title,
                    style: LiquidGlassTextStyles.h2Light(context).copyWith(
                      fontSize: 20,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 12),

                  // Description
                  Text(
                    description,
                    style: LiquidGlassTextStyles.bodySecondary(true),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 20),

                  // CTA Button
                  GlassButton.primary(
                    ctaText,
                    icon: const Icon(
                      Icons.arrow_forward,
                      size: 20,
                      color: Colors.white,
                    ),
                    onTap: onCtaTap,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


