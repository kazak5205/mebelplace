import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'data/models/user_model.dart';
import 'presentation/pages/home_screen.dart';
import 'presentation/pages/auth/login_page.dart';
import 'presentation/pages/auth/registration_type_selection_page.dart';
import 'presentation/pages/auth/registration_flow_page.dart';
import 'presentation/pages/auth/sms_verification_page.dart';
import 'presentation/widgets/custom_bottom_navigation.dart';
import 'presentation/pages/orders/orders_screen.dart';
import 'presentation/pages/orders/create_order_page.dart';
import 'presentation/pages/orders/order_detail_page.dart';
import 'presentation/pages/orders/order_responses_page.dart';
import 'presentation/pages/orders/order_respond_page.dart';
import 'presentation/pages/orders/user_orders_page.dart';
import 'presentation/pages/messages/messages_screen.dart';
import 'presentation/pages/messages/chat_page.dart';
import 'presentation/pages/profile/profile_screen.dart';
import 'presentation/pages/profile/master_channel_page.dart';
import 'presentation/pages/search/search_results_page.dart';
import 'presentation/pages/video/create_video_screen.dart';
import 'presentation/pages/video/video_detail_page.dart';
import 'presentation/pages/support/support_page.dart';
import 'presentation/pages/legal/terms_of_service_page.dart';
import 'presentation/pages/legal/privacy_policy_page.dart';
import 'presentation/providers/app_providers.dart';

void main() {
  print('🚀 MebelPlace App Starting...');
  runApp(const ProviderScope(child: MebelPlaceApp()));
}

class MebelPlaceApp extends ConsumerWidget {
  const MebelPlaceApp({super.key});

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
          routes: {
            '/home': (context) => const AppNavigator(),
            '/login': (context) => const LoginPage(),
            '/registration-type': (context) => const RegistrationTypeSelectionPage(),
            '/create-order': (context) => const CreateOrderPage(),
            '/user-orders': (context) => const UserOrdersPage(),
            '/support': (context) => const SupportPage(),
            '/terms': (context) => const TermsOfServicePage(),
            '/privacy': (context) => const PrivacyPolicyPage(),
            '/create-video': (context) => const CreateVideoScreen(),
          },
          onGenerateRoute: (settings) {
            // Динамические маршруты с параметрами
            if (settings.name == '/order-detail') {
              final orderId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => OrderDetailPage(orderId: orderId),
              );
            }
            if (settings.name == '/order-responses') {
              final orderId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => OrderResponsesPage(orderId: orderId),
              );
            }
            if (settings.name == '/order-respond') {
              final orderId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => OrderRespondPage(orderId: orderId),
              );
            }
            if (settings.name == '/chat') {
              final chatId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => ChatPage(chatId: chatId),
              );
            }
            if (settings.name == '/search') {
              final query = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => SearchResultsPage(query: query),
              );
            }
            if (settings.name == '/master-profile') {
              final masterId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => MasterChannelPage(masterId: masterId),
              );
            }
            if (settings.name == '/sms-verification') {
              final phone = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => SmsVerificationPage(phoneNumber: phone),
              );
            }
            if (settings.name == '/registration-flow') {
              final args = settings.arguments as Map<String, dynamic>;
              return MaterialPageRoute(
                builder: (context) => RegistrationFlowPage(role: args['role']),
              );
            }
            if (settings.name == '/video-detail') {
              final videoId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (context) => VideoDetailPage(videoId: videoId),
              );
            }
            return null;
          },
        );
      },
    );
  }
}

class AppNavigator extends ConsumerWidget {
  const AppNavigator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Всегда показываем главный экран
    // Авторизация опциональна - для создания заказов, сообщений, профиля
    return MainNavigation(user: authState.user);
  }
}

// AuthScreen удален - теперь используем RegistrationTypeSelectionPage

class MainNavigation extends ConsumerStatefulWidget {
  final UserModel? user;

  const MainNavigation({super.key, this.user});

  @override
  ConsumerState<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends ConsumerState<MainNavigation> {
  int _currentIndex = 0;
  int _previousIndex = 0;

  List<Widget> get _screens {
    if (widget.user?.role == 'master') {
      return [
        const HomeScreen(),
        const OrdersScreen(), // Все заявки для мастера
        const CreateVideoScreen(), // Создать видеорекламу для мастера (placeholder)
        const MessagesScreen(),
        const ProfileScreen(),
      ];
    } else {
      return [
        const HomeScreen(),
        const OrdersScreen(), // Мои заявки для клиента
        const CreateOrderPage(), // Создать заказ для клиента (placeholder)
        const MessagesScreen(),
        const ProfileScreen(),
      ];
    }
  }

  void _handleNavigation(int index) {
    final isLoggedIn = widget.user != null;
    final isMaster = widget.user?.role == 'master';

    if (!isLoggedIn) {
      if (index == 0) {
        // Главная - уже на ней
      } else if (index == 1) {
        // Войти
        Navigator.pushNamed(context, '/registration-type');
      }
      return;
    }

    // Для центральной кнопки (index 2) - модальное окно или навигация
    if (index == 2) {
      if (isMaster) {
        Navigator.pushNamed(context, '/create-video');
      } else {
        Navigator.pushNamed(context, '/create-order');
      }
      return;
    }

    // Для остальных - обычная навигация
    setState(() {
      _previousIndex = _currentIndex;
      _currentIndex = index;
    });
    
    // Управляем воспроизведением видео
    // Пауза если уходим с главной (index 0)
    // Возобновление если возвращаемся
    ref.read(authProvider.notifier); // Добавляем импорт providers
    if (index == 0) {
      ref.read(isHomeActiveProvider.notifier).state = true;
    } else {
      ref.read(isHomeActiveProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoggedIn = widget.user != null;
    
    return Scaffold(
      extendBody: true, // Позволяет контенту идти под навигацию
      body: isLoggedIn
          ? IndexedStack(
              index: _currentIndex,
              children: _screens,
            )
          : const HomeScreen(),
      bottomNavigationBar: CustomBottomNavigation(
        currentIndex: _currentIndex,
        onTap: _handleNavigation,
        user: widget.user,
      ),
    );
  }
}