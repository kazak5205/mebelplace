import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

/// Spring Animation (физика пружины)
class SpringAnimation extends StatefulWidget {
  final Widget child;
  final bool trigger;
  final VoidCallback? onComplete;

  const SpringAnimation({
    super.key,
    required this.child,
    required this.trigger,
    this.onComplete,
  });

  @override
  State<SpringAnimation> createState() => _SpringAnimationState();
}

class _SpringAnimationState extends State<SpringAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.elasticOut,
      ),
    );

    if (widget.trigger) {
      _controller.forward().then((_) => widget.onComplete?.call());
    }
  }

  @override
  void didUpdateWidget(SpringAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.trigger != oldWidget.trigger && widget.trigger) {
      _controller.reset();
      _controller.forward().then((_) => widget.onComplete?.call());
    }
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
        return Transform.scale(
          scale: _animation.value,
          child: widget.child,
        );
      },
    );
  }
}

/// Magnetic Snap Effect (магнитное притяжение)
class MagneticSnap extends StatefulWidget {
  final Widget child;
  final Alignment snapTo;
  final double magneticRadius;

  const MagneticSnap({
    super.key,
    required this.child,
    this.snapTo = Alignment.center,
    this.magneticRadius = 50.0,
  });

  @override
  State<MagneticSnap> createState() => _MagneticSnapState();
}

class _MagneticSnapState extends State<MagneticSnap>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Offset _dragOffset = Offset.zero;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    setState(() {
      _dragOffset += details.delta;
      
      // Check if within magnetic radius (implicit snap detection)
      final distance = _dragOffset.distance;
      final isSnapped = distance < widget.magneticRadius;
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    // Snap back to position with spring physics
    final spring = SpringDescription(
      mass: 1.0,
      stiffness: 500.0,
      damping: 20.0,
    );

    final simulation = SpringSimulation(
      spring,
      _dragOffset.distance,
      0,
      details.velocity.pixelsPerSecond.distance,
    );

    _controller.animateWith(simulation);
    
    _controller.addListener(() {
      setState(() {
        _dragOffset = Offset(
          _dragOffset.dx * (1 - _controller.value),
          _dragOffset.dy * (1 - _controller.value),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanUpdate: _handleDragUpdate,
      onPanEnd: _handleDragEnd,
      child: Transform.translate(
        offset: _dragOffset,
        child: widget.child,
      ),
    );
  }
}

/// Elastic Scroll Behavior
class ElasticScrollBehavior extends ScrollBehavior {
  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const BouncingScrollPhysics(
      parent: AlwaysScrollableScrollPhysics(),
    );
  }
}

/// Fluid Gesture (плавное перетаскивание с физикой)
class FluidGesture extends StatefulWidget {
  final Widget child;
  final VoidCallback? onSwipeLeft;
  final VoidCallback? onSwipeRight;
  final double threshold;

  const FluidGesture({
    super.key,
    required this.child,
    this.onSwipeLeft,
    this.onSwipeRight,
    this.threshold = 100.0,
  });

  @override
  State<FluidGesture> createState() => _FluidGestureState();
}

class _FluidGestureState extends State<FluidGesture>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragExtent = 0.0;
  bool _isDragging = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleDragStart(DragStartDetails details) {
    setState(() => _isDragging = true);
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    setState(() {
      _dragExtent += details.primaryDelta ?? 0;
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    if (_dragExtent.abs() > widget.threshold) {
      if (_dragExtent > 0) {
        widget.onSwipeRight?.call();
      } else {
        widget.onSwipeLeft?.call();
      }
    }

    // Spring back
    _controller.reset();
    _controller.forward().then((_) {
      setState(() {
        _dragExtent = 0;
        _isDragging = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragStart: _handleDragStart,
      onHorizontalDragUpdate: _handleDragUpdate,
      onHorizontalDragEnd: _handleDragEnd,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final animatedDragExtent = _dragExtent * (1 - _controller.value);
          
          return Transform(
            transform: Matrix4.identity()
              ..translate(animatedDragExtent, 0, 0)
              ..rotateZ(animatedDragExtent * 0.003),
            child: Opacity(
              opacity: 1.0 - (_dragExtent.abs() / widget.threshold * 0.3).clamp(0.0, 0.3),
              child: widget.child,
            ),
          );
        },
      ),
    );
  }
}

/// Bounce Animation (отскок)
class BounceAnimation extends StatefulWidget {
  final Widget child;
  final bool trigger;

  const BounceAnimation({
    super.key,
    required this.child,
    required this.trigger,
  });

  @override
  State<BounceAnimation> createState() => _BounceAnimationState();
}

class _BounceAnimationState extends State<BounceAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _animation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.elasticOut,
      ),
    );

    if (widget.trigger) {
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  void didUpdateWidget(BounceAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.trigger != oldWidget.trigger && widget.trigger) {
      _controller.reset();
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _animation,
      child: widget.child,
    );
  }
}

