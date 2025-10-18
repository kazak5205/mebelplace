import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// Виджет для отображения пустого состояния
class EmptyState extends StatelessWidget {
  final IconData? icon;
  final String? image;
  final String title;
  final String? description;
  final String? actionText;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    this.icon,
    this.image,
    required this.title,
    this.description,
    this.actionText,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null)
              Icon(
                icon,
                size: 80,
                color: isDark
                    ? AppColors.darkTextSecondary.withValues(alpha: 0.5)
                    : AppColors.lightTextSecondary.withValues(alpha: 0.5),
              ),
            if (image != null)
              Image.asset(
                image!,
                width: 200,
                height: 200,
              ),
            const SizedBox(height: 24),
            Text(
              title,
              style: AppTextStyles.h5.copyWith(
                color: isDark
                    ? AppColors.darkTextPrimary
                    : AppColors.lightTextPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              const SizedBox(height: 12),
              Text(
                description!,
                style: AppTextStyles.body2.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.lightTextSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                child: Text(actionText!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

