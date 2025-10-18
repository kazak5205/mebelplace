import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider_export.dart';
import '../../features/auth/presentation/providers/auth_state.dart';
import '../../screens/auth/glass_login_screen.dart';
import '../../presentation/pages/main_page.dart';

/// Wrapper для проверки авторизации
class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return switch (authState) {
      AuthInitial() => const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      AuthLoading() => const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      Authenticated() => const MainPage(),
      Unauthenticated() => const GlassLoginScreen(),
      AuthError() => const GlassLoginScreen(),
    };
  }
}

