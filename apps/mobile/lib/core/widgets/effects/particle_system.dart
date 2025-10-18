import 'dart:math';
import 'package:flutter/material.dart';

/// Particle System для эффектов (конфетти, звёздочки, искры)
class ParticleSystem extends StatefulWidget {
  final ParticleType type;
  final int particleCount;
  final Duration duration;
  final VoidCallback? onComplete;

  const ParticleSystem({
    super.key,
    required this.type,
    this.particleCount = 50,
    this.duration = const Duration(seconds: 2),
    this.onComplete,
  });

  @override
  State<ParticleSystem> createState() => _ParticleSystemState();
}

class _ParticleSystemState extends State<ParticleSystem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Particle> _particles;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _particles = List.generate(
      widget.particleCount,
      (index) => _createParticle(),
    );

    _controller.forward().then((_) {
      widget.onComplete?.call();
    });
  }

  Particle _createParticle() {
    switch (widget.type) {
      case ParticleType.confetti:
        return _createConfetti();
      case ParticleType.stars:
        return _createStar();
      case ParticleType.hearts:
        return _createHeart();
      case ParticleType.sparkles:
        return _createSparkle();
    }
  }

  Particle _createConfetti() {
    return Particle(
      x: _random.nextDouble(),
      y: -0.1,
      vx: (_random.nextDouble() - 0.5) * 2,
      vy: _random.nextDouble() * 2 + 1,
      rotation: _random.nextDouble() * 360,
      rotationSpeed: (_random.nextDouble() - 0.5) * 720,
      color: _randomColor(),
      size: _random.nextDouble() * 8 + 4,
      shape: ParticleShape.rectangle,
    );
  }

  Particle _createStar() {
    final angle = _random.nextDouble() * 2 * pi;
    final distance = _random.nextDouble() * 0.3;
    
    return Particle(
      x: 0.5 + cos(angle) * distance,
      y: 0.5 + sin(angle) * distance,
      vx: cos(angle) * 0.5,
      vy: sin(angle) * 0.5,
      rotation: 0,
      rotationSpeed: _random.nextDouble() * 360,
      color: Colors.yellow,
      size: _random.nextDouble() * 12 + 8,
      shape: ParticleShape.star,
      alpha: 1.0,
    );
  }

  Particle _createHeart() {
    return Particle(
      x: 0.5 + (_random.nextDouble() - 0.5) * 0.3,
      y: 1.1,
      vx: (_random.nextDouble() - 0.5) * 0.5,
      vy: -(_random.nextDouble() * 1.5 + 1),
      rotation: _random.nextDouble() * 30 - 15,
      rotationSpeed: (_random.nextDouble() - 0.5) * 180,
      color: const Color(0xFFFF6600),
      size: _random.nextDouble() * 20 + 15,
      shape: ParticleShape.heart,
      alpha: 1.0,
    );
  }

  Particle _createSparkle() {
    return Particle(
      x: _random.nextDouble(),
      y: _random.nextDouble(),
      vx: 0,
      vy: 0,
      rotation: _random.nextDouble() * 360,
      rotationSpeed: _random.nextDouble() * 180,
      color: Colors.white,
      size: _random.nextDouble() * 6 + 3,
      shape: ParticleShape.circle,
      alpha: 1.0,
      lifetime: _random.nextDouble() * 0.5 + 0.3,
    );
  }

  Color _randomColor() {
    final colors = [
      const Color(0xFFFF6600),
      const Color(0xFFFF8833),
      const Color(0xFF00C853),
      const Color(0xFF2196F3),
      const Color(0xFFE91E63),
      const Color(0xFFFFEB3B),
    ];
    return colors[_random.nextInt(colors.length)];
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
          painter: ParticlePainter(
            particles: _particles,
            progress: _controller.value,
          ),
          child: Container(),
        );
      },
    );
  }
}

class ParticlePainter extends CustomPainter {
  final List<Particle> particles;
  final double progress;

  ParticlePainter({
    required this.particles,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (var particle in particles) {
      final paint = Paint()
        ..color = particle.color.withValues(alpha: 
          particle.alpha * (1 - progress),
        );

      final x = (particle.x + particle.vx * progress) * size.width;
      final y = (particle.y + particle.vy * progress) * size.height;
      final rotation = particle.rotation + particle.rotationSpeed * progress;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rotation * pi / 180);

      switch (particle.shape) {
        case ParticleShape.circle:
          canvas.drawCircle(Offset.zero, particle.size / 2, paint);
          break;
        case ParticleShape.rectangle:
          canvas.drawRect(
            Rect.fromCenter(
              center: Offset.zero,
              width: particle.size,
              height: particle.size,
            ),
            paint,
          );
          break;
        case ParticleShape.star:
          _drawStar(canvas, particle.size, paint);
          break;
        case ParticleShape.heart:
          _drawHeart(canvas, particle.size, paint);
          break;
      }

      canvas.restore();
    }
  }

  void _drawStar(Canvas canvas, double size, Paint paint) {
    final path = Path();
    const points = 5;
    final outerRadius = size / 2;
    final innerRadius = size / 4;

    for (var i = 0; i < points * 2; i++) {
      final radius = i.isEven ? outerRadius : innerRadius;
      final angle = (i * pi / points) - pi / 2;
      final x = cos(angle) * radius;
      final y = sin(angle) * radius;

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    path.close();
    canvas.drawPath(path, paint);
  }

  void _drawHeart(Canvas canvas, double size, Paint paint) {
    final path = Path();
    final scale = size / 100;

    path.moveTo(50 * scale, 80 * scale);
    
    // Left curve
    path.cubicTo(
      50 * scale, 60 * scale,
      20 * scale, 40 * scale,
      20 * scale, 20 * scale,
    );
    path.cubicTo(
      20 * scale, 0 * scale,
      35 * scale, 0 * scale,
      50 * scale, 20 * scale,
    );
    
    // Right curve
    path.cubicTo(
      65 * scale, 0 * scale,
      80 * scale, 0 * scale,
      80 * scale, 20 * scale,
    );
    path.cubicTo(
      80 * scale, 40 * scale,
      50 * scale, 60 * scale,
      50 * scale, 80 * scale,
    );

    canvas.translate(-50 * scale, -40 * scale);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(ParticlePainter oldDelegate) => true;
}

enum ParticleType {
  confetti,
  stars,
  hearts,
  sparkles,
}

enum ParticleShape {
  circle,
  rectangle,
  star,
  heart,
}

class Particle {
  final double x;
  final double y;
  final double vx;
  final double vy;
  final double rotation;
  final double rotationSpeed;
  final Color color;
  final double size;
  final ParticleShape shape;
  final double alpha;
  final double lifetime;

  Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.rotation,
    required this.rotationSpeed,
    required this.color,
    required this.size,
    required this.shape,
    this.alpha = 1.0,
    this.lifetime = 1.0,
  });
}

