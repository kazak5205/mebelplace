import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_message_bubble.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassAiAssistantScreen extends ConsumerStatefulWidget {
  const GlassAiAssistantScreen({super.key});

  @override
  ConsumerState<GlassAiAssistantScreen> createState() => _GlassAiAssistantScreenState();
}

class _GlassAiAssistantScreenState extends ConsumerState<GlassAiAssistantScreen> {
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.psychology, color: LiquidGlassColors.primaryOrange),
            const SizedBox(width: 8),
            Text('AI Ассистент', style: LiquidGlassTextStyles.h3Light(isDark)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: const [
                GlassMessageBubble(text: 'Привет! Я помогу вам выбрать мебель. Что вас интересует?', isMine: false, time: '10:00'),
              ],
            ),
          ),
          GlassPanel(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Expanded(child: GlassTextField(hint: 'Спросите AI...', controller: _messageController)),
                const SizedBox(width: 12),
                IconButton(icon: const Icon(Icons.send_outlined, color: LiquidGlassColors.primaryOrange), onPressed: () {}),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

