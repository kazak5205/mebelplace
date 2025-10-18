import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../glass_search_screen.dart';

class GlassSearchTab extends ConsumerWidget {
  const GlassSearchTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const GlassSearchScreen();
  }
}

