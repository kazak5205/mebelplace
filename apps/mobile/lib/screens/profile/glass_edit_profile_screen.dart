import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';
import '../../features/auth/presentation/providers/auth_provider_export.dart';
import '../../features/auth/presentation/providers/auth_state.dart';
import '../../features/profile/presentation/providers/profile_provider.dart';

class GlassEditProfileScreen extends ConsumerStatefulWidget {
  const GlassEditProfileScreen({super.key});

  @override
  ConsumerState<GlassEditProfileScreen> createState() => _GlassEditProfileScreenState();
}

class _GlassEditProfileScreenState extends ConsumerState<GlassEditProfileScreen> {
  final _nameController = TextEditingController();
  final _bioController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final authState = ref.read(authProvider);
    if (authState is Authenticated) {
      _nameController.text = authState.user.username;
      _phoneController.text = authState.user.phone ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Редактировать профиль', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GlassPanel(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: LiquidGlassColors.primaryOrange,
                      child: const Icon(Icons.person_outlined, size: 50, color: Colors.white),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: LiquidGlassColors.primaryOrange,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt_outlined, size: 20, color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                GlassTextField(hint: 'Имя', controller: _nameController),
                const SizedBox(height: 16),
                GlassTextField(hint: 'О себе', controller: _bioController, maxLines: 3),
                const SizedBox(height: 16),
                GlassTextField(hint: 'Телефон', controller: _phoneController, keyboardType: TextInputType.phone),
                const SizedBox(height: 24),
                GlassButton.primary(
                  'Сохранить',
                  isLoading: _isSaving,
                  onTap: () async {
                    setState(() => _isSaving = true);

                    // Update profile via API
                    await ref.read(profileProvider.notifier).updateProfile(
                      username: _nameController.text,
                      phone: _phoneController.text,
                    );

                    if (context.mounted) {
                      setState(() => _isSaving = false);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Профиль обновлён'), backgroundColor: LiquidGlassColors.success),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _phoneController.dispose();
    super.dispose();
  }
}
