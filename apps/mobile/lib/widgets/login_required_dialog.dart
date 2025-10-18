import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../core/widgets/glass/glass_panel.dart';


/// Dialog shown when guest tries to perform action requiring authentication
class LoginRequiredDialog extends StatelessWidget {
  final String? message;
  final String? actionType;

  const LoginRequiredDialog({
    super.key,
    this.message,
    this.actionType,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Dialog(
      backgroundColor: Colors.transparent,
      child: GlassPanel(
        child: Container(
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                  colors: [
                    LiquidGlassColors.primaryOrange.withValues(alpha: 0.2),
                    LiquidGlassColors.primaryOrange.withValues(alpha: 0.1),
                  ],
                ),
              ),
              child: Icon(
                Icons.lock_outline,
                size: 32,
                color: LiquidGlassColors.primaryOrange,
              ),
              ),
              
              const SizedBox(height: 16),
              
              // Title
              Text(
                'Требуется авторизация',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 12),
              
              // Message
              Text(
                message ?? 'Для выполнения этого действия необходимо войти в аккаунт',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.white70 : Colors.black54,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 24),
              
              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(
                          color: isDark ? Colors.white24 : Colors.black26,
                        ),
                      ),
                      child: const Text('Отмена'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        // Save pending action if provided
                        if (actionType != null) {
                          _savePendingAction(actionType!);
                        }
                        // Navigate to login
                        context.go('/login');
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: LiquidGlassColors.primaryOrange,
                      ),
                      child: const Text(
                        'Войти',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _savePendingAction(String actionType) {
    // Will be implemented with PendingActionService
    // For now, just store in memory/localStorage
  }
}

