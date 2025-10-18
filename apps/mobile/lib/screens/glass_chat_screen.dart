import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../core/widgets/glass/glass_panel.dart';
import '../core/widgets/glass/glass_message_bubble.dart';
import '../core/widgets/glass/glass_text_field.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../features/chats/presentation/providers/chat_provider.dart';
import '../features/chats/domain/repositories/chat_repository.dart';
import '../core/di/injection.dart';

/// Glass Chat Screen
class GlassChatScreen extends ConsumerStatefulWidget {
  final String chatId;
  final String chatName;
  final String? chatAvatar;

  const GlassChatScreen({
    super.key,
    required this.chatId,
    required this.chatName,
    this.chatAvatar,
  });

  @override
  ConsumerState<GlassChatScreen> createState() => _GlassChatScreenState();
}

class _GlassChatScreenState extends ConsumerState<GlassChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }
  
  Future<void> _loadMessages() async {
    setState(() => _isLoading = true);
    
    try {
      final repository = getIt<ChatRepository>();
      final result = await repository.getMessages(widget.chatId);
      
      result.fold(
        (failure) {
          setState(() => _isLoading = false);
        },
        (messages) {
          setState(() {
            // Convert MessageEntity to Map
            _messages = messages.map((m) => {
              'text': m.text ?? '',
              'isMine': false, // Will be set by backend
              'time': _formatTime(m.createdAt),
              'isRead': m.isRead,
            }).toList();
            _isLoading = false;
          });
        },
      );
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            GlassPanel(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              borderRadius: 16,
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.arrow_back,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: LiquidGlassColors.primaryOrange,
                    child: Text(
                      widget.chatName.substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.chatName,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                        Text(
                          'онлайн',
                          style: TextStyle(
                            fontSize: 12,
                            color: LiquidGlassColors.primaryOrange,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.more_vert,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    onPressed: () {},
                  ),
                ],
              ),
            ),

            // Messages
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: LiquidGlassColors.primaryOrange,
                      ),
                    )
                  : _messages.isEmpty
                      ? Center(
                          child: Text(
                            'Нет сообщений',
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black,
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          reverse: true,
                          itemCount: _messages.length,
                          itemBuilder: (context, index) {
                            final msg = _messages[index];
                            return GlassMessageBubble(
                              text: msg['text'],
                              isMine: msg['isMine'],
                              time: msg['time'],
                              isRead: msg['isRead'] ?? false,
                            );
                          },
                        ),
            ),

            // Input bar
            GlassPanel(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              borderRadius: 24,
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.add_circle_outline,
                      color: isDark ? Colors.white.withValues(alpha: 0.6) : Colors.black.withValues(alpha: 0.6),
                    ),
                    onPressed: () {
                      // Attach files
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Выберите файл'),
                          duration: Duration(seconds: 1),
                        ),
                      );
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      style: TextStyle(
                        fontSize: 16,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Сообщение...',
                        hintStyle: TextStyle(
                          fontSize: 16,
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.5)
                              : Colors.black.withValues(alpha: 0.5),
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Material(
                      color: LiquidGlassColors.primaryOrange,
                      child: InkWell(
                        onTap: () async {
                          if (_messageController.text.trim().isEmpty) return;
                          
                          await ref.read(chatProvider.notifier).sendMessage(
                            widget.chatId,
                            _messageController.text.trim(),
                          );
                          
                          _messageController.clear();
                          
                          // Reload messages
                          await _loadMessages();
                        },
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          child: const Icon(
                            Icons.send_outlined,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    
    if (diff.inDays > 0) {
      return '${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    } else if (diff.inHours > 0) {
      return '${diff.inHours}ч назад';
    } else if (diff.inMinutes > 0) {
      return '${diff.inMinutes}м назад';
    } else {
      return 'сейчас';
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
