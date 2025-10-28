import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/theme/app_theme.dart';

/// Индикатор печати (как в iMessage/Telegram)
class TypingIndicator extends StatefulWidget {
  final Color dotColor;
  final double dotSize;

  const TypingIndicator({
    super.key,
    this.dotColor = AppColors.primary,
    this.dotSize = 8,
  });

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat();

    _animations = List.generate(3, (index) {
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(
            index * 0.2,
            0.6 + (index * 0.2),
            curve: Curves.easeInOut,
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 16.w,
        vertical: 12.h,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (index) {
          return AnimatedBuilder(
            animation: _animations[index],
            builder: (context, child) {
              return Container(
                margin: EdgeInsets.symmetric(horizontal: 2.w),
                child: Transform.translate(
                  offset: Offset(0, -8 * _animations[index].value),
                  child: Container(
                    width: widget.dotSize.w,
                    height: widget.dotSize.w,
                    decoration: BoxDecoration(
                      color: widget.dotColor.withOpacity(
                        0.3 + (0.7 * _animations[index].value),
                      ),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }
}

/// Typing indicator для списка чатов (показывается в preview)
class TypingIndicatorSmall extends StatefulWidget {
  const TypingIndicatorSmall({super.key});

  @override
  State<TypingIndicatorSmall> createState() => _TypingIndicatorSmallState();
}

class _TypingIndicatorSmallState extends State<TypingIndicatorSmall>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.more_horiz_rounded,
          size: 16.sp,
          color: AppColors.primary,
        ),
        SizedBox(width: 4.w),
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Opacity(
              opacity: 0.3 + (0.7 * _controller.value),
              child: Text(
                'печатает...',
                style: TextStyle(
                  fontSize: 13.sp,
                  color: AppColors.primary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

