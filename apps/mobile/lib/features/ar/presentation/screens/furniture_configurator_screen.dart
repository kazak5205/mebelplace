import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/config/api_config.dart';
import 'ar_furniture_viewer_screen.dart';

class FurnitureConfiguratorScreen extends ConsumerStatefulWidget {
  const FurnitureConfiguratorScreen({super.key});

  @override
  ConsumerState<FurnitureConfiguratorScreen> createState() => _FurnitureConfiguratorScreenState();
}

class _FurnitureConfiguratorScreenState extends ConsumerState<FurnitureConfiguratorScreen> {
  final _storage = const FlutterSecureStorage();
  
  String _selectedMaterial = 'wood';
  String _selectedColor = '#8B4513';
  double _width = 2.0;
  double _height = 1.0;
  double _depth = 0.5;
  String _modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  Future<void> _saveConfiguration() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/configurator/configurations'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'product_id': 'furniture_1',
          'dimensions': {
            'width': _width,
            'height': _height,
            'depth': _depth,
          },
          'material': _selectedMaterial,
          'color': _selectedColor,
        }),
      );

      if (response.statusCode == 201 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Конфигурация сохранена')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e')),
        );
      }
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
        title: Text(
          '3D Конфигуратор',
          style: TextStyle(color: isDark ? Colors.white : Colors.black),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.view_in_ar),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ArFurnitureViewerScreen(modelUrl: _modelUrl),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 2,
            child: ModelViewer(
              src: _modelUrl,
              alt: '3D модель мебели',
              autoRotate: true,
              cameraControls: true,
              backgroundColor: isDark ? const Color(0xFF000000) : const Color(0xFFFFFFFF),
              loading: Loading.eager,
              arPlacement: ArPlacement.floor,
            ),
          ),
          
          Expanded(
            flex: 1,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Размеры (м)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDimensionSlider('Ширина', _width, 0.5, 5.0, (val) {
                    setState(() => _width = val);
                  }, isDark),
                  _buildDimensionSlider('Высота', _height, 0.5, 3.0, (val) {
                    setState(() => _height = val);
                  }, isDark),
                  _buildDimensionSlider('Глубина', _depth, 0.3, 2.0, (val) {
                    setState(() => _depth = val);
                  }, isDark),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saveConfiguration,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: LiquidGlassColors.primaryOrange,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Сохранить конфигурацию'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDimensionSlider(String label, double value, double min, double max, Function(double) onChanged, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: isDark ? Colors.white : Colors.black),
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: 20,
          label: value.toStringAsFixed(1),
          onChanged: onChanged,
          activeColor: LiquidGlassColors.primaryOrange,
        ),
        Text(
          '${value.toStringAsFixed(1)} м',
          style: TextStyle(fontSize: 10, color: isDark ? Colors.white54 : Colors.black54),
        ),
      ],
    );
  }
}
