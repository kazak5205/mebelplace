import 'package:flutter/material.dart';

/// Advanced Shimmer Effect с градиентами
class ShimmerEffect extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Color baseColor;
  final Color highlightColor;
  final ShimmerDirection direction;

  const ShimmerEffect({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 1500),
    this.baseColor = const Color(0xFFE0E0E0),
    this.highlightColor = const Color(0xFFF5F5F5),
    this.direction = ShimmerDirection.leftToRight,
  });

  @override
  State<ShimmerEffect> createState() => _ShimmerEffectState();
}

class _ShimmerEffectState extends State<ShimmerEffect>
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
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return _createGradient(bounds).createShader(bounds);
          },
          child: widget.child,
        );
      },
    );
  }

  Gradient _createGradient(Rect bounds) {
    final percent = _controller.value;
    
    switch (widget.direction) {
      case ShimmerDirection.leftToRight:
        return LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            widget.baseColor,
            widget.highlightColor,
            widget.baseColor,
          ],
          stops: [
            max(0, percent - 0.3),
            percent,
            min(1, percent + 0.3),
          ],
        );
      case ShimmerDirection.topToBottom:
        return LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            widget.baseColor,
            widget.highlightColor,
            widget.baseColor,
          ],
          stops: [
            max(0, percent - 0.3),
            percent,
            min(1, percent + 0.3),
          ],
        );
    }
  }

  double max(double a, double b) => a > b ? a : b;
  double min(double a, double b) => a < b ? a : b;
}

enum ShimmerDirection {
  leftToRight,
  topToBottom,
}

/// Gradient Mesh Effect (advanced shader)
class GradientMeshEffect extends StatefulWidget {
  final Widget child;
  final List<Color> colors;
  final Duration duration;

  const GradientMeshEffect({
    super.key,
    required this.child,
    required this.colors,
    this.duration = const Duration(seconds: 3),
  });

  @override
  State<GradientMeshEffect> createState() => _GradientMeshEffectState();
}

class _GradientMeshEffectState extends State<GradientMeshEffect>
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
        return CustomPaint(
          painter: GradientMeshPainter(
            colors: widget.colors,
            progress: _controller.value,
          ),
          child: widget.child,
        );
      },
    );
  }
}

class GradientMeshPainter extends CustomPainter {
  final List<Color> colors;
  final double progress;

  GradientMeshPainter({
    required this.colors,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    
    // Animated gradient mesh
    final gradient = SweepGradient(
      center: Alignment.center,
      startAngle: progress * 2 * 3.14159,
      endAngle: (progress + 1) * 2 * 3.14159,
      colors: [
        ...colors,
        colors.first,
      ],
    );

    final paint = Paint()
      ..shader = gradient.createShader(rect)
      ..blendMode = BlendMode.overlay;

    canvas.drawRect(rect, paint);
  }

  @override
  bool shouldRepaint(GradientMeshPainter oldDelegate) => true;
}

