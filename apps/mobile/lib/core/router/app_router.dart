import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Роутинг приложения MebelPlace
class AppRouter {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String main = '/main';
  static const String feed = '/feed';
  static const String search = '/search';
  static const String requests = '/requests';
  static const String chats = '/chats';
  static const String profile = '/profile';
  
  // Video
  static const String videoDetail = '/video/:id';
  static const String videoUpload = '/video/upload';
  
  // Search
  static const String searchResults = '/search/results';
  
  // Request
  static const String requestCreate = '/request/create';
  static const String requestDetail = '/request/:id';
  
  // Chat
  static const String chatDetail = '/chat/:id';
  
  // Profile
  static const String profileEdit = '/profile/edit';
  static const String profileSettings = '/profile/settings';
  static const String profileGamification = '/profile/gamification';
  static const String profileLeaderboard = '/profile/leaderboard';
  static const String profileAchievements = '/profile/achievements';
  
  // Master
  static const String masterProfile = '/master/profile';
  static const String masterProducts = '/master/products';
  
  static final GoRouter router = GoRouter(
    initialLocation: splash,
    debugLogDiagnostics: true,
    routes: [
      GoRoute(
        path: splash,
        builder: (context, state) => const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
}

