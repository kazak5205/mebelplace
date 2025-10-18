import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';
import '../../theme/animations.dart';
import 'dart:ui';

class GlassCustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final EdgeInsets margin;
  final double blurSigma;
  final double borderRadius;
  final Color? backgroundColor;
  final List<Color>? gradientColors;
  final AlignmentGeometry gradientBegin;
  final AlignmentGeometry gradientEnd;
  final VoidCallback? onTap;

  const GlassCustomCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.margin = const EdgeInsets.symmetric(vertical: 8.0),
    this.blurSigma = 10.0,
    this.borderRadius = 16.0,
    this.backgroundColor,
    this.gradientColors,
    this.gradientBegin = Alignment.topLeft,
    this.gradientEnd = Alignment.bottomRight,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBackgroundColor = backgroundColor ?? LiquidGlassColors.darkGlass.withValues(alpha: 0.2);
    final effectiveGradientColors = gradientColors ??
        [
          effectiveBackgroundColor.withValues(alpha: 0.1),
          effectiveBackgroundColor.withValues(alpha: 0.05),
        ];

    return Container(
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: effectiveGradientColors,
                begin: gradientBegin,
                end: gradientEnd,
              ),
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.1),
                width: 0.5,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

class GlassAnimatedCard extends StatefulWidget {
  final Widget child;
  final EdgeInsets padding;
  final EdgeInsets margin;
  final double blurSigma;
  final double borderRadius;
  final Color? backgroundColor;
  final Color? glowColor;
  final VoidCallback? onTap;

  const GlassAnimatedCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.margin = const EdgeInsets.symmetric(vertical: 8.0),
    this.blurSigma = 10.0,
    this.borderRadius = 16.0,
    this.backgroundColor,
    this.glowColor,
    this.onTap,
  });

  @override
  State<GlassAnimatedCard> createState() => _GlassAnimatedCardState();
}

class _GlassAnimatedCardState extends State<GlassAnimatedCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.98,
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
    _controller.forward().then((_) {
      _controller.reverse();
    });
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap != null ? _handleTap : () {},
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              margin: widget.margin,
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
                          Colors.white.withValues(alpha: 0.1),
                          Colors.white.withValues(alpha: 0.05),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(widget.borderRadius),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.2),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (widget.glowColor ?? LiquidGlassColors.primaryOrange)
                              .withValues(alpha: _glowAnimation.value * 0.2),
                          blurRadius: 20 * _glowAnimation.value,
                          spreadRadius: 2 * _glowAnimation.value,
                        ),
                      ],
                    ),
                    child: widget.child,
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

class GlassUserCard extends StatelessWidget {
  final String name;
  final String? avatarUrl;
  final String? subtitle;
  final bool isOnline;
  final bool isFollowing;
  final VoidCallback? onTap;
  final VoidCallback? onFollow;

  const GlassUserCard({
    super.key,
    required this.name,
    this.avatarUrl,
    this.subtitle,
    this.isOnline = false,
    this.isFollowing = false,
    this.onTap,
    this.onFollow,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCustomCard(
      onTap: onTap,
      child: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 25,
                backgroundColor: LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                child: avatarUrl != null
                    ? ClipOval(
                        child: Image.network(
                          avatarUrl!,
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    LiquidGlassColors.primaryOrange,
                                    LiquidGlassColors.primaryOrange,
                                  ],
                                ),
                              ),
                              child: const Icon(
                                Icons.person,
                                color: Colors.white,
                                size: 24,
                              ),
                            );
                          },
                        ),
                      )
                    : Container(
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              LiquidGlassColors.primaryOrange,
                              LiquidGlassColors.primaryOrange,
                            ],
                          ),
                        ),
                        child: const Icon(
                          Icons.person,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
              ),
              if (isOnline)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white),
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
              ],
            ),
          ),
          if (onFollow != null)
            ElevatedButton(
              onPressed: onFollow,
              style: ElevatedButton.styleFrom(
                backgroundColor: isFollowing ? Colors.grey : LiquidGlassColors.primaryOrange,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              child: Text(
                isFollowing ? 'Отписаться' : 'Подписаться',
                style: const TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}