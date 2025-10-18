import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/message.dart';
import '../../core/theme/app_theme.dart';

/// Виджет сообщения в чате с поддержкой ответов, пересылки и удаления
class ChatMessageBubble extends StatelessWidget {
  final Message message;
  final bool isMe;
  final VoidCallback? onReply;
  final VoidCallback? onForward;
  final VoidCallback? onDelete;
  final VoidCallback? onTap;

  const ChatMessageBubble({
    super.key,
    required this.message,
    required this.isMe,
    this.onReply,
    this.onForward,
    this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPress: () => _showMessageMenu(context),
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          margin: const EdgeInsets.symmetric(
            vertical: AppTheme.spacingXS,
            horizontal: 16.0,
          ),
          child: Column(
            crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              // Пересланное сообщение
              if (message.forwardedFrom != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8.0,
                    vertical: AppTheme.spacingXS,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[100].withValues(alpha: 0.5),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(8.0),
                      topRight: Radius.circular(8.0),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.forward,
                        size: 14,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: AppTheme.spacingXS),
                      Text(
                        'Пересланное от ${message.forwardedFrom}',
                        style: AppTheme.bodySmall.copyWith(
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              
              // Основное сообщение
              Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: isMe ? Colors.blue : Colors.grey[100],
                  borderRadius: BorderRadius.circular(8.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Ответ на сообщение
                    if (message.replyToId != null && message.replyToContent != null)
                      Container(
                        padding: const EdgeInsets.all(8.0),
                        margin: const EdgeInsets.only(bottom: 8.0),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(AppTheme.radiusS),
                          border: Border(
                            left: BorderSide(
                              color: isMe ? Colors.white : Colors.blue,
                              width: 3,
                            ),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ответ на сообщение:',
                              style: AppTheme.bodySmall.copyWith(
                                color: isMe ? Colors.white70 : Colors.grey[600],
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              message.replyToContent!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTheme.bodySmall.copyWith(
                                color: isMe ? Colors.white70 : Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    
                    // Текст сообщения
                    Text(
                      message.content,
                      style: AppTheme.bodyMedium.copyWith(
                        color: isMe ? Colors.white : AppTheme.text,
                      ),
                    ),
                    
                    // Время и статус
                    const SizedBox(height: AppTheme.spacingXS),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(message.createdAt),
                          style: AppTheme.bodySmall.copyWith(
                            color: isMe ? Colors.white70 : Colors.grey[600],
                          ),
                        ),
                        if (isMe) ...[
                          const SizedBox(width: AppTheme.spacingXS),
                          Icon(
                            message.isRead ? Icons.done_all : Icons.done,
                            size: 14,
                            color: message.isRead ? AppTheme.success : Colors.white70,
                          ),
                        ],
                        if (message.synced == false) ...[
                          const SizedBox(width: AppTheme.spacingXS),
                          const Icon(
                            Icons.schedule,
                            size: 14,
                            color: AppTheme.warning,
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMessageMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.grey[100],
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12.0)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Ответить
            if (onReply != null)
              ListTile(
                leading: const Icon(Icons.reply, color: Colors.blue),
                title: const Text('Ответить', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  onReply!();
                },
              ),
            
            // Переслать
            if (onForward != null)
              ListTile(
                leading: const Icon(Icons.forward, color: Colors.blue),
                title: const Text('Переслать', style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  onForward!();
                },
              ),
            
            // Копировать
            ListTile(
              leading: const Icon(Icons.copy, color: Colors.blue),
              title: const Text('Копировать', style: TextStyle(color: Colors.white)),
              onTap: () {
                Clipboard.setData(ClipboardData(text: message.content));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Текст скопирован'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
            ),
            
            // Удалить (только свои сообщения)
            if (isMe && onDelete != null)
              ListTile(
                leading: const Icon(Icons.delete, color: AppTheme.error),
                title: const Text('Удалить', style: TextStyle(color: AppTheme.error)),
                onTap: () {
                  Navigator.pop(context);
                  _confirmDelete(context);
                },
              ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[100],
        title: const Text('Удалить сообщение?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Это действие нельзя отменить',
          style: TextStyle(color: Colors.grey[600]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onDelete!();
            },
            child: const Text('Удалить', style: TextStyle(color: AppTheme.error)),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    
    if (diff.inDays > 0) {
      return '${dateTime.day}.${dateTime.month}.${dateTime.year}';
    } else {
      return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    }
  }
}

