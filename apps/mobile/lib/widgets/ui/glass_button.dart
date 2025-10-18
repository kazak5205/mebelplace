/// Glass Button Widget for Flutter
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/glass_theme.dart';

enum GlassButtonVariant { primary, secondary, ghost, glass }
enum GlassButtonSize { sm, md, lg }

class GlassButton extends StatefulWidget {
  final String? text;
  final VoidCallback? onPressed;
  final GlassButtonVariant variant;
  final GlassButtonSize size;
  final bool loading;

  const GlassButton({
    Key? key,
    this.text,
    required this.onPressed,
    this.variant = GlassButtonVariant.primary,
    this.size = GlassButtonSize.md,
    this.loading = false,
  }) : super(key: key);

  @override
  State<GlassButton> createState() => _GlassButtonState();
}

class _GlassButtonState extends State<GlassButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: GlassTheme.durationFast),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: GlassTheme.defaultCurve),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final Color backgroundColor = widget.variant == GlassButtonVariant.glass
        ? (isDark ? Color(0xFF141414).withValues(alpha: 0.7) : Colors.white.withValues(alpha: 0.7))
        : GlassTheme.primary;
    
    return ScaleTransition(
      scale: _scaleAnimation,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(GlassTheme.radiusLg),
        child: BackdropFilter(
          filter: widget.variant == GlassButtonVariant.glass
              ? GlassTheme.glassBlurFilter()
              : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
          child: Material(
            color: backgroundColor,
            child: InkWell(
              onTap: widget.onPressed,
              onTapDown: (_) => _controller.forward(),
              onTapUp: (_) => _controller.reverse(),
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: GlassTheme.spacing6,
                  vertical: GlassTheme.spacing4,
                ),
                child: widget.loading
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        widget.text ?? '',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
