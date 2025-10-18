import 'package:flutter/material.dart';

class SlidePageRoute<T> extends PageRouteBuilder<T> {
  final Widget child;
  final SlideDirection direction;

  SlidePageRoute({
    required this.child,
    this.direction = SlideDirection.right,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionDuration: const Duration(milliseconds: 300),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0);
            const end = Offset.zero;
            const curve = Curves.easeInOut;

            var tween = Tween(begin: begin, end: end);
            var curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: curve,
            );

            return SlideTransition(
              position: tween.animate(curvedAnimation),
              child: child,
            );
          },
        );
}

class FadePageRoute<T> extends PageRouteBuilder<T> {
  final Widget child;

  FadePageRoute({required this.child})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionDuration: const Duration(milliseconds: 250),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        );
}

class ScalePageRoute<T> extends PageRouteBuilder<T> {
  final Widget child;

  ScalePageRoute({required this.child})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionDuration: const Duration(milliseconds: 300),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return ScaleTransition(
              scale: Tween<double>(
                begin: 0.0,
                end: 1.0,
              ).animate(
                CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInOut,
                ),
              ),
              child: child,
            );
          },
        );
}

class SlideUpPageRoute<T> extends PageRouteBuilder<T> {
  final Widget child;

  SlideUpPageRoute({required this.child})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionDuration: const Duration(milliseconds: 350),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(0.0, 1.0);
            const end = Offset.zero;
            const curve = Curves.easeOutCubic;

            var tween = Tween(begin: begin, end: end);
            var curvedAnimation = CurvedAnimation(
              parent: animation,
              curve: curve,
            );

            return SlideTransition(
              position: tween.animate(curvedAnimation),
              child: child,
            );
          },
        );
}

enum SlideDirection {
  left,
  right,
  up,
  down,
}

// Custom page transitions
class PageTransitions {
  static Route<T> slideRight<T>(Widget page) {
    return SlidePageRoute<T>(
      child: page,
      direction: SlideDirection.right,
    );
  }

  static Route<T> slideLeft<T>(Widget page) {
    return SlidePageRoute<T>(
      child: page,
      direction: SlideDirection.left,
    );
  }

  static Route<T> slideUp<T>(Widget page) {
    return SlideUpPageRoute<T>(child: page);
  }

  static Route<T> fade<T>(Widget page) {
    return FadePageRoute<T>(child: page);
  }

  static Route<T> scale<T>(Widget page) {
    return ScalePageRoute<T>(child: page);
  }
}
