import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_screen_base.dart';
import '../../core/widgets/glass/glass_custom_widgets.dart';
import '../../core/theme/liquid_glass_colors.dart';
import '../../core/theme/liquid_glass_text_styles.dart';
import '../../core/providers/app_state_provider.dart';
import '../../features/auth/presentation/providers/auth_state.dart';

class GlassProfileScreenRefactored extends ConsumerStatefulWidget {
  const GlassProfileScreenRefactored({super.key});

  @override
  ConsumerState<GlassProfileScreenRefactored> createState() => _GlassProfileScreenRefactoredState();
}

class _GlassProfileScreenRefactoredState extends ConsumerState<GlassProfileScreenRefactored> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(appStateProvider);
    
    return GlassScreenBase(
      title: 'Профиль',
      backgroundColor: LiquidGlassColors.backgroundDark,
      showAppBar: true,
      child: _buildProfileContent(authState),
    );
  }
  
  Widget _buildProfileContent(AppState authState) {
    if (authState.isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }
    
    if (authState is Authenticated) {
      final user = authState.user;
      
      return SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Аватар и основная информация
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: LiquidGlassColors.darkGlass,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: LiquidGlassColors.darkGlassBorder,
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: LiquidGlassColors.primary,
                    backgroundImage: user?['avatar'] != null 
                        ? NetworkImage(user!['avatar'])
                        : null,
                    child: user?['avatar'] == null 
                        ? Icon(Icons.person, size: 60, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?['name'] ?? 'Пользователь',
                    style: LiquidGlassTextStyles.heading2,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    user?['email'] ?? '',
                    style: LiquidGlassTextStyles.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  if (user?['phone'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      user!['phone'],
                      style: LiquidGlassTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Статистика
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: LiquidGlassColors.darkGlass,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: LiquidGlassColors.darkGlassBorder,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem('Уровень', '${user?['gamification']?['level'] ?? 1}'),
                  _buildStatItem('Очки', '${user?['gamification']?['points'] ?? 0}'),
                  _buildStatItem('Ранг', '${user?['gamification']?['rank'] ?? 0}'),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Меню профиля
            _buildProfileMenu(),
          ],
        ),
      );
    }
    
    // Не авторизован
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.person_outline,
            size: 64,
            color: LiquidGlassColors.primary,
          ),
          const SizedBox(height: 16),
          Text(
            'Войдите в аккаунт',
            style: LiquidGlassTextStyles.heading2,
          ),
          const SizedBox(height: 8),
          Text(
            'Для просмотра профиля необходимо войти в систему',
            style: LiquidGlassTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // TODO: Navigate to login
            },
            child: const Text('Войти'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: LiquidGlassTextStyles.heading3,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: LiquidGlassTextStyles.bodySmall,
        ),
      ],
    );
  }
  
  Widget _buildProfileMenu() {
    return Container(
      decoration: BoxDecoration(
        color: LiquidGlassColors.darkGlass,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: LiquidGlassColors.darkGlassBorder,
        ),
      ),
      child: Column(
        children: [
          _buildMenuItem(Icons.edit, 'Редактировать профиль', () {}),
          _buildMenuItem(Icons.video_library, 'Мои видео', () {}),
          _buildMenuItem(Icons.favorite, 'Избранное', () {}),
          _buildMenuItem(Icons.settings, 'Настройки', () {}),
          _buildMenuItem(Icons.logout, 'Выйти', () {
            ref.read(appStateProvider.notifier).logout();
          }),
        ],
      ),
    );
  }
  
  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Icon(
              icon,
              color: LiquidGlassColors.primary,
              size: 24,
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: LiquidGlassTextStyles.bodyMedium,
            ),
            const Spacer(),
            Icon(
              Icons.arrow_forward_ios,
              color: LiquidGlassColors.primary.withValues(alpha: 0.6),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
