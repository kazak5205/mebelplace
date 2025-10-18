import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onAttachment;
  final VoidCallback onVoice;
  final bool isRecording;

  const MessageInput({
    super.key,
    required this.controller,
    required this.onSend,
    required this.onAttachment,
    required this.onVoice,
    this.isRecording = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: onAttachment,
          ),
          Expanded(
            child: TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: 'Введите сообщение...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
              maxLines: null,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: Icon(
              isRecording ? Icons.stop : Icons.mic,
              color: isRecording ? AppColors.error : AppColors.lightPrimary,
            ),
            onPressed: onVoice,
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: onSend,
            color: AppColors.lightPrimary,
          ),
        ],
      ),
    );
  }
}

