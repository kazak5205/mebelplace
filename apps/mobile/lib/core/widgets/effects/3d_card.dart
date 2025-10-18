import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 3D Card с perspective и depth effects
class Card3D extends StatefulWidget {
  final Widget child;
  final double depth;
  final bool enableTilt;
  final bool enableHover;
  final Duration animationDuration;
  final VoidCallback? onTap;

  const Card3D({
    super.key,
    required this.child,
    this.depth = 20.0,
    this.enableTilt = true,
    this.enableHover = true,
    this.animationDuration = const Duration(milliseconds: 300),
    this.onTap,
  });

  @override
  State<Card3D> createState() => _Card3DState();
}

class _Card3DState extends State<Card3D>
    with SingleTickerProviderStateMixin {
  late AnimationController _hoverController;
  double _rotateX = 0.0;
  double _rotateY = 0.0;
  double _scale = 1.0;

  @override
  void initState() {
    super.initState();
    _hoverController = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );
  }

  @override
  void dispose() {
    _hoverController.dispose();
    super.dispose();
  }

  void _handlePanUpdate(DragUpdateDetails details, Size size) {
    if (!widget.enableTilt) return;

    setState(() {
      _rotateY = ((details.localPosition.dx / size.width) - 0.5) * 0.3;
      _rotateX = ((details.localPosition.dy / size.height) - 0.5) * -0.3;
    });
  }

  void _handlePanEnd(DragEndDetails details) {
    setState(() {
      _rotateX = 0.0;
      _rotateY = 0.0;
    });
  }

  void _handleTap() {
    HapticFeedback.mediumImpact();
    
    setState(() => _scale = 0.95);
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() => _scale = 1.0);
      }
    });

    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return MouseRegion(
          onEnter: (_) {
            if (widget.enableHover) {
              _hoverController.forward();
            }
          },
          onExit: (_) {
            if (widget.enableHover) {
              _hoverController.reverse();
            }
          },
          child: GestureDetector(
            onPanUpdate: (details) => _handlePanUpdate(details, constraints.biggest),
            onPanEnd: _handlePanEnd,
            onTap: _handleTap,
            child: AnimatedBuilder(
              animation: _hoverController,
              builder: (context, child) {
                final hoverScale = 1.0 + (_hoverController.value * 0.05);
                final elevation = _hoverController.value * widget.depth;

                return TweenAnimationBuilder<double>(
                  duration: widget.animationDuration,
                  tween: Tween(begin: _scale, end: _scale),
                  builder: (context, scale, child) {
                    return Transform(
                      alignment: Alignment.center,
                      transform: Matrix4.identity()
                        ..setEntry(3, 2, 0.001) // perspective
                        ..rotateX(_rotateX)
                        ..rotateY(_rotateY)
                        ..scale(scale * hoverScale),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1 + elevation / 100),
                              blurRadius: 10 + elevation,
                              offset: Offset(0, 5 + elevation / 2),
                            ),
                          ],
                        ),
                        child: widget.child,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        );
      },
    );
  }
}

/// Parallax Scrolling Effect
class ParallaxScrollEffect extends StatefulWidget {
  final Widget child;
  final double parallaxFactor;
  final ScrollController scrollController;

  const ParallaxScrollEffect({
    super.key,
    required this.child,
    required this.scrollController,
    this.parallaxFactor = 0.3,
  });

  @override
  State<ParallaxScrollEffect> createState() => _ParallaxScrollEffectState();
}

class _ParallaxScrollEffectState extends State<ParallaxScrollEffect> {
  double _offset = 0.0;

  @override
  void initState() {
    super.initState();
    widget.scrollController.addListener(_updateOffset);
  }

  @override
  void dispose() {
    widget.scrollController.removeListener(_updateOffset);
    super.dispose();
  }

  void _updateOffset() {
    setState(() {
      _offset = widget.scrollController.offset * widget.parallaxFactor;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: Offset(0, -_offset),
      child: widget.child,
    );
  }
}

/// Depth Layer Effect
class DepthLayer extends StatelessWidget {
  final Widget child;
  final double depth;
  final Color? shadowColor;

  const DepthLayer({
    super.key,
    required this.child,
    this.depth = 1.0,
    this.shadowColor,
  });

  @override
  Widget build(BuildContext context) {
    return Transform(
      transform: Matrix4.identity()
        ..setEntry(3, 2, 0.001)
        ..translate(0.0, 0.0, depth * 10),
      alignment: Alignment.center,
      child: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: (shadowColor ?? Colors.black).withValues(alpha: 0.2 * depth),
              blurRadius: 20 * depth,
              offset: Offset(0, 10 * depth),
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}

/// Floating Animation (для элементов, которые "плавают")
class FloatingAnimation extends StatefulWidget {
  final Widget child;
  final double amplitude;
  final Duration duration;

  const FloatingAnimation({
    super.key,
    required this.child,
    this.amplitude = 10.0,
    this.duration = const Duration(seconds: 3),
  });

  @override
  State<FloatingAnimation> createState() => _FloatingAnimationState();
}

class _FloatingAnimationState extends State<FloatingAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat(reverse: true);

    _animation = Tween<double>(
      begin: -widget.amplitude,
      end: widget.amplitude,
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

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _animation.value),
          child: widget.child,
        );
      },
    );
  }
}

/// Rotation 3D Animation
class Rotation3D extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Axis axis;

  const Rotation3D({
    super.key,
    required this.child,
    this.duration = const Duration(seconds: 2),
    this.axis = Axis.vertical,
  });

  @override
  State<Rotation3D> createState() => _Rotation3DState();
}

class _Rotation3DState extends State<Rotation3D>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final matrix = Matrix4.identity()
          ..setEntry(3, 2, 0.001);
        
        if (widget.axis == Axis.vertical) {
          matrix.rotateY(_controller.value * 2 * math.pi);
        } else {
          matrix.rotateX(_controller.value * 2 * math.pi);
        }

        return Transform(
          alignment: Alignment.center,
          transform: matrix,
          child: widget.child,
        );
      },
    );
  }
}

