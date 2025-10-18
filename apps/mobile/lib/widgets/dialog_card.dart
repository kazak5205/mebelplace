import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/dialog.dart';
import '../../core/theme/app_theme.dart';

class DialogCard extends StatelessWidget {
  final ChatDialog dialog;
  final VoidCallback? onTap;

  const DialogCard({
    super.key,
    required this.dialog,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundImage: dialog.user.avatar != null
              ? CachedNetworkImageProvider(dialog.user.avatar!)
              : null,
          child: dialog.user.avatar == null
              ? Text(
                  (dialog.user?.name ?? "").isNotEmpty
                      ? (dialog.user?.name ?? "")[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                )
              : null,
        ),
        title: Text(
          dialog.user?.name ?? "",
          style: AppTheme.bodyLarge.copyWith(
            fontWeight: dialog.unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        subtitle: dialog.lastMessage != null
            ? Text(
                dialog.lastMessage!.content,
                style: AppTheme.bodyMedium.copyWith(
                  color: dialog.unreadCount > 0 
                      ? AppTheme.textOnPrimary 
                      : Colors.grey[600],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              )
            : const Text('Нет сообщений'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (dialog.lastMessage != null)
              Text(
                _formatTime(dialog.lastMessage!.createdAt),
                style: AppTheme.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            if (dialog.unreadCount > 0) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${dialog.unreadCount}',
                  style: AppTheme.caption.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inDays > 0) {
      return '${difference.inDays}д';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}ч';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}м';
    } else {
      return 'сейчас';
    }
  }
}
