import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/search_result_entity.dart';

class SearchResultItem extends StatelessWidget {
  final SearchResultEntity result;
  final VoidCallback? onTap;

  const SearchResultItem({
    super.key,
    required this.result,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap ?? () {
        // Navigate based on type
        switch (result.type) {
          case SearchResultType.video:
            context.push('/video/${result.id}');
            break;
          case SearchResultType.user:
            context.push('/profile/user/${result.id}');
            break;
          case SearchResultType.hashtag:
            context.push('/search?query=${result.title}');
            break;
          case SearchResultType.channel:
            context.push('/channel/${result.id}');
            break;
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image/Icon
            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(8),
                ),
                child: result.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: result.imageUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (context, url) => Container(
                          color: isDark
                              ? AppColors.darkSurfaceVariant
                              : AppColors.lightSurfaceVariant,
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: isDark
                              ? AppColors.darkSurfaceVariant
                              : AppColors.lightSurfaceVariant,
                          child: Icon(_getIconForType()),
                        ),
                      )
                    : Container(
                        color: isDark
                            ? AppColors.darkSurfaceVariant
                            : AppColors.lightSurfaceVariant,
                        child: Center(
                          child: Icon(_getIconForType(), size: 32),
                        ),
                      ),
              ),
            ),
            
            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      result.title,
                      style: AppTextStyles.subtitle2,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (result.subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        result.subtitle!,
                        style: AppTextStyles.caption.copyWith(
                          color: isDark
                              ? AppColors.darkTextSecondary
                              : AppColors.lightTextSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (result.count != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${result.count} видео',
                        style: AppTextStyles.caption.copyWith(
                          color: isDark
                              ? AppColors.darkTextTertiary
                              : AppColors.lightTextTertiary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForType() {
    switch (result.type) {
      case SearchResultType.video:
        return Icons.play_circle_outline;
      case SearchResultType.user:
        return Icons.person;
      case SearchResultType.hashtag:
        return Icons.tag;
      case SearchResultType.channel:
        return Icons.video_library;
    }
  }
}

