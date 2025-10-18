import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../glass_chat_screen.dart';

/// Messenger chat wrapper
class GlassMessengerChatScreen extends ConsumerWidget {
  final String chatId;
  final String chatName;

  const GlassMessengerChatScreen({super.key, required this.chatId, required this.chatName});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassChatScreen(chatId: chatId, chatName: chatName);
  }
}

