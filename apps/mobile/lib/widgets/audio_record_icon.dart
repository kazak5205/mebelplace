import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../core/theme/app_theme.dart';

class AudioRecordIcon extends StatefulWidget {
  final VoidCallback? onTap;
  final bool isAnimating;
  final bool isPlaying;
  final double size;

  const AudioRecordIcon({
    super.key,
    this.onTap,
    this.isAnimating = true,
    this.isPlaying = false,
    this.size = 40.0,
  });

  @override
  State<AudioRecordIcon> createState() => _AudioRecordIconState();
}

class _AudioRecordIconState extends State<AudioRecordIcon>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late AnimationController _waveController;
  late AnimationController _glowController;
  
  late Animation<double> _rotationAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _waveAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    // Контроллер вращения пластинки
    _rotationController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );
    
    // Контроллер пульсации
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    // Контроллер звуковых волн
    _waveController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    
    // Контроллер свечения
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    );

    // Анимация вращения с реалистичным ускорением
    _rotationAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _rotationController,
      curve: Curves.easeInOut,
    ));

    // Анимация пульсации
    _pulseAnimation = Tween<double>(
      begin: 0.95,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // Анимация звуковых волн
    _waveAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _waveController,
      curve: Curves.easeOut,
    ));

    // Анимация свечения
    _glowAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    _startAnimations();
  }

  void _startAnimations() {
    if (widget.isAnimating) {
      _rotationController.repeat();
      _pulseController.repeat(reverse: true);
      _waveController.repeat();
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(AudioRecordIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isAnimating != oldWidget.isAnimating) {
      if (widget.isAnimating) {
        _startAnimations();
      } else {
        _rotationController.stop();
        _pulseController.stop();
        _waveController.stop();
        _glowController.stop();
      }
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    _waveController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        width: widget.size + 20, // Дополнительное место для волн
        height: widget.size + 20,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Звуковые волны
            if (widget.isPlaying) _buildSoundWaves(),
            
            // Основная пластинка
            AnimatedBuilder(
              animation: Listenable.merge([
                _rotationAnimation,
                _pulseAnimation,
                _glowAnimation,
              ]),
              builder: (context, child) {
                return Transform.scale(
                  scale: _pulseAnimation.value,
                  child: Container(
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blue.withValues(alpha: 0.3 * _glowAnimation.value),
                          blurRadius: 15 * _glowAnimation.value,
                          spreadRadius: 2 * _glowAnimation.value,
                        ),
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Transform.rotate(
                      angle: _rotationAnimation.value * 2 * math.pi,
                      child: CustomPaint(
                        size: Size(widget.size, widget.size),
                        painter: EnhancedVinylRecordPainter(
                          isPlaying: widget.isPlaying,
                          glowIntensity: _glowAnimation.value,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSoundWaves() {
    return AnimatedBuilder(
      animation: _waveAnimation,
      builder: (context, child) {
        return CustomPaint(
          size: Size(widget.size + 20, widget.size + 20),
          painter: SoundWavesPainter(
            animationValue: _waveAnimation.value,
            isPlaying: widget.isPlaying,
          ),
        );
      },
    );
  }
}

class EnhancedVinylRecordPainter extends CustomPainter {
  final bool isPlaying;
  final double glowIntensity;

  EnhancedVinylRecordPainter({
    this.isPlaying = false,
    this.glowIntensity = 0.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Градиентный фон пластинки
    final recordGradient = RadialGradient(
      colors: [
        Colors.black87,
        Colors.black54,
        Colors.black87,
      ],
      stops: const [0.0, 0.7, 1.0],
    );

    final recordPaint = Paint()
      ..shader = recordGradient.createShader(Rect.fromCircle(center: center, radius: radius - 2))
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(center, radius - 2, recordPaint);

    // Внешнее кольцо с градиентом
    final outerRingGradient = LinearGradient(
      colors: [
        Colors.blue,
        Colors.blue.withValues(alpha: 0.8),
        Colors.blue,
      ],
    );

    final outerRingPaint = Paint()
      ..shader = outerRingGradient.createShader(Rect.fromCircle(center: center, radius: radius - 2))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    
    canvas.drawCircle(center, radius - 2, outerRingPaint);

    // Детализированные канавки
    final groovePaint = Paint()
      ..color = Colors.grey.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;

    // Основные канавки
    for (double r = radius * 0.25; r < radius - 6; r += 4) {
      canvas.drawCircle(center, r, groovePaint);
    }

    // Мелкие канавки
    final fineGroovePaint = Paint()
      ..color = Colors.grey.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.3;

    for (double r = radius * 0.3; r < radius - 8; r += 1.5) {
      canvas.drawCircle(center, r, fineGroovePaint);
    }

    // Лейбл пластинки
    final labelGradient = RadialGradient(
      colors: [
        Colors.white,
        Colors.grey.shade200,
        Colors.grey.shade300,
      ],
    );

    final labelPaint = Paint()
      ..shader = labelGradient.createShader(Rect.fromCircle(center: center, radius: radius * 0.35))
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(center, radius * 0.35, labelPaint);

    // Центральная дырка с бликом
    final holeGradient = RadialGradient(
      colors: [
        Colors.blue,
        Colors.blue.withValues(alpha: 0.8),
        Colors.blue.withValues(alpha: 0.6),
      ],
    );

    final holePaint = Paint()
      ..shader = holeGradient.createShader(Rect.fromCircle(center: center, radius: radius * 0.15))
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(center, radius * 0.15, holePaint);

    // Блик на дырке
    final highlightPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(
      Offset(center.dx - radius * 0.05, center.dy - radius * 0.05), 
      radius * 0.05, 
      highlightPaint
    );

    // Центральная точка
    final centerDotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(center, radius * 0.03, centerDotPaint);

    // Блики на пластинке (если играет)
    if (isPlaying) {
      final shinePaint = Paint()
        ..color = Colors.white.withValues(alpha: 0.3 * glowIntensity)
        ..style = PaintingStyle.fill;

      // Блик в верхней части
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - 4),
        -math.pi / 4,
        math.pi / 2,
        true,
        shinePaint,
      );
    }

    // Текст на лейбле
    final textPainter = TextPainter(
      text: TextSpan(
        text: 'MebelPlace',
        style: TextStyle(
          color: Colors.black87,
          fontSize: radius * 0.08,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        center.dx - textPainter.width / 2,
        center.dy - textPainter.height / 2,
      ),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    if (oldDelegate is EnhancedVinylRecordPainter) {
      return oldDelegate.isPlaying != isPlaying || 
             oldDelegate.glowIntensity != glowIntensity;
    }
    return true;
  }
}

class SoundWavesPainter extends CustomPainter {
  final double animationValue;
  final bool isPlaying;

  SoundWavesPainter({
    required this.animationValue,
    this.isPlaying = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (!isPlaying) return;

    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width / 2;

    // Создаем несколько концентрических волн
    for (int i = 0; i < 3; i++) {
      final waveRadius = baseRadius + 10 + (i * 15) + (animationValue * 20);
      final opacity = (1.0 - (waveRadius - baseRadius) / 50).clamp(0.0, 1.0) * 
                     (1.0 - animationValue) * 0.6;

      if (opacity > 0) {
        final wavePaint = Paint()
          ..color = Colors.blue.withValues(alpha: opacity)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;

        canvas.drawCircle(center, waveRadius, wavePaint);
      }
    }

    // Дополнительные мелкие волны
    for (int i = 0; i < 5; i++) {
      final waveRadius = baseRadius + 5 + (i * 8) + (animationValue * 15);
      final opacity = (1.0 - (waveRadius - baseRadius) / 40).clamp(0.0, 1.0) * 
                     (1.0 - animationValue) * 0.3;

      if (opacity > 0) {
        final wavePaint = Paint()
          ..color = Colors.blue.withValues(alpha: opacity)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.0;

        canvas.drawCircle(center, waveRadius, wavePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    if (oldDelegate is SoundWavesPainter) {
      return oldDelegate.animationValue != animationValue || 
             oldDelegate.isPlaying != isPlaying;
    }
    return true;
  }
}
