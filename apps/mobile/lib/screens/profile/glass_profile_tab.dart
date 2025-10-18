import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../glass_profile_screen.dart';

/// Profile tab wrapper
class GlassProfileTab extends ConsumerWidget {
  const GlassProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const GlassProfileScreen();
  }
}

