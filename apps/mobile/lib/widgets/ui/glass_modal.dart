/// Glass Modal Widget for Flutter
/// <200 lines as per STRICT_RULES
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/glass_theme.dart';

class GlassModal extends StatelessWidget {
  final Widget child;
  final String? title;
  final bool glass;
  final VoidCallback? onClose;

  const GlassModal({
    Key? key,
    required this.child,
    this.title,
    this.glass = true,
    this.onClose,
  }) : super(key: key);

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    String? title,
    bool glass = true,
  }) {
    return showDialog<T>(
      context: context,
      builder: (context) => GlassModal(
        title: title,
        glass: glass,
        onClose: () => Navigator.of(context).pop(),
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(GlassTheme.radiusXl),
        child: BackdropFilter(
          filter: glass ? GlassTheme.glassBlurFilter() : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
          child: Container(
            constraints: BoxConstraints(maxWidth: 400),
            decoration: BoxDecoration(
              color: glass
                  ? (isDark ? Color(0xFF141414).withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.9))
                  : (isDark ? Color(0xFF1A1A1A) : Colors.white),
              borderRadius: BorderRadius.circular(GlassTheme.radiusXl),
              border: glass
                  ? Border.all(
                      color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.white.withValues(alpha: 0.2),
                    )
                  : null,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Container(
                    padding: EdgeInsets.all(GlassTheme.spacing6),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1),
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            title!,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (onClose != null)
                          IconButton(
                            icon: Icon(Icons.close),
                            onPressed: onClose,
                          ),
                      ],
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
      ),
    );
  }
}

