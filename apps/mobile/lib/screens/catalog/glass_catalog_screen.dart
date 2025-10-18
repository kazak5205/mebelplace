import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/glass/glass_panel.dart';
import '../../core/widgets/glass/glass_text_field.dart';
import '../../../../../core/theme/liquid_glass_colors.dart';
import '../../../../../core/theme/liquid_glass_text_styles.dart';

class GlassCatalogScreen extends ConsumerStatefulWidget {
  const GlassCatalogScreen({super.key});

  @override
  ConsumerState<GlassCatalogScreen> createState() => _GlassCatalogScreenState();
}

class _GlassCatalogScreenState extends ConsumerState<GlassCatalogScreen> {
  final _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Каталог товаров', style: LiquidGlassTextStyles.h3Light(isDark)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.8,
              ),
              itemCount: 20,
              itemBuilder: (context, index) => GlassPanel(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white12 : Colors.black12,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(child: Icon(Icons.image, size: 48)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Товар $index', style: LiquidGlassTextStyles.bodySmall.copyWith(color: isDark ? Colors.white : Colors.black)),
                    Text('${(index + 1) * 5000} ₸', style: LiquidGlassTextStyles.body.copyWith(color: LiquidGlassColors.primaryOrange, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

