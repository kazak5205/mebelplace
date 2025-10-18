/// Glass Bottom Sheet Widget for Flutter
/// <200 lines as per STRICT_RULES
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/glass_theme.dart';

class GlassBottomSheet extends StatelessWidget {
  final Widget child;
  final String? title;
  final bool glass;
  final bool draggable;

  const GlassBottomSheet({
    Key? key,
    required this.child,
    this.title,
    this.glass = true,
    this.draggable = true,
  }) : super(key: key);

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    String? title,
    bool glass = true,
    bool draggable = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => GlassBottomSheet(
        title: title,
        glass: glass,
        draggable: draggable,
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ClipRRect(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(GlassTheme.radiusXl),
        topRight: Radius.circular(GlassTheme.radiusXl),
      ),
      child: BackdropFilter(
        filter: glass ? GlassTheme.glassBlurFilter() : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
        child: Container(
          decoration: BoxDecoration(
            color: glass
                ? (isDark ? Color(0xFF141414).withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.9))
                : (isDark ? Color(0xFF1A1A1A) : Colors.white),
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(GlassTheme.radiusXl),
              topRight: Radius.circular(GlassTheme.radiusXl),
            ),
            border: glass
                ? Border(
                    top: BorderSide(
                      color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.white.withValues(alpha: 0.2),
                    ),
                  )
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (draggable)
                Container(
                  margin: EdgeInsets.only(top: GlassTheme.spacing4),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              if (title != null)
                Container(
                  padding: EdgeInsets.all(GlassTheme.spacing4),
                  child: Text(
                    title!,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              Flexible(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(GlassTheme.spacing6),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

