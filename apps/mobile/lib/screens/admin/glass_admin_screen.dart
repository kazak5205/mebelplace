import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'glass_admin_panel_screen.dart';

/// Admin screen wrapper
class GlassAdminScreen extends ConsumerWidget {
  const GlassAdminScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const GlassAdminPanelScreen();
  }
}

