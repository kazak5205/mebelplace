import 'dart:ui';
import 'package:flutter/material.dart';
import '../../theme/liquid_glass_colors.dart';
import '../../theme/liquid_glass_text_styles.dart';

/// Glass Message Bubble (для чата)
class GlassMessageBubble extends StatelessWidget {
  final String text;
  final bool isMine;
  final String? time;
  final bool isRead;

  const GlassMessageBubble({
    super.key,
    required this.text,
    required this.isMine,
    this.time,
    this.isRead = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.7,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isMine ? const Radius.circular(20) : const Radius.circular(4),
            bottomRight: isMine ? const Radius.circular(4) : const Radius.circular(20),
          ),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isMine
                    ? LiquidGlassColors.primaryOrange.withValues(alpha: 0.8)
                    : (isDark
                        ? Colors.white.withValues(alpha: 0.1)
                        : Colors.white.withValues(alpha: 0.6)),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: isMine ? const Radius.circular(20) : const Radius.circular(4),
                  bottomRight: isMine ? const Radius.circular(4) : const Radius.circular(20),
                ),
                border: Border.all(
                  color: isMine
                      ? Colors.white.withValues(alpha: 0.3)
                      : (isDark
                          ? Colors.white.withValues(alpha: 0.2)
                          : Colors.black.withValues(alpha: 0.1)),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    text,
                    style: LiquidGlassTextStyles.body.copyWith(
                      color: isMine ? Colors.white : (isDark ? Colors.white : Colors.black),
                    ),
                  ),
                  if (time != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          time!,
                          style: LiquidGlassTextStyles.caption.copyWith(
                            color: isMine
                                ? Colors.white.withValues(alpha: 0.8)
                                : (isDark
                                    ? Colors.white.withValues(alpha: 0.6)
                                    : Colors.black.withValues(alpha: 0.6)),
                          ),
                        ),
                        if (isMine) ...[
                          const SizedBox(width: 4),
                          Icon(
                            isRead ? Icons.done_all : Icons.done,
                            size: 14,
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

