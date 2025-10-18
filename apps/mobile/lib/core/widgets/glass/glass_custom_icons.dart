import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';
import '../../theme/animations.dart';
import 'dart:ui';

class GlassCustomIcon extends StatelessWidget {
  final IconData icon;
  final Color? color;
  final double size;
  final double blurSigma;
  final double borderRadius;
  final EdgeInsets padding;

  const GlassCustomIcon({
    super.key,
    required this.icon,
    this.color,
    this.size = 24.0,
    this.blurSigma = 5.0,
    this.borderRadius = 8.0,
    this.padding = const EdgeInsets.all(4.0),
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? Colors.white;
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: effectiveColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(color: effectiveColor.withValues(alpha: 0.2), width: 0.5),
          ),
          child: Icon(icon, color: effectiveColor, size: size),
        ),
      ),
    );
  }
}

class GlassPulsatingIcon extends StatefulWidget {
  final IconData icon;
  final Color? color;
  final double size;
  final bool isActive;
  final Duration duration;

  const GlassPulsatingIcon({
    super.key,
    required this.icon,
    this.color,
    this.size = 24.0,
    this.isActive = false,
    this.duration = const Duration(milliseconds: 1000),
  });

  @override
  State<GlassPulsatingIcon> createState() => _GlassPulsatingIconState();
}

class _GlassPulsatingIconState extends State<GlassPulsatingIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
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

    if (widget.isActive) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(GlassPulsatingIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
        _controller.reset();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = widget.color ?? LiquidGlassColors.primaryOrange;
    
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.isActive 
                  ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.2)
                  : Colors.transparent,
              border: Border.all(
                color: widget.isActive 
                    ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.3)
                    : Colors.transparent,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: LiquidGlassColors.primaryOrange.withValues(alpha: _glowAnimation.value * 0.3),
                  blurRadius: 15 * _glowAnimation.value,
                  spreadRadius: 3 * _glowAnimation.value,
                ),
              ],
            ),
            child: Icon(
              widget.icon,
              color: effectiveColor,
              size: widget.size,
            ),
          ),
        );
      },
    );
  }
}

class GlassOnlineIndicator extends StatelessWidget {
  final bool isOnline;
  final double size;

  const GlassOnlineIndicator({
    super.key,
    required this.isOnline,
    this.size = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isOnline ? Colors.green : Colors.grey,
        border: Border.all(
          color: Colors.white,
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: (isOnline ? Colors.green : Colors.grey).withValues(alpha: 0.3),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
    );
  }
}