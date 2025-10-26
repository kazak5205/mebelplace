import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:dio/dio.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'data/datasources/api_service.dart';
import 'data/datasources/local_storage.dart';
import 'data/repositories/app_repositories.dart';
import 'data/models/user_model.dart';
import 'presentation/pages/home_screen.dart';
import 'presentation/pages/auth/login_screen.dart';
import 'presentation/pages/auth/register_screen.dart';
import 'presentation/pages/orders/orders_screen.dart';
import 'presentation/pages/orders/create_order_screen.dart';
import 'presentation/pages/messages/messages_screen.dart';
import 'presentation/pages/profile/profile_screen.dart';
import 'presentation/providers/app_providers.dart';
import 'presentation/providers/repository_providers.dart';

void main() {
  runApp(const ProviderScope(child: MebelPlaceApp()));
}

class MebelPlaceApp extends ConsumerWidget {
  const MebelPlaceApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ScreenUtilInit(
      designSize: const Size(375, 812), // iPhone X design size
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp(
          title: AppConstants.appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
          home: const AppNavigator(),
        );
      },
    );
  }
}

class AppNavigator extends ConsumerWidget {
  const AppNavigator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Всегда показываем главный экран с видео лентой
    // Авторизация опциональна для дополнительных функций
    return MainNavigation(user: authState.user);
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.w),
          child: Column(
            children: [
              SizedBox(height: 60.h),
              Text(
                'MebelPlace',
                style: TextStyle(
                  fontSize: 32.sp,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'Платформа для мастеров мебели',
                style: TextStyle(
                  fontSize: 16.sp,
                  color: Colors.white70,
                ),
              ),
              SizedBox(height: 60.h),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLogin = true),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          decoration: BoxDecoration(
                            color: _isLogin ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            'Вход',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _isLogin ? Colors.white : Colors.white70,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isLogin = false),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          decoration: BoxDecoration(
                            color: !_isLogin ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            'Регистрация',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: !_isLogin ? Colors.white : Colors.white70,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 32.h),
              if (_isLogin)
                Expanded(child: const LoginScreen())
              else
                Expanded(child: const RegisterScreen()),
            ],
          ),
        ),
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  final UserModel? user;

  const MainNavigation({Key? key, this.user}) : super(key: key);

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  List<Widget> get _screens {
    if (widget.user?.role == 'master') {
      return [
        const HomeScreen(),
        const OrdersScreen(), // Все заявки для мастера
        const CreateOrderScreen(), // Создать видеорекламу для мастера
        const MessagesScreen(),
        const ProfileScreen(),
      ];
    } else {
      return [
        const HomeScreen(),
        const OrdersScreen(), // Мои заявки для клиента
        const CreateOrderScreen(), // Заявка всем для клиента
        const MessagesScreen(),
        const ProfileScreen(),
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = widget.user != null;
    
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.dark,
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            // Если пользователь не авторизован и пытается зайти в профиль/заказы/сообщения
            if (!isLoggedIn && (index == 1 || index == 2 || index == 3 || index == 4)) {
              _showLoginDialog();
              return;
            }
            
            // Для мастеров и клиентов разные экраны
            if (isLoggedIn) {
              if (index == 1) {
                // Заявки - разные экраны для мастеров и клиентов
                if (widget.user?.role == 'master') {
                  // Мастер видит все заявки
                  // TODO: Navigate to master orders screen
                } else {
                  // Клиент видит свои заявки
                  // TODO: Navigate to user orders screen
                }
              } else if (index == 2) {
                // Создание - разные экраны для мастеров и клиентов
                if (widget.user?.role == 'master') {
                  // Мастер создает видеорекламу
                  // TODO: Navigate to create video ad screen
                } else {
                  // Клиент создает заявку
                  // TODO: Navigate to create order screen
                }
              }
            }
            
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.dark,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: Colors.white.withOpacity(0.6),
          items: [
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 0 ? Icons.home : Icons.home_outlined),
              label: 'Главная',
            ),
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 1 
                ? (isLoggedIn && widget.user?.role == 'master' ? Icons.check_box : Icons.description)
                : (isLoggedIn && widget.user?.role == 'master' ? Icons.check_box_outlined : Icons.description_outlined)),
              label: isLoggedIn && widget.user?.role == 'master' ? 'Все заявки' : 'Мои заявки',
            ),
            BottomNavigationBarItem(
              icon: Container(
                width: 56.w,
                height: 56.w,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28.r),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.add,
                  color: Colors.white,
                  size: 28.sp,
                ),
              ),
              label: isLoggedIn && widget.user?.role == 'master' ? 'создать видеорекламу' : 'заявка всем',
            ),
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 3 ? Icons.chat : Icons.chat_outlined),
              label: 'Мессенджер',
            ),
            BottomNavigationBarItem(
              icon: Icon(isLoggedIn 
                ? (_currentIndex == 4 ? Icons.person : Icons.person_outline)
                : Icons.login),
              label: isLoggedIn ? 'Профиль' : 'Войти',
            ),
          ],
        ),
      ),
    );
  }

  void _showLoginDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.dark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Row(
          children: [
            Icon(Icons.login, color: AppColors.primary),
            SizedBox(width: 12.w),
            const Text(
              'Вход в аккаунт',
              style: TextStyle(color: Colors.white),
            ),
          ],
        ),
        content: const Text(
          'Для доступа к этой функции необходимо войти в аккаунт',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Переходим на экран авторизации
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AuthScreen(),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: const Text('Войти'),
          ),
        ],
      ),
    );
  }
}