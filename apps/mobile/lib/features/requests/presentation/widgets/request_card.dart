import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../domain/entities/request_entity.dart';

class RequestCard extends StatelessWidget {
  final RequestEntity request;
  final VoidCallback? onTap;

  const RequestCard({
    super.key,
    required this.request,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundImage: request.authorAvatar != null
                        ? CachedNetworkImageProvider(request.authorAvatar!)
                        : null,
                    child: request.authorAvatar == null
                        ? Text(request.authorName[0].toUpperCase())
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(request.authorName, style: AppTextStyles.subtitle1),
                        Text(
                          _formatDate(request.createdAt),
                          style: AppTextStyles.caption.copyWith(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _StatusBadge(status: request.status),
                ],
              ),
              const SizedBox(height: 12),
              
              // Title
              Text(request.title, style: AppTextStyles.h6),
              const SizedBox(height: 8),
              
              // Description
              Text(
                request.description,
                style: AppTextStyles.body2.copyWith(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              
              // Photos preview
              if (request.photos.isNotEmpty) ...[
                const SizedBox(height: 12),
                SizedBox(
                  height: 80,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: request.photos.length.clamp(0, 5),
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: request.photos[index],
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
              
              const SizedBox(height: 12),
              
              // Info row
              Row(
                children: [
                  if (request.budget != null) ...[
                    Icon(Icons.attach_money, size: 16, color: AppColors.success),
                    Text('${request.budget} ₸', style: AppTextStyles.subtitle2),
                    const SizedBox(width: 16),
                  ],
                  Icon(Icons.location_on_outlined, size: 16),
                  Text(request.region, style: AppTextStyles.body2),
                  const Spacer(),
                  if (request.responses.isNotEmpty)
                    Text('${request.responses.length} ответов', style: AppTextStyles.caption),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays > 0) return '${diff.inDays}д назад';
    if (diff.inHours > 0) return '${diff.inHours}ч назад';
    return '${diff.inMinutes}мин назад';
  }
}

class _StatusBadge extends StatelessWidget {
  final RequestStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final (color, text) = switch (status) {
      RequestStatus.pending => (AppColors.warning, 'Новая'),
      RequestStatus.inProgress => (AppColors.info, 'В работе'),
      RequestStatus.completed => (AppColors.success, 'Выполнено'),
      RequestStatus.cancelled => (AppColors.error, 'Отменено'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: AppTextStyles.caption.copyWith(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}

