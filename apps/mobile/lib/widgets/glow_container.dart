import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class GlowContainer extends StatefulWidget {
  final Widget child;
  final Color? glowColor;
  final double? glowRadius;
  final double? blurRadius;
  final Duration? animationDuration;
  final bool animate;

  const GlowContainer({
    super.key,
    required this.child,
    this.glowColor,
    this.glowRadius,
    this.blurRadius,
    this.animationDuration,
    this.animate = true,
  });

  @override
  State<GlowContainer> createState() => _GlowContainerState();
}

class _GlowContainerState extends State<GlowContainer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration ?? const Duration(seconds: 2),
      vsync: this,
    );
    
    _animation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final glowColor = widget.glowColor ?? Colors.blue;
    final glowRadius = widget.glowRadius ?? 20.0;
    final blurRadius = widget.blurRadius ?? 15.0;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: glowColor.withValues(alpha: _animation.value * 0.6),
                blurRadius: blurRadius * _animation.value,
                spreadRadius: glowRadius * _animation.value,
              ),
              BoxShadow(
                color: glowColor.withValues(alpha: _animation.value * 0.3),
                blurRadius: (blurRadius * 2) * _animation.value,
                spreadRadius: (glowRadius * 1.5) * _animation.value,
              ),
            ],
          ),
          child: widget.child,
        );
      },
    );
  }
}

class NeonText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final Color? glowColor;
  final double? glowRadius;
  final bool animate;

  const NeonText(
    this.text, {
    super.key,
    this.style,
    this.glowColor,
    this.glowRadius,
    this.animate = true,
  });

  @override
  Widget build(BuildContext context) {
    final glowColor = this.glowColor ?? Colors.blue;
    final glowRadius = this.glowRadius ?? 10.0;

    return GlowContainer(
      glowColor: glowColor,
      glowRadius: glowRadius,
      blurRadius: glowRadius * 2,
      animate: animate,
      child: Text(
        text,
        style: style?.copyWith(
          color: glowColor,
          shadows: [
            Shadow(
              color: glowColor.withValues(alpha: 0.8),
              blurRadius: glowRadius,
            ),
            Shadow(
              color: glowColor.withValues(alpha: 0.6),
              blurRadius: glowRadius * 2,
            ),
          ],
        ) ?? TextStyle(
          color: glowColor,
          shadows: [
            Shadow(
              color: glowColor.withValues(alpha: 0.8),
              blurRadius: glowRadius,
            ),
            Shadow(
              color: glowColor.withValues(alpha: 0.6),
              blurRadius: glowRadius * 2,
            ),
          ],
        ),
      ),
    );
  }
}

class GradientGlowContainer extends StatelessWidget {
  final Widget child;
  final List<Color> gradientColors;
  final double? glowRadius;
  final double? blurRadius;
  final bool animate;

  const GradientGlowContainer({
    super.key,
    required this.child,
    required this.gradientColors,
    this.glowRadius,
    this.blurRadius,
    this.animate = true,
  });

  @override
  Widget build(BuildContext context) {
    return GlowContainer(
      glowColor: gradientColors.first,
      glowRadius: glowRadius,
      blurRadius: blurRadius,
      animate: animate,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: child,
      ),
    );
  }
}

class PulseContainer extends StatefulWidget {
  final Widget child;
  final Color? pulseColor;
  final Duration? duration;
  final double? minScale;
  final double? maxScale;

  const PulseContainer({
    super.key,
    required this.child,
    this.pulseColor,
    this.duration,
    this.minScale,
    this.maxScale,
  });

  @override
  State<PulseContainer> createState() => _PulseContainerState();
}

class _PulseContainerState extends State<PulseContainer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration ?? const Duration(seconds: 1),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: widget.minScale ?? 1.0,
      end: widget.maxScale ?? 1.1,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _opacityAnimation = Tween<double>(
      begin: 0.3,
      end: 0.8,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pulseColor = widget.pulseColor ?? Colors.blue;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: pulseColor.withValues(alpha: _opacityAnimation.value),
                  blurRadius: 20 * _opacityAnimation.value,
                  spreadRadius: 10 * _opacityAnimation.value,
                ),
              ],
            ),
            child: widget.child,
          ),
        );
      },
    );
  }
}
