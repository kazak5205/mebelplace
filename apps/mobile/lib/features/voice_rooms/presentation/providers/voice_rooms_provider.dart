import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../domain/entities/voice_room_entity.dart';
import '../../../../core/config/api_config.dart';

sealed class VoiceRoomsState {}

class VoiceRoomsInitial extends VoiceRoomsState {}

class VoiceRoomsLoading extends VoiceRoomsState {}

class VoiceRoomsLoaded extends VoiceRoomsState {
  final List<VoiceRoomEntity> activeRooms;

  VoiceRoomsLoaded(this.activeRooms);
}

class VoiceRoomsError extends VoiceRoomsState {
  final String message;
  VoiceRoomsError(this.message);
}

class VoiceRoomsNotifier extends StateNotifier<VoiceRoomsState> {
  final _storage = const FlutterSecureStorage();

  VoiceRoomsNotifier() : super(VoiceRoomsInitial());

  Future<void> loadRooms() async {
    state = VoiceRoomsLoading();

    try {
      final token = await _storage.read(key: 'auth_token');

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/voice-rooms'),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final rooms = (data['rooms'] as List<dynamic>? ?? [])
            .map((r) => _roomFromJson(r))
            .toList();

        state = VoiceRoomsLoaded(rooms);
      } else {
        state = VoiceRoomsError('Failed to load rooms: ${response.statusCode}');
      }
    } catch (e) {
      state = VoiceRoomsError('Error loading rooms: $e');
    }
  }

  Future<String?> createRoom(String title, {String? description}) async {
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token == null) return null;

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/voice-rooms'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'title': title,
          'description': description,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        await loadRooms();
        return data['room_id'].toString();
      }
    } catch (e) {
      // Return null on error
    }
    return null;
  }

  VoiceRoomEntity _roomFromJson(Map<String, dynamic> json) {
    return VoiceRoomEntity(
      id: json['id'].toString(),
      title: json['title'] as String,
      description: json['description'] as String?,
      hostId: json['host_id'].toString(),
      hostName: json['host_name'] as String,
      hostAvatar: json['host_avatar'] as String?,
      participantsCount: json['participants_count'] as int? ?? 0,
      speakersCount: json['speakers_count'] as int? ?? 0,
      listenersCount: json['listeners_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      isActive: json['is_active'] as bool? ?? true,
      tags: (json['tags'] as List<dynamic>? ?? []).map((t) => t.toString()).toList(),
      agoraAppId: json['agora_app_id'] as String?,  // Backend provides these
      agoraToken: json['agora_token'] as String?,
    );
  }
}

final voiceRoomsProvider = StateNotifierProvider<VoiceRoomsNotifier, VoiceRoomsState>((ref) {
  return VoiceRoomsNotifier();
});

