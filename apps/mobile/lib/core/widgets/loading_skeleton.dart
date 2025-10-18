import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

/// Skeleton loader для отображения во время загрузки
class LoadingSkeleton extends StatelessWidget {
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  const LoadingSkeleton({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Shimmer.fromColors(
      baseColor: isDark
          ? AppColors.darkShimmerBase
          : AppColors.lightShimmerBase,
      highlightColor: isDark
          ? AppColors.darkShimmerHighlight
          : AppColors.lightShimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius ?? BorderRadius.circular(8),
        ),
      ),
    );
  }
}

/// Skeleton для карточки видео
class VideoCardSkeleton extends StatelessWidget {
  const VideoCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const LoadingSkeleton(
          width: double.infinity,
          height: 200,
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            const LoadingSkeleton(
              width: 40,
              height: 40,
              borderRadius: BorderRadius.all(Radius.circular(20)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LoadingSkeleton(
                    width: double.infinity,
                    height: 16,
                  ),
                  const SizedBox(height: 8),
                  LoadingSkeleton(
                    width: MediaQuery.of(context).size.width * 0.6,
                    height: 14,
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Skeleton для списка
class ListSkeleton extends StatelessWidget {
  final int itemCount;
  final Widget itemSkeleton;

  const ListSkeleton({
    super.key,
    this.itemCount = 5,
    required this.itemSkeleton,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      itemCount: itemCount,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) => itemSkeleton,
    );
  }
}

