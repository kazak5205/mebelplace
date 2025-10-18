import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/chats/presentation/providers/chats_list_provider.dart';
import '../../features/chats/domain/entities/chat_entity.dart';

class GlassChatsListScreen extends ConsumerStatefulWidget {
  const GlassChatsListScreen({super.key});

  @override
  ConsumerState<GlassChatsListScreen> createState() => _GlassChatsListScreenState();
}

class _GlassChatsListScreenState extends ConsumerState<GlassChatsListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(chatsListProvider.notifier).loadChats());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final chatsAsync = ref.watch(chatsListProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Чаты', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: chatsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
        error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
        data: (chats) {
          if (chats.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.chat_bubble_outline, size: 80, color: LiquidGlassColors.primaryOrange),
                  const SizedBox(height: 16),
                  Text('Нет чатов', style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: chats.length,
            itemBuilder: (context, index) {
              final chat = chats[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/chat/${chat.id}?name=${Uri.encodeComponent(chat.name ?? "Чат")}',
                  ),
                  child: GlassPanel(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Stack(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: LiquidGlassColors.primaryOrange,
                              child: Text(chat.name?[0] ?? 'C', style: const TextStyle(color: Colors.white)),
                            ),
                            if ((chat.unreadCount ?? 0) > 0)
                              Positioned(
                                top: 0,
                                right: 0,
                                child: Container(
                                  width: 12,
                                  height: 12,
                                  decoration: const BoxDecoration(color: LiquidGlassColors.error, shape: BoxShape.circle),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(chat.name, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black, fontWeight: FontWeight.w600)),
                              Text(
                                chat.lastMessage?.text ?? 'Нет сообщений',
                                style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _formatTime(chat.lastMessageTime),
                              style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54),
                            ),
                            if ((chat.unreadCount ?? 0) > 0) ...[
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(color: LiquidGlassColors.error, shape: BoxShape.circle),
                                child: Text('${chat.unreadCount}', style: const TextStyle(color: Colors.white, fontSize: 10)),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    if (diff.inDays > 0) return '${diff.inDays}д';
    if (diff.inHours > 0) return '${diff.inHours}ч';
    if (diff.inMinutes > 0) return '${diff.inMinutes}м';
    return 'сейчас';
  }
}
