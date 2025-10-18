import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/widgets/glass/glass_screen_base.dart';
import '../core/widgets/glass/glass_custom_widgets.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../core/theme/liquid_glass_text_styles.dart';
import 'glass_create_chat_screen.dart';

class GlassChatsListScreen extends ConsumerStatefulWidget {
  const GlassChatsListScreen({super.key});

  @override
  ConsumerState<GlassChatsListScreen> createState() => _GlassChatsListScreenState();
}

class _GlassChatsListScreenState extends ConsumerState<GlassChatsListScreen> {
  final List<Map<String, dynamic>> _chats = [
    {
      'id': '1',
      'name': 'Иван Петров',
      'lastMessage': 'Привет! Как дела?',
      'time': '12:30',
      'unreadCount': 2,
      'avatar': null,
      'isOnline': true,
    },
    {
      'id': '2',
      'name': 'Мария Сидорова',
      'lastMessage': 'Спасибо за помощь!',
      'time': '11:45',
      'unreadCount': 0,
      'avatar': null,
      'isOnline': false,
    },
    {
      'id': '3',
      'name': 'Алексей Козлов',
      'lastMessage': 'Договорились на завтра',
      'time': '10:20',
      'unreadCount': 1,
      'avatar': null,
      'isOnline': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return GlassScreenBase(
      title: 'Чаты',
      showAppBar: true,
      backgroundColor: LiquidGlassColors.darkGlass,
      actions: [
        IconButton(
          icon: const Icon(Icons.search, color: Colors.white),
          onPressed: () {
            // TODO: Поиск чатов
          },
        ),
      ],
      child: Column(
        children: [
          // Поиск
          Padding(
            padding: const EdgeInsets.all(16.0),
            child:             TextField(
              decoration: const InputDecoration(
                hintText: 'Поиск чатов...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                // TODO: Фильтрация чатов
              },
            ),
          ),
          
          // Список чатов
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              itemCount: _chats.length,
              itemBuilder: (context, index) {
                final chat = _chats[index];
                return _buildChatItem(chat);
              },
            ),
          ),
        ],
      ),
      // floatingActionButton: FloatingActionButton(
      //   onPressed: () async {
      //     final result = await Navigator.push(
      //       context,
      //       MaterialPageRoute(
      //         builder: (context) => const GlassCreateChatScreen(),
      //       ),
      //     );
      //     if (result != null) {
      //       // Обновить список чатов
      //       setState(() {
      //         // _chats.add(result);
      //       });
      //     }
      //   },
      //   backgroundColor: LiquidGlassColors.primaryOrange,
      //   child: const Icon(Icons.add, color: Colors.white),
      // ),
    );
  }

  Widget _buildChatItem(Map<String, dynamic> chat) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: LiquidGlassColors.darkGlass.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.1),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 25,
                      backgroundColor: LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
                      child: chat['avatar'] != null
                          ? ClipOval(
                              child: Image.network(
                                chat['avatar'],
                                width: 50,
                                height: 50,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Icon(
                                    Icons.person,
                                    color: Colors.white,
                                    size: 24,
                                  );
                                },
                              ),
                            )
                          : const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 24,
                            ),
                    ),
                    if (chat['isOnline'])
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            chat['name'],
                            style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white),
                          ),
                          Text(
                            chat['time'],
                            style: LiquidGlassTextStyles.caption.copyWith(
                              color: Colors.white.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              chat['lastMessage'],
                              style: LiquidGlassTextStyles.body.copyWith(
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (chat['unreadCount'] > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: LiquidGlassColors.primaryOrange,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                chat['unreadCount'].toString(),
                                style: LiquidGlassTextStyles.caption.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
