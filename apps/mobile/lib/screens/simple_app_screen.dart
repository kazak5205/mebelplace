import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/providers/app_state_provider.dart';
import '../core/theme/mebelplace_colors.dart';

/// Простой рабочий экран приложения
class SimpleAppScreen extends ConsumerWidget {
  const SimpleAppScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appState = ref.watch(appStateProvider);
    
    return Scaffold(
      backgroundColor: MebelPlaceColors.background,
      appBar: AppBar(
        title: const Text(
          'MebelPlace',
          style: TextStyle(
            color: MebelPlaceColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: MebelPlaceColors.surface,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Логотип
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: MebelPlaceColors.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.chair,
                size: 60,
                color: MebelPlaceColors.textOnPrimary,
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Заголовок
            const Text(
              'Добро пожаловать в MebelPlace!',
              style: TextStyle(
                color: MebelPlaceColors.textPrimary,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: 16),
            
            // Описание
            const Text(
              'Платформа для заказа мебели и дизайна интерьеров',
              style: TextStyle(
                color: MebelPlaceColors.textSecondary,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: 48),
            
            // Статус авторизации
            if (appState.isAuthenticated) ...[
              const Text(
                'Вы авторизованы!',
                style: TextStyle(
                  color: MebelPlaceColors.success,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.read(appStateProvider.notifier).logout();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: MebelPlaceColors.error,
                  foregroundColor: MebelPlaceColors.textPrimary,
                ),
                child: const Text('Выйти'),
              ),
            ] else ...[
              const Text(
                'Для продолжения войдите в систему',
                style: TextStyle(
                  color: MebelPlaceColors.textSecondary,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  // Переход на экран входа
                  Navigator.pushNamed(context, '/login');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: MebelPlaceColors.primary,
                  foregroundColor: MebelPlaceColors.textOnPrimary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                ),
                child: const Text(
                  'Войти',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ],
            
            const SizedBox(height: 32),
            
            // Индикатор загрузки
            if (appState.isLoading)
              const CircularProgressIndicator(
                color: MebelPlaceColors.primary,
              ),
            
            // Ошибка
            if (appState.error != null)
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: MebelPlaceColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: MebelPlaceColors.error),
                ),
                child: Text(
                  appState.error!,
                  style: const TextStyle(
                    color: MebelPlaceColors.error,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
