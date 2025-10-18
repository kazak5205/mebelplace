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

class ArFurnitureViewerScreen extends ConsumerStatefulWidget {
  final String modelUrl;

  const ArFurnitureViewerScreen({
    super.key,
    required this.modelUrl,
  });

  @override
  ConsumerState<ArFurnitureViewerScreen> createState() => _ArFurnitureViewerScreenState();
}

class _ArFurnitureViewerScreenState extends ConsumerState<ArFurnitureViewerScreen> {
  final _storage = const FlutterSecureStorage();
  String? _currentModelUrl;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _currentModelUrl = widget.modelUrl;
    _loadModel();
  }

  Future<void> _loadModel() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() => _isLoading = false);
  }

  Future<void> _savePlacement() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/ar/sessions/placement'),
        headers: {
          'Authorization': 'Bearer ${token ?? ''}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'model_url': _currentModelUrl,
          'position': {'x': 0, 'y': 0, 'z': 0},
          'rotation': {'x': 0, 'y': 0, 'z': 0},
          'scale': 1.0,
        }),
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Размещение сохранено')),
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
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('AR Viewer', style: TextStyle(color: Colors.white)),
      ),
      body: Stack(
        children: [
          if (_currentModelUrl != null)
            ModelViewer(
              src: _currentModelUrl!,
              alt: 'Мебель 3D модель',
              ar: true,
              arModes: const ['scene-viewer', 'webxr', 'quick-look'],
              autoRotate: true,
              cameraControls: true,
              backgroundColor: const Color(0xFF000000),
              loading: Loading.eager,
              arPlacement: ArPlacement.floor,
            ),
          
          if (_isLoading)
            Container(
              color: Colors.black.withValues(alpha: 0.7),
              child: const Center(
                child: CircularProgressIndicator(
                  color: LiquidGlassColors.primaryOrange,
                ),
              ),
            ),
          
          Positioned(
            bottom: 32,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _savePlacement,
                    icon: const Icon(Icons.save),
                    label: const Text('Сохранить'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: LiquidGlassColors.primaryOrange,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    label: const Text('Закрыть'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
