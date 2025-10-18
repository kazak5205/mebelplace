import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/widgets/glass/glass_screen_base.dart';
import '../core/widgets/glass/glass_text_field.dart';
import '../core/widgets/glass/glass_custom_widgets.dart';
import '../core/theme/liquid_glass_colors.dart';
import '../core/theme/liquid_glass_text_styles.dart';

class GlassCreateChatScreen extends ConsumerStatefulWidget {
  const GlassCreateChatScreen({super.key});

  @override
  ConsumerState<GlassCreateChatScreen> createState() => _GlassCreateChatScreenState();
}

class _GlassCreateChatScreenState extends ConsumerState<GlassCreateChatScreen> {
  final TextEditingController _searchController = TextEditingController();
  final List<String> _recentUsers = ['User1', 'User2', 'User3'];
  final List<String> _searchResults = [];

  void _searchUsers(String query) {
    setState(() {
      _searchResults.clear();
      if (query.isNotEmpty) {
        _searchResults.addAll(_recentUsers.where((user) => user.toLowerCase().contains(query.toLowerCase())));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return GlassScreenBase(
      title: 'Создать новый чат',
      showAppBar: true,
      showBackButton: true,
      backgroundColor: LiquidGlassColors.darkGlass,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Найти пользователя...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: _searchUsers,
            ),
            const SizedBox(height: 20),
            if (_searchController.text.isEmpty)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Недавние чаты',
                      style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white70),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _recentUsers.length,
                        itemBuilder: (context, index) {
                          return _buildUserTile(_recentUsers[index]);
                        },
                      ),
                    ),
                  ],
                ),
              )
            else if (_searchResults.isNotEmpty)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Результаты поиска',
                      style: LiquidGlassTextStyles.h3.copyWith(color: Colors.white70),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _searchResults.length,
                        itemBuilder: (context, index) {
                          return _buildUserTile(_searchResults[index]);
                        },
                      ),
                    ),
                  ],
                ),
              )
            else
              Expanded(
                child: Center(
                  child: Text(
                    'Пользователь не найден',
                    style: LiquidGlassTextStyles.body.copyWith(color: Colors.white54),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserTile(String username) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GlassButton(
        text: username,
        onTap: () {
          context.pop();
        },
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      ),
    );
  }
}