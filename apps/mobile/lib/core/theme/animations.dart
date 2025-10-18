/// Animation constants for Flutter
/// Based on mobile-api.yaml AppAnimations specification
import 'package:flutter/material.dart';

class AppAnimations {
  AppAnimations._();

  // Durations from tokens (milliseconds)
  static const Duration fast = Duration(milliseconds: 120);
  static const Duration defaultDuration = Duration(milliseconds: 240);
  static const Duration slow = Duration(milliseconds: 360);
  static const Duration slower = Duration(milliseconds: 500);

  // Double-tap like animation (350ms)
  static const Duration doubleTapLike = Duration(milliseconds: 350);

  // Skeleton pulse animation (1500ms)
  static const Duration skeletonPulse = Duration(milliseconds: 1500);

  // Bottom sheet durations
  static const Duration bottomSheetOpen = Duration(milliseconds: 240);
  static const Duration bottomSheetClose = Duration(milliseconds: 200);

  // Curves from tokens
  static const Curve defaultCurve = Cubic(0.2, 0.8, 0.2, 1.0);
  static const Curve easeIn = Cubic(0.4, 0.0, 1.0, 1.0);
  static const Curve easeOut = Cubic(0.0, 0.0, 0.2, 1.0);
  static const Curve spring = Cubic(0.68, -0.55, 0.265, 1.55);

  // Button press scale
  static const double buttonPressScale = 0.98;

  // Double-tap like scales
  static const double doubleTapLikeStart = 0.6;
  static const double doubleTapLikePeak = 1.4;
  static const double doubleTapLikeEnd = 1.0;

  /// Button press animation
  static AnimationController createButtonPressAnimation(TickerProvider vsync) {
    return AnimationController(
      duration: Duration(milliseconds: 60),
      vsync: vsync,
    );
  }

  /// Double-tap like animation
  static Animation<double> createDoubleTapLikeAnimation(AnimationController controller) {
    return TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: doubleTapLikeStart, end: doubleTapLikePeak)
            .chain(CurveTween(curve: spring)),
        weight: 57,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: doubleTapLikePeak, end: doubleTapLikeEnd)
            .chain(CurveTween(curve: spring)),
        weight: 43,
      ),
    ]).animate(controller);
  }

  /// Page transition animation
  static Widget pageTransition(Widget child, Animation<double> animation) {
    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.1),
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: animation,
          curve: defaultCurve,
        )),
        child: child,
      ),
    );
  }
}

