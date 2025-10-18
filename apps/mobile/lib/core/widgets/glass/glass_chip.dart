import 'dart:ui';
import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';

/// Glass Chip (для фильтров в поиске)
class GlassChip extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final IconData? icon;

  const GlassChip({
    super.key,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isActive
                  ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.2)
                  : (isDark
                      ? Colors.white.withValues(alpha: 0.1)
                      : Colors.white.withValues(alpha: 0.6)),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isActive
                    ? LiquidGlassColors.primaryOrange
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.2)
                        : Colors.black.withValues(alpha: 0.1)),
                width: isActive ? 2 : 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(
                    icon,
                    size: 16,
                    color: isActive
                        ? LiquidGlassColors.primaryOrange
                        : (isDark ? Colors.white : Colors.black),
                  ),
                  const SizedBox(width: 6),
                ],
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    color: isActive
                        ? LiquidGlassColors.primaryOrange
                        : (isDark ? Colors.white : Colors.black),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

