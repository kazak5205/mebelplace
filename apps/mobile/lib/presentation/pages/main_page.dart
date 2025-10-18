import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
// import '../../theme/animations.dart'; // Removed - animations not found

// Liquid Glass screens
import '../../screens/video/glass_feed_screen_refactored.dart';
import '../../screens/glass_search_screen.dart';
import '../../screens/requests/glass_requests_tab.dart';
import '../../screens/glass_chats_list_screen.dart';
import '../../screens/profile/glass_profile_screen_refactored.dart';

// Glass UI components
import '../../core/providers/app_state_provider.dart';
import 'package:go_router/go_router.dart';
import '../../screens/auth/glass_login_screen.dart';

/// Главная страница с Bottom Navigation
class MainPage extends ConsumerStatefulWidget {
  const MainPage({super.key});

  @override
  ConsumerState<MainPage> createState() => _MainPageState();
}

class _MainPageState extends ConsumerState<MainPage> 
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _animationController;

  final List<Widget> _pages = [
    GlassFeedScreenRefactored(), // Видео (LIQUID GLASS!)
    GlassSearchScreen(), // Поиск (LIQUID GLASS!)
    GlassRequestsTab(), // Заявки (LIQUID GLASS!)
    GlassChatsListScreen(), // Чаты (LIQUID GLASS!)
    GlassProfileScreenRefactored(), // Профиль (LIQUID GLASS!)
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _showLoginRequiredDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: LiquidGlassColors.darkGlass,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text(
            'Требуется авторизация',
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            'Для доступа к этому разделу необходимо войти в аккаунт.',
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Отмена',
                style: const TextStyle(color: Color(0xFFFF6600)),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Переход на реальный экран логина
                _showRealLogin();
              },
              child: const Text(
                'Войти',
                style: const TextStyle(color: Color(0xFFFF6600)),
              ),
            ),
          ],
        );
      },
    );
  }
  
  void _showRealLogin() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const GlassLoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        child: IndexedStack(
          key: ValueKey<int>(_currentIndex),
          index: _currentIndex,
          children: _pages,
        ),
      ),
      bottomNavigationBar: _buildGlassNavigationBar(),
    );
  }

  Widget _buildGlassNavigationBar() {
    return Container(
      decoration: BoxDecoration(
        // Красивый градиентный фон
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withValues(alpha: 0.8),
            Colors.black.withValues(alpha: 0.95),
          ],
        ),
        border: Border(
          top: BorderSide(
            color: LiquidGlassColors.primaryOrange.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.video_library, 'Лента'),
                _buildNavItem(1, Icons.search, 'Поиск'),
                _buildNavItem(2, Icons.work_outline, 'Создать'),
                _buildNavItem(3, Icons.chat_outlined, 'Чаты'),
                _buildNavItem(4, Icons.person_outline, 'Профиль'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    final authState = ref.watch(appStateProvider);
    final isAuthenticated = authState.isAuthenticated;
    
    // Определяем, какие вкладки требуют авторизации (как на сайте)
    final requiresAuth = index == 2 || index == 3 || index == 4; // Создать, Чаты, Профиль
    
    return GestureDetector(
      onTap: () {
        if (requiresAuth && !isAuthenticated) {
          // Перенаправляем на экран логина
          _showLoginRequiredDialog();
          return;
        }
        
        setState(() {
          _currentIndex = index;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected 
            ? LiquidGlassColors.darkGlass.withValues(alpha: 0.3)
            : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: isSelected 
            ? Border.all(
                color: LiquidGlassColors.darkGlassBorder,
                width: 1,
              )
            : null,
          boxShadow: isSelected ? [
            BoxShadow(
              color: LiquidGlassColors.darkGlassShadow.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: isSelected ? 1.0 : 0.0),
              duration: const Duration(milliseconds: 300),
              curve: Curves.bounceOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: 1.0 + (0.1 * value),
                  child: Icon(
                    icon,
                    color: isSelected 
                      ? LiquidGlassColors.primaryOrange
                      : Colors.white.withValues(alpha: 0.6),
                    size: 24,
                  ),
                );
              },
            ),
            const SizedBox(height: 4),
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: isSelected ? 1.0 : 0.0),
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              builder: (context, value, child) {
                return Opacity(
                  opacity: 0.8 + (0.2 * value),
                  child: Text(
                    label.tr(),
                    style: TextStyle(
                      color: isSelected 
                        ? LiquidGlassColors.primaryOrange
                        : Colors.white.withValues(alpha: 0.9),
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}


