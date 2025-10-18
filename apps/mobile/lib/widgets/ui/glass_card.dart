/// Glass Card Widget for Flutter
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/glass_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final bool glass;
  final bool elevated;
  final EdgeInsets? padding;

  const GlassCard({
    Key? key,
    required this.child,
    this.glass = true,
    this.elevated = false,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = glass
        ? (isDark ? Color(0xFF141414).withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.7))
        : (isDark ? Color(0xFF1A1A1A) : Color(0xFFF8F8F8));

    return ClipRRect(
      borderRadius: BorderRadius.circular(GlassTheme.radiusLg),
      child: BackdropFilter(
        filter: glass
            ? GlassTheme.glassBlurFilter()
            : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
        child: Container(
          padding: padding ?? EdgeInsets.all(GlassTheme.spacing4),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(GlassTheme.radiusLg),
            border: glass
                ? Border.all(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.1)
                        : Colors.white.withValues(alpha: 0.2),
                  )
                : null,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: elevated ? 0.16 : 0.08),
                blurRadius: elevated ? 32 : 16,
                offset: Offset(0, elevated ? 8 : 4),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}
