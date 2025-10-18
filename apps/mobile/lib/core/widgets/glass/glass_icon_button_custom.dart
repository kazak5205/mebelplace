import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';
import '../../theme/animations.dart';

/// Кастомная glass кнопка с иконкой в стиле TikTok/Instagram
class GlassIconButtonCustom extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final Color? iconColor;
  final double iconSize;
  final EdgeInsets padding;
  final double blurSigma;
  final double borderRadius;
  final bool enableHapticFeedback;
  final Duration animationDuration;
  final bool showGlow;

  const GlassIconButtonCustom({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.iconColor,
    this.iconSize = 24.0,
    this.padding = const EdgeInsets.all(8.0),
    this.blurSigma = 10.0,
    this.borderRadius = 12.0,
    this.enableHapticFeedback = true,
    this.animationDuration = const Duration(milliseconds: 200),
    this.showGlow = false,
  });

  @override
  State<GlassIconButtonCustom> createState() => _GlassIconButtonCustomState();
}

class _GlassIconButtonCustomState extends State<GlassIconButtonCustom>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    if (widget.enableHapticFeedback) {
      HapticFeedback.lightImpact();
    }
    
    _controller.forward().then((_) {
      _controller.reverse();
    });
    
    widget.onPressed();
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = widget.iconColor ?? Colors.white;
    
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(widget.borderRadius),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: widget.blurSigma, sigmaY: widget.blurSigma),
                child: Container(
                  padding: widget.padding,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        LiquidGlassColors.primaryOrange.withValues(alpha: 0.8),
                        LiquidGlassColors.primaryOrange.withValues(alpha: 0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(widget.borderRadius),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                      width: 1.0,
                    ),
                    boxShadow: widget.showGlow
                        ? [
                            BoxShadow(
                              color: LiquidGlassColors.primaryOrange.withValues(alpha: _glowAnimation.value * 0.3),
                              blurRadius: 20 * _glowAnimation.value,
                              spreadRadius: 5 * _glowAnimation.value,
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    widget.icon,
                    color: effectiveColor,
                    size: widget.iconSize,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}