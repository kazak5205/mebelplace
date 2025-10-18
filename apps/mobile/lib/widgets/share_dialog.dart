import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';

class ShareDialog {
  static void show(BuildContext context, {
    required String title,
    required String url,
    String? description,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[600],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Заголовок
            Text(
              'Поделиться',
              style: AppTheme.headlineMedium,
            ),
            const SizedBox(height: 20),
            
            // Кнопки шаринга
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildShareButton(
                  context,
                  icon: Icons.share,
                  label: 'Поделиться',
                  onTap: () {
                    Navigator.pop(context);
                    final shareText = description != null 
                        ? '$title\n\n$description\n\n$url'
                        : '$title\n\n$url';
                  },
                ),
                _buildShareButton(
                  context,
                  icon: Icons.copy,
                  label: 'Копировать',
                  onTap: () {
                    Navigator.pop(context);
                    Clipboard.setData(ClipboardData(text: url));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Ссылка скопирована'),
                        backgroundColor: AppTheme.success,
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
                _buildShareButton(
                  context,
                  icon: Icons.link,
                  label: 'Ссылка',
                  onTap: () {
                    Navigator.pop(context);
                    Clipboard.setData(ClipboardData(text: url));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Ссылка: $url'),
                        backgroundColor: AppTheme.info,
                        duration: const Duration(seconds: 3),
                        action: SnackBarAction(
                          label: 'Копировать',
                          textColor: Colors.white,
                          onPressed: () {},
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
  
  static Widget _buildShareButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.blue.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.blue.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.blue, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTheme.labelSmall.copyWith(
                color: Colors.blue,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

