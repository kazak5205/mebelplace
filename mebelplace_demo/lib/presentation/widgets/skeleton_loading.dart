import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Skeleton loading виджет с shimmer эффектом
class SkeletonLoading extends StatefulWidget {
  final double? width;
  final double? height;
  final double borderRadius;
  final BoxShape shape;

  const SkeletonLoading({
    super.key,
    this.width,
    this.height,
    this.borderRadius = 8,
    this.shape = BoxShape.rectangle,
  });

  @override
  State<SkeletonLoading> createState() => _SkeletonLoadingState();
}

class _SkeletonLoadingState extends State<SkeletonLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
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
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            shape: widget.shape,
            borderRadius: widget.shape == BoxShape.rectangle
                ? BorderRadius.circular(widget.borderRadius.r)
                : null,
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                Colors.grey[800]!,
                Colors.grey[700]!,
                Colors.grey[800]!,
              ],
              stops: [
                0.0,
                _animation.value / 4 + 0.5,
                1.0,
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Skeleton для видео карточки (TikTok стиль)
class SkeletonVideoCard extends StatelessWidget {
  const SkeletonVideoCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.black,
      child: Stack(
        children: [
          // Фон видео
          const Center(
            child: SkeletonLoading(
              width: double.infinity,
              height: double.infinity,
              borderRadius: 0,
            ),
          ),
          
          // Правая панель действий
          Positioned(
            right: 12.w,
            bottom: 140.h,
            child: Column(
              children: [
                SkeletonLoading(
                  width: 52.w,
                  height: 52.w,
                  shape: BoxShape.circle,
                ),
                SizedBox(height: 20.h),
                SkeletonLoading(
                  width: 40.w,
                  height: 40.w,
                  borderRadius: 20,
                ),
                SizedBox(height: 20.h),
                SkeletonLoading(
                  width: 40.w,
                  height: 40.w,
                  borderRadius: 20,
                ),
                SizedBox(height: 20.h),
                SkeletonLoading(
                  width: 40.w,
                  height: 40.w,
                  borderRadius: 20,
                ),
              ],
            ),
          ),
          
          // Нижняя информация
          Positioned(
            left: 12.w,
            right: 80.w,
            bottom: 24.h,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonLoading(
                  width: 150.w,
                  height: 20.h,
                  borderRadius: 4,
                ),
                SizedBox(height: 8.h),
                SkeletonLoading(
                  width: 250.w,
                  height: 16.h,
                  borderRadius: 4,
                ),
                SizedBox(height: 6.h),
                SkeletonLoading(
                  width: 200.w,
                  height: 16.h,
                  borderRadius: 4,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Skeleton для списка заявок
class SkeletonOrderCard extends StatelessWidget {
  const SkeletonOrderCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonLoading(
                width: 60.w,
                height: 24.h,
                borderRadius: 12,
              ),
              const Spacer(),
              SkeletonLoading(
                width: 80.w,
                height: 16.h,
                borderRadius: 8,
              ),
            ],
          ),
          SizedBox(height: 12.h),
          SkeletonLoading(
            width: double.infinity,
            height: 20.h,
            borderRadius: 4,
          ),
          SizedBox(height: 8.h),
          SkeletonLoading(
            width: 250.w,
            height: 16.h,
            borderRadius: 4,
          ),
          SizedBox(height: 16.h),
          Row(
            children: [
              SkeletonLoading(
                width: 100.w,
                height: 16.h,
                borderRadius: 4,
              ),
              SizedBox(width: 16.w),
              SkeletonLoading(
                width: 120.w,
                height: 16.h,
                borderRadius: 4,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Skeleton для списка чатов
class SkeletonChatItem extends StatelessWidget {
  const SkeletonChatItem({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      padding: EdgeInsets.all(12.w),
      child: Row(
        children: [
          SkeletonLoading(
            width: 56.w,
            height: 56.w,
            shape: BoxShape.circle,
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonLoading(
                  width: 150.w,
                  height: 18.h,
                  borderRadius: 4,
                ),
                SizedBox(height: 6.h),
                SkeletonLoading(
                  width: double.infinity,
                  height: 14.h,
                  borderRadius: 4,
                ),
              ],
            ),
          ),
          SizedBox(width: 12.w),
          SkeletonLoading(
            width: 40.w,
            height: 14.h,
            borderRadius: 4,
          ),
        ],
      ),
    );
  }
}

/// Skeleton для профиля
class SkeletonProfile extends StatelessWidget {
  const SkeletonProfile({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height: 20.h),
        SkeletonLoading(
          width: 110.w,
          height: 110.w,
          shape: BoxShape.circle,
        ),
        SizedBox(height: 16.h),
        SkeletonLoading(
          width: 150.w,
          height: 20.h,
          borderRadius: 10,
        ),
        SizedBox(height: 8.h),
        SkeletonLoading(
          width: 80.w,
          height: 24.h,
          borderRadius: 12,
        ),
        SizedBox(height: 24.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(
            4,
            (index) => Column(
              children: [
                SkeletonLoading(
                  width: 40.w,
                  height: 20.h,
                  borderRadius: 4,
                ),
                SizedBox(height: 4.h),
                SkeletonLoading(
                  width: 60.w,
                  height: 14.h,
                  borderRadius: 4,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

