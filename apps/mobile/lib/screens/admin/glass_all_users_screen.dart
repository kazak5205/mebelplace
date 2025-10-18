import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../core/widgets/glass/glass_chip.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/admin/presentation/providers/admin_provider.dart';

/// Glass All Users Screen - все пользователи
class GlassAllUsersScreen extends ConsumerStatefulWidget {
  const GlassAllUsersScreen({super.key});

  @override
  ConsumerState<GlassAllUsersScreen> createState() => _GlassAllUsersScreenState();
}

class _GlassAllUsersScreenState extends ConsumerState<GlassAllUsersScreen> {
  final _searchController = TextEditingController();
  String _filter = 'all';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final usersAsync = ref.watch(adminUsersProvider);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Пользователи', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: GlassTextField(
              hint: 'Поиск пользователей...',
              controller: _searchController,
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                GlassChip(label: 'Все', isActive: _filter == 'all', onTap: () => setState(() => _filter = 'all')),
                const SizedBox(width: 8),
                GlassChip(label: 'Клиенты', isActive: _filter == 'clients', onTap: () => setState(() => _filter = 'clients')),
                const SizedBox(width: 8),
                GlassChip(label: 'Мастера', isActive: _filter == 'masters', onTap: () => setState(() => _filter = 'masters')),
                const SizedBox(width: 8),
                GlassChip(label: 'Админы', isActive: _filter == 'admins', onTap: () => setState(() => _filter = 'admins')),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: usersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator(color: LiquidGlassColors.primaryOrange)),
              error: (err, stack) => Center(child: Text('Ошибка: $err', style: const TextStyle(color: Colors.red))),
              data: (users) {
                final filteredUsers = _filter == 'all' 
                  ? users 
                  : users.where((u) => u.role == (_filter == 'clients' ? 'client' : _filter == 'masters' ? 'master' : 'admin')).toList();

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: filteredUsers.length,
                  itemBuilder: (context, index) {
                    final user = filteredUsers[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassPanel(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: LiquidGlassColors.primaryOrange,
                              child: Text(user.username[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(user.username, style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black)),
                                  Text(user.email, style: LiquidGlassTextStyles.caption.copyWith(color: isDark ? Colors.white70 : Colors.black54)),
                                ],
                              ),
                            ),
                            Icon(Icons.arrow_forward_ios, size: 16, color: isDark ? Colors.white54 : Colors.black54),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
