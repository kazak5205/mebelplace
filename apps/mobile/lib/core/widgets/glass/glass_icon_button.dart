import 'dart:ui';
import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';

/// Glass Icon Button with optional count
class GlassIconButton extends StatelessWidget {
  final IconData icon;
  final String? count;
  final VoidCallback? onTap;
  final Color? color;
  final double size;

  const GlassIconButton({
    super.key,
    required this.icon,
    this.count,
    this.onTap,
    this.color,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? Colors.white;

    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1),
                ),
                child: Icon(icon, color: effectiveColor, size: size),
              ),
            ),
          ),
          if (count != null) ...[
            const SizedBox(height: 4),
            Text(count!, style: LiquidGlassTextStyles.caption.copyWith(color: Colors.white)),
          ],
        ],
      ),
    );
  }
}

