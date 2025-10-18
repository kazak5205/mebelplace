import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../presentation/pages/main_page.dart';

/// Main navigation wrapper - использует MainPage с glass экранами
class GlassMainNavigation extends ConsumerWidget {
  const GlassMainNavigation({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const MainPage();
  }
}

