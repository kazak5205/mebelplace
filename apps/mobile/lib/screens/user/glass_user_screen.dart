import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../profile/glass_user_profile_screen.dart';

class GlassUserScreen extends ConsumerWidget {
  final String userId;

  const GlassUserScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassUserProfileScreen(userId: userId);
  }
}

