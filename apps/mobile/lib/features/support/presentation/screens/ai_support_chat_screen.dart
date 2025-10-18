import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/config/api_config.dart';

class SupportMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? quickReplies;

  SupportMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.quickReplies,
  });
}

class AiSupportChatScreen extends ConsumerStatefulWidget {
  const AiSupportChatScreen({super.key});

  @override
  ConsumerState<AiSupportChatScreen> createState() => _AiSupportChatScreenState();
}

class _AiSupportChatScreenState extends ConsumerState<AiSupportChatScreen> {
  final _storage = const FlutterSecureStorage();
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<SupportMessage> _messages = [];
  bool _isSending = false;
  bool _isAiTyping = false;

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initChat() async {
    // Add welcome message
    setState(() {
      _messages.add(
        SupportMessage(
          id: '0',
          text: 'Здравствуйте! Я AI-помощник MebelPlace. Чем могу помочь?',
          isUser: false,
          timestamp: DateTime.now(),
          quickReplies: [
            'Как создать заявку?',
            'Как стать мастером?',
            'Проблемы с оплатой',
            'Связаться с оператором',
          ],
        ),
      );
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = SupportMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMessage);
      _isSending = true;
      _isAiTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      final token = await _storage.read(key: 'auth_token');

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/support/ai-chat'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'message': text,
          'conversation_id': widget.hashCode.toString(),
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final aiResponse = data['response'] as String;
        final quickReplies = (data['quick_replies'] as List<dynamic>?)
            ?.map((r) => r.toString())
            .toList();

        final aiMessage = SupportMessage(
          id: data['message_id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
          text: aiResponse,
          isUser: false,
          timestamp: DateTime.now(),
          quickReplies: quickReplies,
        );

        setState(() {
          _messages.add(aiMessage);
          _isAiTyping = false;
        });

        _scrollToBottom();

        // Check if user wants to talk to human
        if (aiResponse.contains('оператор') || aiResponse.contains('человек')) {
          _offerHumanSupport();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка: $e'),
            backgroundColor: LiquidGlassColors.errorRed,
          ),
        );
      }
    } finally {
      setState(() => _isSending = false);
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _offerHumanSupport() async {
    final shouldTransfer = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Связаться с оператором?'),
        content: const Text(
          'Хотите переключиться на чат с живым оператором? '
          'Среднее время ответа: 5 минут.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Нет, спасибо'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Да, переключить'),
          ),
        ],
      ),
    );

    if (shouldTransfer == true) {
      _transferToHumanSupport();
    }
  }

  Future<void> _transferToHumanSupport() async {
    try {
      final token = await _storage.read(key: 'auth_token');

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/support/transfer-to-human'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'conversation_id': widget.hashCode.toString(),
          'messages': _messages.map((m) => {
            'text': m.text,
            'is_user': m.isUser,
            'timestamp': m.timestamp.toIso8601String(),
          }).toList(),
        }),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Вы переведены на оператора. Ожидайте ответа.'),
            backgroundColor: LiquidGlassColors.success,
          ),
        );
      }
    } catch (e) {
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Row(
          children: [
            Icon(Icons.smart_toy, color: LiquidGlassColors.primaryOrange),
            SizedBox(width: 8),
            Text('AI Поддержка'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isAiTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isAiTyping && index == _messages.length) {
                  return _buildTypingIndicator();
                }

                final message = _messages[index];
                return _buildMessage(message, isDark);
              },
            ),
          ),

          // Input
          GlassPanel(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Напишите ваш вопрос...',
                      border: InputBorder.none,
                      hintStyle: TextStyle(
                        color: isDark ? Colors.white54 : Colors.black54,
                      ),
                    ),
                    textInputAction: TextInputAction.send,
                    onSubmitted: (text) {
                      _sendMessage(text);
                    },
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _isSending ? Icons.hourglass_empty : Icons.send,
                    color: LiquidGlassColors.primaryOrange,
                  ),
                  onPressed: _isSending
                      ? null
                      : () {
                          _sendMessage(_messageController.text);
                        },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(SupportMessage message, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: message.isUser 
            ? CrossAxisAlignment.end 
            : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: message.isUser 
                ? MainAxisAlignment.end 
                : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!message.isUser) ...[
                CircleAvatar(
                  radius: 16,
                  backgroundColor: LiquidGlassColors.primaryOrange,
                  child: const Icon(
                    Icons.smart_toy,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: message.isUser
                        ? LiquidGlassColors.primaryOrange
                        : (isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.05)),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    message.text,
                    style: TextStyle(
                      color: message.isUser ? Colors.white : (isDark ? Colors.white : Colors.black),
                      fontSize: 14,
                    ),
                  ),
                ),
              ),

              if (message.isUser) ...[
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Colors.grey,
                  child: const Icon(
                    Icons.person,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ],
            ],
          ),

          // Quick replies
          if (message.quickReplies != null && message.quickReplies!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: message.quickReplies!.map((reply) {
                return GestureDetector(
                  onTap: () {
                    _sendMessage(reply);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: LiquidGlassColors.primaryOrange,
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      reply,
                      style: const TextStyle(
                        color: LiquidGlassColors.primaryOrange,
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: LiquidGlassColors.primaryOrange,
            child: const Icon(
              Icons.smart_toy,
              size: 16,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: LiquidGlassColors.primaryOrange,
                  ),
                ),
                SizedBox(width: 8),
                Text(
                  'печатает...',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

