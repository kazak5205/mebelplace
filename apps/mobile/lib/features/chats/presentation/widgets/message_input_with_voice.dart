import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:io';
import 'dart:async';
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/config/api_config.dart';
import 'voice_message_recorder.dart';

class MessageInputWithVoice extends StatefulWidget {
  final Function(String text, {String? voiceUrl}) onSendMessage;

  const MessageInputWithVoice({
    super.key,
    required this.onSendMessage,
  });

  @override
  State<MessageInputWithVoice> createState() => _MessageInputWithVoiceState();
}

class _MessageInputWithVoiceState extends State<MessageInputWithVoice> {
  final TextEditingController _textController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  bool _isRecordingMode = false;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _handleVoiceRecordComplete(String audioPath) async {
    // Upload voice message
    try {
      final token = await _storage.read(key: 'auth_token');
      final file = File(audioPath);
      
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConfig.baseUrl}/files/upload'),
      );
      request.headers['Authorization'] = 'Bearer ${token ?? ''}';
      request.files.add(await http.MultipartFile.fromPath('file', audioPath));
      
      final response = await request.send();
      if (response.statusCode == 200) {
        final responseBody = await response.stream.bytesToString();
        final data = json.decode(responseBody);
        final voiceUrl = data['url'] as String;
        
        widget.onSendMessage('', voiceUrl: voiceUrl);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка отправки: $e')),
        );
      }
    }
  }

  void _sendTextMessage() {
    final text = _textController.text.trim();
    if (text.isNotEmpty) {
      widget.onSendMessage(text);
      _textController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        border: Border(
          top: BorderSide(
            color: Colors.white.withValues(alpha: 0.2),
          ),
        ),
      ),
      child: Row(
        children: [
          if (!_isRecordingMode) ...[
            Expanded(
              child: TextField(
                controller: _textController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Сообщение...',
                  hintStyle: const TextStyle(color: Colors.white54),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.1),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                ),
                onChanged: (text) {
                  setState(() => _isRecordingMode = text.isEmpty);
                },
              ),
            ),
            const SizedBox(width: 8),
            if (_textController.text.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.send, color: LiquidGlassColors.primaryOrange),
                onPressed: _sendTextMessage,
              )
            else
              VoiceMessageRecorder(
                onRecordComplete: _handleVoiceRecordComplete,
              ),
          ] else ...[
            Expanded(
              child: VoiceMessageRecorder(
                onRecordComplete: _handleVoiceRecordComplete,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
