import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/config/api_config.dart';

class MastersMapScreen extends ConsumerStatefulWidget {
  const MastersMapScreen({super.key});

  @override
  ConsumerState<MastersMapScreen> createState() => _MastersMapScreenState();
}

class _MastersMapScreenState extends ConsumerState<MastersMapScreen> {
  GoogleMapController? _mapController;
  final _storage = const FlutterSecureStorage();
  Position? _currentPosition;
  Set<Marker> _markers = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoading = true);
    
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      
      final position = await Geolocator.getCurrentPosition();
      setState(() => _currentPosition = position);
      
      await _loadNearbyMasters(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('Error getting location: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadNearbyMasters(double lat, double lng) async {
    setState(() => _isLoading = true);

    try {
      final token = await _storage.read(key: 'auth_token');
      
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/maps/nearby?lat=$lat&lng=$lng&radius=10000'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final masters = data['masters'] as List<dynamic>;
        
        setState(() {
          _markers = masters.map((master) {
            return Marker(
              markerId: MarkerId(master['id'].toString()),
              position: LatLng(
                master['latitude'] as double,
                master['longitude'] as double,
              ),
              infoWindow: InfoWindow(
                title: master['name'] as String,
                snippet: master['category'] as String?,
              ),
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
            );
          }).toSet();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка загрузки: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
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
        title: Text('Мастера на карте', style: LiquidGlassTextStyles.h3Light(isDark)),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _currentPosition != null
                ? () {
                    _mapController?.animateCamera(
                      CameraUpdate.newLatLngZoom(
                        LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                        14,
                      ),
                    );
                  }
                : null,
          ),
        ],
      ),
      body: _currentPosition == null
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                    zoom: 14,
                  ),
                  markers: _markers,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  onMapCreated: (controller) => _mapController = controller,
                  mapType: MapType.normal,
                ),
                
                if (_isLoading)
                  Positioned(
                    top: 16,
                    left: 16,
                    right: 16,
                    child: GlassPanel(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: LiquidGlassColors.primaryOrange),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Загрузка мастеров...',
                            style: LiquidGlassTextStyles.body.copyWith(color: isDark ? Colors.white : Colors.black),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
